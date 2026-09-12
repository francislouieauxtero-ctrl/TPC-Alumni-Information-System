<?php

namespace App\Services;

use App\Models\User;
use App\Models\AlumniProfile;
use App\Models\AccountActivityLog;
use App\Repositories\AlumniRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AlumniService
{
    protected AlumniRepository $alumniRepository;

    public function __construct(AlumniRepository $alumniRepository)
    {
        $this->alumniRepository = $alumniRepository;
    }

    /**
     * Get all alumni
     */
    public function getAll(User $actor, array $filters = []): LengthAwarePaginator
    {
        return $this->alumniRepository->all($actor, $filters);
    }

    // ─── Profile ──────────────────────────────────────────────────────────────

    /**
     * Get alumni profile by user ID
     */
    public function getProfileByUserId(int $userId): ?AlumniProfile
    {
        return $this->alumniRepository->findByUserId($userId);
    }

    /**
     * Update alumni profile
     */
    public function updateProfile(AlumniProfile $profile, array $data): AlumniProfile
    {
        return $this->alumniRepository->update($profile, $data);
    }

    // ─── Work Alignment ───────────────────────────────────────────────────────

    /**
     * Record the alumni's self-reported answer to:
     * "Is your current job aligned with your course?"
     *
     * - Silently skips if the alumni is unemployed (no job = nothing to align).
     * - Called from the profile/employment update flow after the alumni
     *   submits the alignment question in the form.
     */
    public function updateWorkAlignment(
        AlumniProfile $profile,
        bool $isAligned,
        ?string $reason = null,
    ): AlumniProfile {
        if ($profile->employment_status === AlumniProfile::STATUS_UNEMPLOYED) {
            return $profile;
        }

        return $this->alumniRepository->update($profile, [
            'is_work_aligned'     => $isAligned,
            'work_aligned_reason' => $reason,
        ]);
    }

    /**
     * Clear the alignment answer when an alumni loses their job.
     *
     * Call this inside whatever service handles job history changes,
     * right after syncEmploymentStatus() sets status back to unemployed.
     *
     * Example:
     *   $profile->syncEmploymentStatus();
     *   if ($profile->employment_status === AlumniProfile::STATUS_UNEMPLOYED) {
     *       $this->alumniService->resetWorkAlignment($profile);
     *   }
     */
    public function resetWorkAlignment(AlumniProfile $profile): AlumniProfile
    {
        return $this->alumniRepository->update($profile, [
            'is_work_aligned'     => null,
            'work_aligned_reason' => null,
        ]);
    }

    // ─── Reporting ────────────────────────────────────────────────────────────

    /**
     * Alignment summary grouped by department — for the admin dashboard.
     *
     * Passes actor so admins are automatically scoped to their department.
     * Super admins see all departments.
     */
    public function getAlignmentSummary(User $actor, array $filters = []): Collection
    {
        return $this->alumniRepository->getAlignmentSummaryByDepartment($actor, $filters);
    }

    /**
     * Per-alumni alignment detail for a specific department — drill-down view.
     */
    public function getAlignmentDetail(int $departmentId): LengthAwarePaginator
    {
        return $this->alumniRepository->getAlignmentDetailByDepartment($departmentId);
    }
}