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
    public function allVisible(User $actor, array $filters = []): LengthAwarePaginator
    {
        $query = Event::with('creator', 'department');

        // Super admin sees all
        if (!$actor->isSuperAdmin()) {
            // Admin and users see school_wide + their department events
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

        // Filter by scope
        if (isset($filters['scope'])) {
            $query->where('scope', $filters['scope']);
        }

        // Filter by department
        if (isset($filters['department_id']) && $actor->isSuperAdmin()) {
            $query->where('department_id', $filters['department_id']);
        }

        // Include past events
        $includePast = $filters['include_past'] ?? false;
        if (!$includePast) {
            $query->where('event_date', '>=', now());
        }

        // Search
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    /**
     * Get all events (admin only - no scope filtering)
     */
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Event::with('creator', 'department');

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
        return Event::with('creator', 'department')->find($id);
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
