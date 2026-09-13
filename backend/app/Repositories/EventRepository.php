<?php

namespace App\Repositories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class EventRepository
{
    /**
     * Get all events visible to user
     */
    public function allVisible(User $actor, array $filters = []): LengthAwarePaginator|\Illuminate\Support\Collection
    {
        $query = Event::query()->with([
            'creator:id,name,avatar,role',
            'department:id,name',
        ]);

        if (!$actor->isSuperAdmin()) {
            if ($actor->isAdmin() || $actor->isStudent()) {
                $query->where(function ($q) use ($actor) {
                    $q->where('scope', Event::SCOPE_SCHOOL_WIDE);

                    if ($actor->department_id) {
                        $q->orWhere(function ($subQ) use ($actor) {
                            $subQ->where('scope', Event::SCOPE_DEPARTMENT_SPECIFIC)
                                ->where('department_id', $actor->department_id);
                        });
                    }
                });
            }
        }

        if (isset($filters['scope'])) {
            $query->where('scope', $filters['scope']);
        }

        if (isset($filters['department_id']) && $actor->isSuperAdmin()) {
            $query->where('department_id', $filters['department_id']);
        }

        $includePast = $filters['include_past'] ?? false;
        if (!$includePast) {
            $query->where('event_date', '>=', now());
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['limit']) && is_numeric($filters['limit']) && (int) $filters['limit'] > 0) {
            return $query->orderBy('created_at', 'desc')
                ->limit((int) $filters['limit'])
                ->get();
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    /**
     * Get all events (admin only - no scope filtering)
     */
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Event::with([
            'creator:id,name,avatar,role',
            'department:id,name',
        ]);

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('event_date', 'desc')->paginate(15);
    }

    /**
     * Find event by ID
     */
    public function find(int $id): ?Event
    {
        return Event::with([
            'creator:id,name,avatar,role',
            'department:id,name',
        ])->find($id);
    }

    /**
     * Create event
     */
    public function create(array $data): Event
    {
        return Event::create($data);
    }

    /**
     * Update event
     */
    public function update(Event $event, array $data): Event
    {
        $event->update($data);
        return $event;
    }

    /**
     * Delete event
     */
    public function delete(Event $event): bool
    {
        return $event->delete();
    }
}
