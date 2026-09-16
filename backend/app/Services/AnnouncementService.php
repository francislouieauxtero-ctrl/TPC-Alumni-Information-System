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

            if (array_key_exists('images', $data) && !empty($data['images'])) {
                $data['images'] = $this->storeImages($data['images']);
            } elseif (array_key_exists('images', $data)) {
                unset($data['images']);
            }

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

    protected function storeImages(array $images): array
    {
        $storedImages = [];

        foreach ($images as $image) {
            if ($image instanceof \Illuminate\Http\UploadedFile) {
                $path = $image->store('announcements', 'public');
                $storedImages[] = Storage::url($path);
                continue;
            }

            if (is_string($image)) {
                $storedImages[] = $image;
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

            $targetRoles = [User::ROLE_USER, User::ROLE_ADMIN];

            $query = User::whereIn('role', $targetRoles)
                ->where('status', User::STATUS_ACTIVE);

            // Removing department filter as requested: ALL announcements go to ALL students
            // if ($announcement->scope === Announcement::SCOPE_DEPARTMENT_SPECIFIC) {
            //     $query->where('department_id', $announcement->department_id);
            // }

            $recipients = $query->get();

            foreach ($recipients as $recipient) {
                try {
                    Mail::to($recipient->email)->queue(new AnnouncementNotificationMail($announcement, $recipient, $creatorName));
                } catch (\Throwable $e) {
                    Log::error("Failed to queue announcement notification email for recipient [{$recipient->id}] ({$recipient->email}): " . $e->getMessage(), [
                        'announcement_id' => $announcement->id,
                        'recipient_id' => $recipient->id,
                        'recipient_email' => $recipient->email,
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
