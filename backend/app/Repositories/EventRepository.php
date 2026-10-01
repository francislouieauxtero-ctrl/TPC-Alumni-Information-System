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
            'reactions:id,user_id,reactable_type,reactable_id,type',
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

        $includePast = filter_var($filters['include_past'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $onlyPast = filter_var($filters['only_past'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($onlyPast) {
            $query->where('event_date', '<', now());
        } elseif (!$includePast) {
            $query->where('event_date', '>=', now());
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? null;
        $sortDirection = strtolower($filters['sort_direction'] ?? '');

        if ($sortBy === 'event_date') {
            $orderColumn = 'event_date';
            $orderDir = $sortDirection === 'desc' ? 'desc' : 'asc';
        } else {
            // Default ordering: latest posts on top (created_at DESC)
            $orderColumn = 'created_at';
            $orderDir = $sortDirection === 'asc' ? 'asc' : 'desc';
        }

        if (isset($filters['limit']) && is_numeric($filters['limit']) && (int) $filters['limit'] > 0) {
            $limit = min((int) $filters['limit'], 50);
            return $query->orderBy($orderColumn, $orderDir)
                ->limit($limit)
                ->get();
        }

        $perPage = isset($filters['per_page']) && is_numeric($filters['per_page']) ? (int) $filters['per_page'] : 15;
        $perPage = max(1, min($perPage, 50));

        return $query->orderBy($orderColumn, $orderDir)->paginate($perPage);
    }

    /**
     * Get all events (admin only - no scope filtering)
     */
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Event::with([
            'creator:id,name,avatar,role',
            'department:id,name',
            'reactions:id,user_id,reactable_type,reactable_id,type',
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

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = strtolower($filters['sort_direction'] ?? 'desc');
        $orderColumn = in_array($sortBy, ['event_date', 'created_at']) ? $sortBy : 'created_at';
        $orderDir = $sortDirection === 'asc' ? 'asc' : 'desc';

        $perPage = isset($filters['per_page']) && is_numeric($filters['per_page']) ? (int) $filters['per_page'] : 15;
        $perPage = max(1, min($perPage, 50));

        return $query->orderBy($orderColumn, $orderDir)->paginate($perPage);
    }

    /**
     * Find event by ID
     */
    public function find(int $id): ?Event
    {
        return Event::with([
            'creator:id,name,avatar,role',
            'department:id,name',
            'reactions:id,user_id,reactable_type,reactable_id,type',
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
