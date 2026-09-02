<?php

namespace App\Services;

use App\Models\User;
use App\Models\AlumniProfile;
use App\Models\AccountActivityLog;
use App\Repositories\AlumniRepository;
use App\Mail\AccountApprovedMail;
use App\Mail\AccountRejectedMail;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AlumniService
{
    protected AlumniRepository $alumniRepository;

    public function __construct(AlumniRepository $alumniRepository)
    {
        $this->alumniRepository = $alumniRepository;
    }

    // ─── Approval Flow ────────────────────────────────────────────────────────

    /**
     * Get pending alumni awaiting approval
     */
    public function getPendingAlumni(User $actor): LengthAwarePaginator
    {
        return $this->alumniRepository->pendingAlumni($actor);
    }

    /**
     * Get rejected alumni registrations
     */
    public function getRejectedAlumni(User $actor): LengthAwarePaginator
    {
        return $this->alumniRepository->rejectedAlumni($actor);
    }

    /**
     * Get all alumni
     */
    public function getAll(User $actor, array $filters = []): LengthAwarePaginator
    {
        return $this->alumniRepository->all($actor, $filters);
    }

    /**
     * Approve alumni (set verified and create profile)
     */
    public function approveAlumni(User $alumni, User $actor): AlumniProfile
    {
        return DB::transaction(function () use ($alumni, $actor) {
            // Mark user as verified
            $alumni->update([
                'is_verified' => true,
                'status'      => User::STATUS_ACTIVE,
            ]);

            // Pull graduate record via school_id → student_number
            $graduate = $alumni->graduate;

            // Create or update alumni profile
            $profile = AlumniProfile::updateOrCreate(
                ['user_id' => $alumni->id],
                [
                    'department_id'     => $alumni->department_id,
                    'graduate_id'       => $graduate?->id,
                    'batch_year'        => $graduate?->batch_year,
                    'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
                    // is_work_aligned intentionally left null — not answered yet
                ]
            );

            // Log the action
            AccountActivityLog::create([
                'actor_id'  => $actor->id,
                'target_id' => $alumni->id,
                'action'    => 'approved_alumni',
                'metadata'  => [
                    'alumni_email' => $alumni->email,
                    'alumni_name'  => $alumni->name,
                ],
            ]);

            // Queue approval notification email
            Mail::to($alumni->email)->queue(new AccountApprovedMail($alumni));

            return $profile;
        });
    }

    /**
     * Reject alumni registration
     */
    public function rejectAlumni(User $alumni, User $actor, ?string $reason = null): void
    {
        DB::transaction(function () use ($alumni, $actor, $reason) {
            $alumni->tokens()->delete();

            // Log the action before permanently deleting the user.
            AccountActivityLog::create([
                'actor_id'  => $actor->id,
                'target_id' => $alumni->id,
                'action'    => 'rejected_alumni',
                'reason'    => $reason,
                'metadata'  => [
                    'alumni_email' => $alumni->email,
                    'alumni_name'  => $alumni->name,
                ],
            ]);

            Mail::to($alumni->email)->queue(new AccountRejectedMail(
                $alumni->name,
                $alumni->email,
                $reason,
            ));

            $alumni->forceDelete();
        });
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