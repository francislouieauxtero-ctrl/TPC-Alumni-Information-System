<?php

namespace App\Repositories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AnnouncementRepository
{
    public function allVisible(User $actor, array $filters = []): LengthAwarePaginator|\Illuminate\Support\Collection
    {
        $query = Announcement::query()->with([
            'creator:id,name,avatar,role',
            'department:id,name',
        ]);

        if (!$actor->isSuperAdmin()) {
            $query->where(function ($q) use ($actor) {
                $q->where('scope', Announcement::SCOPE_SCHOOL_WIDE);

                if ($actor->department_id) {
                    $q->orWhere(function ($subQ) use ($actor) {
                        $subQ->where('scope', Announcement::SCOPE_DEPARTMENT_SPECIFIC)
                            ->where('department_id', $actor->department_id);
                    });
                }
            });
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (isset($filters['limit']) && is_numeric($filters['limit']) && (int) $filters['limit'] > 0) {
            return $query->orderBy('created_at', 'desc')
                ->limit((int) $filters['limit'])
                ->get();
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function find(int $id): ?Announcement
    {
        return Announcement::with([
            'creator:id,name,avatar,role',
            'department:id,name',
        ])->find($id);
    }

    public function create(array $data): Announcement
    {
        return Announcement::create($data);
    }

    public function update(Announcement $announcement, array $data): Announcement
    {
        $announcement->update($data);

        return $announcement;
    }

    public function delete(Announcement $announcement): bool
    {
        return $announcement->delete();
    }
}
