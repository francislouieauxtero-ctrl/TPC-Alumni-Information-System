<?php

namespace App\Repositories;

use App\Models\AccountActivityLog;
use App\Models\AlumniProfile;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AlumniRepository
{
    public function pendingAlumni(User $actor): LengthAwarePaginator
    {
        $query = User::where('role', User::ROLE_USER)
            ->where('is_verified', false)
            ->where('status', User::STATUS_ACTIVE)
            ->orderBy('created_at', 'desc');

        if ($actor->isAdmin()) {
            $query->where('department_id', $actor->department_id);
        }

        return $query->paginate(15);
    }

    public function rejectedAlumni(User $actor): LengthAwarePaginator
    {
        $query = AccountActivityLog::query()
            ->where('action', 'rejected_alumni')
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->orderByDesc('created_at');

        if ($actor->isAdmin()) {
            $query->where('actor_id', $actor->id);
        }

        return $query->paginate(15);
    }

    public function deleteRejected(int $rejectionId, User $actor): bool
    {
        $query = AccountActivityLog::query()
            ->whereKey($rejectionId)
            ->where('action', 'rejected_alumni');

        if ($actor->isAdmin()) {
            $query->where('actor_id', $actor->id);
        }

        return (bool) $query->delete();
    }

    public function all(User $actor, array $filters = []): LengthAwarePaginator
    {
        $query = AlumniProfile::with('user', 'department')
            ->whereHas('user', function ($q) {
                $q->where('is_verified', true);
            });

        if ($actor->isAdmin()) {
            $query->where('department_id', $actor->department_id);
        }

        if (isset($filters['employment_status'])) {
            $query->where('employment_status', $filters['employment_status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function find(int $id): ?AlumniProfile
    {
        return AlumniProfile::find($id);
    }

    public function findByUserId(int $userId): ?AlumniProfile
    {
        return AlumniProfile::where('user_id', $userId)->first();
    }

    public function create(array $data): AlumniProfile
    {
        return AlumniProfile::create($data);
    }

    public function update(AlumniProfile $profile, array $data): AlumniProfile
    {
        $profile->update($data);

        return $profile;
    }

    public function delete(AlumniProfile $profile): bool
    {
        return $profile->delete();
    }

    // ─── Alignment Reporting ──────────────────────────────────────────────────

    /**
     * Alignment summary grouped by department — used for the admin dashboard.
     *
     * Columns returned per department:
     *   total_employed  — employed/self-employed alumni count
     *   aligned         — answered YES
     *   not_aligned     — answered NO
     *   no_response     — employed but haven't answered yet
     *   alignment_rate  — % of respondents who said YES (excludes no_response)
     *
     * Unemployed alumni are excluded because the question does not apply to them.
     *
     * Admin actors are scoped to their own department automatically.
     */
    public function getAlignmentSummaryByDepartment(User $actor, array $filters = []): Collection
    {
        $query = AlumniProfile::query()
            ->selectRaw("
                department_id,
                COUNT(*)                                                        AS total_employed,
                SUM(is_work_aligned = 1)                                        AS aligned,
                SUM(is_work_aligned = 0)                                        AS not_aligned,
                SUM(is_work_aligned IS NULL)                                    AS no_response,
                ROUND(
                    SUM(is_work_aligned = 1) /
                    NULLIF(SUM(is_work_aligned IS NOT NULL), 0) * 100
                , 1)                                                            AS alignment_rate
            ")
            ->employed()   // scope on AlumniProfile: excludes STATUS_UNEMPLOYED
            ->groupBy('department_id')
            ->with('department:id,name');

        if ($actor->isAdmin()) {
            $query->where('department_id', $actor->department_id);
        }

        if (!empty($filters['department_id'])) {
            $query->where('department_id', (int) $filters['department_id']);
        }

        if (!empty($filters['batch'])) {
            $query->where('batch_year', trim((string) $filters['batch']));
        }

        $notRegisteredByDepartment = Graduate::query()
            ->whereDoesntHave('alumniProfile')
            ->when($actor->isAdmin(), fn ($q) =>
                $q->where('department_id', $actor->department_id))
            ->when(!empty($filters['department_id']), fn ($q) =>
                $q->where('department_id', (int) $filters['department_id']))
            ->when(!empty($filters['batch']), fn ($q) =>
                $q->where('batch_year', trim((string) $filters['batch'])))
            ->selectRaw('department_id, COUNT(*) as total')
            ->groupBy('department_id')
            ->pluck('total', 'department_id');

        return $query->get()->map(function ($row) use ($notRegisteredByDepartment) {
            $row->not_registered = (int) ($notRegisteredByDepartment[$row->department_id] ?? 0);
            return $row;
        });
    }

    /**
     * Per-alumni alignment list for a specific department — drill-down view.
     *
     * Sorted so unanswered (null) entries appear first, then not-aligned,
     * then aligned — making it easy to follow up with non-respondents.
     */
    public function getAlignmentDetailByDepartment(int $departmentId): LengthAwarePaginator
    {
        return AlumniProfile::query()
            ->where('department_id', $departmentId)
            ->employed()
            ->with([
                'user:id,name,email',
                'department:id,name',
            ])
            ->select([
                'id',
                'user_id',
                'department_id',
                'current_job',
                'company',
                'employment_status',
                'is_work_aligned',
                'work_aligned_reason',
                'batch_year',
            ])
            ->orderByRaw('is_work_aligned IS NULL DESC')  // unanswered first
            ->orderBy('is_work_aligned')                  // not_aligned before aligned
            ->paginate(20);
    }
}