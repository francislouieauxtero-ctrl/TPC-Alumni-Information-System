<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;
use App\Models\AccountActivityLog;
use App\Repositories\EventRepository;
use App\Mail\EventNotificationMail;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class EventService
{
    protected EventRepository $eventRepository;

    public function __construct(EventRepository $eventRepository)
    {
        $this->eventRepository = $eventRepository;
    }

    /**
     * Get all visible events for user
     */
    public function getVisibleEvents(User $actor, array $filters = []): LengthAwarePaginator
    {
        return $this->eventRepository->allVisible($actor, $filters);
    }

    /**
     * Get all events (admin only)
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->eventRepository->all($filters);
    }

    /**
     * Get event by ID
     */
    public function getById(int $id): ?Event
    {
        return $this->eventRepository->find($id);
    }

    /**
     * Create event
     */
    public function create(User $creator, array $data): Event
    {
        return DB::transaction(function () use ($creator, $data) {
            $data['created_by'] = $creator->id;

            if ($creator->isAdmin()) {
                $data['scope'] = Event::SCOPE_DEPARTMENT_SPECIFIC;
                $data['department_id'] = $creator->department_id;
            }

            // handle attachments if present (UploadedFile[])
            $attachments = [];
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $file) {
                    if (!$file) continue;
                    $path = $file->store('events', 'public');
                    $attachments[] = [
                        'path' => $path,
                        'url' => Storage::url($path),
                        'name' => $file->getClientOriginalName(),
                    ];
                }
            }

            if (!empty($attachments)) {
                $data['attachments'] = $attachments;
            }

            $event = $this->eventRepository->create($data);

            // Log the action
            AccountActivityLog::create([
                'actor_id' => $creator->id,
                'action' => 'created_event',
                'metadata' => [
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                ],
            ]);

            // Queue notification emails to recipients
            $this->queueEventNotifications($event);

            return $event;
        });
    }

    /**
     * Update event
     */
    public function update(Event $event, User $actor, array $data): Event
    {
        return DB::transaction(function () use ($event, $actor, $data) {
            if ($actor->isAdmin()) {
                $data['scope'] = Event::SCOPE_DEPARTMENT_SPECIFIC;
                $data['department_id'] = $actor->department_id;
            }

            // Load existing attachments
            $existing = $event->attachments ?? [];

            // Handle removed attachments (array of url or path)
            if (!empty($data['removed_attachments'])) {
                $toRemove = $data['removed_attachments'];
                $remaining = [];
                foreach ($existing as $att) {
                    $keep = true;
                    foreach ($toRemove as $r) {
                        if (isset($att['url']) && $att['url'] === $r) {
                            // delete file by path
                            if (isset($att['path'])) Storage::disk('public')->delete($att['path']);
                            $keep = false;
                            break;
                        }
                    }
                    if ($keep) $remaining[] = $att;
                }
                $existing = $remaining;
            }

            // Handle new uploaded attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $file) {
                    if (!$file) continue;
                    $path = $file->store('events', 'public');
                    $existing[] = [
                        'path' => $path,
                        'url' => Storage::url($path),
                        'name' => $file->getClientOriginalName(),
                    ];
                }
            }

            if (!empty($existing)) {
                $data['attachments'] = $existing;
            } else {
                $data['attachments'] = null;
            }

            $updated = $this->eventRepository->update($event, $data);

            // Log the action
            AccountActivityLog::create([
                'actor_id' => $actor->id,
                'action' => 'updated_event',
                'metadata' => [
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                ],
            ]);

            return $updated;
        });
    }

    /**
     * Delete event
     */
    public function delete(Event $event, User $actor): bool
    {
        return DB::transaction(function () use ($event, $actor) {
            $deleted = $this->eventRepository->delete($event);

            if ($deleted) {
                // Log the action
                AccountActivityLog::create([
                    'actor_id' => $actor->id,
                    'action' => 'deleted_event',
                    'metadata' => [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                    ],
                ]);
            }

            return $deleted;
        });
    }

    /**
     * Queue event notification emails to relevant recipients
     */
    protected function queueEventNotifications(Event $event): void
    {
        // Load creator to get name
        $event->load('creator');
        $creatorName = $event->creator->name;

        $recipients = $event->scope === Event::SCOPE_DEPARTMENT_SPECIFIC
            ? User::where('department_id', $event->department_id)
                ->where('role', User::ROLE_USER)
                ->where('status', User::STATUS_ACTIVE)
                ->get()
            : User::where('role', User::ROLE_USER)
                ->where('status', User::STATUS_ACTIVE)
                ->get();

        foreach ($recipients as $recipient) {
            Mail::to($recipient->email)->queue(new EventNotificationMail($event, $recipient, $creatorName));
        }
    }
}
