<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\User;
use App\Repositories\AnnouncementRepository;
use App\Mail\AnnouncementNotificationMail;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\AccountActivityLog;

class AnnouncementService
{
    protected AnnouncementRepository $announcementRepository;

    public function __construct(AnnouncementRepository $announcementRepository)
    {
        $this->announcementRepository = $announcementRepository;
    }

    public function getVisibleAnnouncements(User $actor, array $filters = []): LengthAwarePaginator|\Illuminate\Support\Collection
    {
        return $this->announcementRepository->allVisible($actor, $filters);
    }

    public function getById(int $id): ?Announcement
    {
        return $this->announcementRepository->find($id);
    }

    public function create(User $creator, array $data): Announcement
    {
        $announcement = DB::transaction(function () use ($creator, $data) {
            $data['created_by'] = $creator->id;

            if ($creator->isAdmin()) {
                $data['scope'] = Announcement::SCOPE_DEPARTMENT_SPECIFIC;
                $data['department_id'] = $creator->department_id;
            }

            if (array_key_exists('images', $data)) {
                $data['images'] = $this->storeImages($data['images'] ?? []);
            }

            $announcement = $this->announcementRepository->create($data);

            AccountActivityLog::create([
                'actor_id' => $creator->id,
                'action' => 'created_announcement',
                'metadata' => [
                    'announcement_id' => $announcement->id,
                    'title' => $announcement->title,
                ],
            ]);

            // Dispatch notifications strictly after transaction has successfully committed
            DB::afterCommit(function () use ($announcement) {
                $this->queueAnnouncementNotifications($announcement);
            });

            return $announcement;
        });

        return $announcement;
    }

    public function update(Announcement $announcement, User $actor, array $data): Announcement
    {
        return DB::transaction(function () use ($announcement, $actor, $data) {
            if ($actor->isAdmin()) {
                $data['scope'] = Announcement::SCOPE_DEPARTMENT_SPECIFIC;
                $data['department_id'] = $actor->department_id;
            }

            // Start with existing images
            $existingImages = $announcement->images ?? [];

            // 1. Handle removed images
            if (!empty($data['removed_images']) && is_array($data['removed_images'])) {
                $toRemove = $data['removed_images'];
                $remaining = [];
                foreach ($existingImages as $img) {
                    $shouldRemove = false;
                    foreach ($toRemove as $r) {
                        if (
                            $img === $r ||
                            ($this->getStoragePath($img) && $this->getStoragePath($img) === $this->getStoragePath($r))
                        ) {
                            $shouldRemove = true;
                            $diskPath = $this->getStoragePath($img);
                            if ($diskPath && Storage::disk('public')->exists($diskPath)) {
                                Storage::disk('public')->delete($diskPath);
                            }
                            break;
                        }
                    }
                    if (!$shouldRemove) {
                        $remaining[] = $img;
                    }
                }
                $existingImages = $remaining;
            }

            // 2. Handle new uploaded images
            if (!empty($data['images']) && is_array($data['images'])) {
                $newImages = $this->storeImages($data['images']);
                $existingImages = array_merge($existingImages, $newImages);
            }

            // Only update 'images' attribute if images were added or removed
            if (array_key_exists('images', $data) || array_key_exists('removed_images', $data)) {
                $data['images'] = !empty($existingImages) ? array_values($existingImages) : null;
            } else {
                unset($data['images']);
            }
            unset($data['removed_images']);

            $announcement = $this->announcementRepository->update($announcement, $data);

            AccountActivityLog::create([
                'actor_id' => $actor->id,
                'action' => 'updated_announcement',
                'metadata' => [
                    'announcement_id' => $announcement->id,
                    'title' => $announcement->title,
                ],
            ]);

            return $announcement;
        });
    }

    public function delete(Announcement $announcement, User $actor): bool
    {
        return DB::transaction(function () use ($announcement, $actor) {
            $deleted = $this->announcementRepository->delete($announcement);

            if ($deleted) {
                AccountActivityLog::create([
                    'actor_id' => $actor->id,
                    'action' => 'deleted_announcement',
                    'metadata' => [
                        'announcement_id' => $announcement->id,
                        'title' => $announcement->title,
                    ],
                ]);
            }

            return $deleted;
        });
    }

    protected function getStoragePath(string $urlOrPath): ?string
    {
        $clean = $urlOrPath;
        if (str_starts_with($clean, 'http://') || str_starts_with($clean, 'https://')) {
            $clean = parse_url($clean, PHP_URL_PATH) ?? '';
        }
        $clean = ltrim($clean, '/');
        if (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, 8);
        }
        return $clean ?: null;
    }

    protected function storeImages(array $images): array
    {
        $storedImages = [];

        foreach ($images as $image) {
            if ($image instanceof \Illuminate\Http\UploadedFile) {
                $path = $image->store('announcements', 'public');
                $storedImages[] = '/storage/' . $path;
                continue;
            }

            if (is_string($image)) {
                if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
                    $p = parse_url($image, PHP_URL_PATH);
                    $storedImages[] = $p ?: $image;
                } else {
                    $storedImages[] = str_starts_with($image, '/storage/') ? $image : ('/storage/' . ltrim($image, '/'));
                }
            }
        }

        return $storedImages;
    }

    /**
     * Queue announcement notification emails to relevant recipients
     */
    protected function queueAnnouncementNotifications(Announcement $announcement): void
    {
        try {
            // Load creator to get name
            $announcement->load('creator');
            $creatorName = $announcement->creator?->name ?? 'Administrator';

            $targetRoles = [User::ROLE_USER, User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN];

            $query = User::whereIn('role', $targetRoles)
                ->where('status', User::STATUS_ACTIVE);

            // Removing department filter as requested: ALL announcements go to ALL students
            // if ($announcement->scope === Announcement::SCOPE_DEPARTMENT_SPECIFIC) {
            //     $query->where('department_id', $announcement->department_id);
            // }

            $recipients = $query->pluck('email')->toArray();

            if (!empty($recipients)) {
                try {
                    // Send one mass email using BCC to avoid timeouts and SMTP limits
                    Mail::bcc($recipients)->send(new AnnouncementNotificationMail($announcement, $creatorName));
                } catch (\Throwable $e) {
                    Log::error("Failed to send mass announcement notification email: " . $e->getMessage(), [
                        'announcement_id' => $announcement->id,
                        'exception' => $e,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error("Failed to dispatch announcement notification emails: " . $e->getMessage(), [
                'announcement_id' => $announcement->id,
                'exception' => $e,
            ]);
        }
    }
}
