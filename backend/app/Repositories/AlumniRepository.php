<?php

namespace App\Repositories;

use App\Models\AccountActivityLog;
use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AlumniRepository
{
    public function all(User $actor, array $filters = []): LengthAwarePaginator
    {
        $query = AlumniProfile::with(['user', 'department', 'graduate'])
            ->whereHas('user', function ($q) {
                $q->where('is_verified', true);
            });

        if ($actor->isAdmin()) {
            $query->where('department_id', $actor->department_id);
        } elseif (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['batch_year'])) {
            $batchYear = $filters['batch_year'];
            $query->where(function ($q) use ($batchYear) {
                $q->where('batch_year', $batchYear)
                    ->orWhereHas('graduate', function ($gradQuery) use ($batchYear) {
                        $gradQuery->where('batch_year', $batchYear);
                    });
            });
        }

        if (isset($filters['employment_status']) && $filters['employment_status'] !== '') {
            $query->where('employment_status', $filters['employment_status']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('school_id', 'like', "%{$search}%");
                })->orWhereHas('graduate', function ($gradQuery) use ($search) {
                    $gradQuery->where('student_number', 'like', "%{$search}%");
                });
            });
        }

        $perPage = isset($filters['per_page']) && is_numeric($filters['per_page'])
            ? (int) $filters['per_page']
            : 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
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
            ->whereHas('department')
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

        $alignmentByDepartment = $query->get()->keyBy('department_id');
        $departments = Department::query()
            ->when($actor->isAdmin(), fn ($q) =>
                $q->whereKey($actor->department_id))
            ->when(!empty($filters['department_id']), fn ($q) =>
                $q->whereKey((int) $filters['department_id']))
            ->get(['id', 'name']);

        return $departments->map(function ($department) use (
            $alignmentByDepartment,
            $notRegisteredByDepartment
        ) {
            $row = $alignmentByDepartment->get($department->id);

            if (!$row) {
                $row = (object) [
                    'department_id' => $department->id,
                    'total_employed' => 0,
                    'aligned' => 0,
                    'not_aligned' => 0,
                    'no_response' => 0,
                    'alignment_rate' => 0,
                    'department' => $department,
                ];
            }

            $row->not_registered = (int) ($notRegisteredByDepartment[$department->id] ?? 0);
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