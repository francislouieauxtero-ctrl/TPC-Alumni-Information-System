<?php

namespace App\Services;

use App\Models\JobHistory;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Repositories\JobHistoryRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class JobHistoryService
{
    protected JobHistoryRepository $jobHistoryRepository;

    public function __construct(JobHistoryRepository $jobHistoryRepository)
    {
        $this->jobHistoryRepository = $jobHistoryRepository;
    }

    public function getForUser(User $user): LengthAwarePaginator
    {
        return $this->jobHistoryRepository->allForUser($user);
    }

    public function findById(int $id): ?JobHistory
    {
        return $this->jobHistoryRepository->find($id);
    }

    public function create(User $user, array $data): JobHistory
    {
        return DB::transaction(function () use ($user, $data) {
            $data['user_id'] = $user->id;
            $data['is_current'] = $data['is_current'] ?? false;
            $data['employment_type'] = $data['employment_type'] ?? AlumniProfile::STATUS_UNEMPLOYED;
            $data = $this->normalizePayload($data);

            if ($data['is_current']) {
                JobHistory::where('user_id', $user->id)
                    ->update(['is_current' => false]);
            }

            $jobHistory = $this->jobHistoryRepository->create($data);

            $this->syncAlumniEmploymentStatus($user, $data['employment_type']);

            return $jobHistory;
        });
    }

    public function update(JobHistory $jobHistory, User $user, array $data): JobHistory
    {
        return DB::transaction(function () use ($jobHistory, $user, $data) {
            $data = $this->normalizePayload($data);

            if (array_key_exists('is_current', $data) && $data['is_current']) {
                JobHistory::where('user_id', $user->id)
                    ->where('id', '!=', $jobHistory->id)
                    ->update(['is_current' => false]);
            }

            $updated = $this->jobHistoryRepository->update($jobHistory, $data);

            $this->syncAlumniEmploymentStatus($user, $data['employment_type'] ?? $updated->employment_type);

            return $updated;
        });
    }

    public function delete(JobHistory $jobHistory): bool
    {
        return DB::transaction(function () use ($jobHistory) {
            $user = $jobHistory->user;

            $result = $this->jobHistoryRepository->delete($jobHistory);

            $this->syncAlumniEmploymentStatus($user, $jobHistory->employment_type ?? null);

            return $result;
        });
    }

    // ------------------------------------------------------------------

    private function normalizePayload(array $data): array
    {
        $employmentType = $data['employment_type'] ?? null;

        if ($employmentType === AlumniProfile::STATUS_EMPLOYED) {
            $data['company'] = $data['company'] ?? '';
            $data['position'] = $data['position'] ?? '';
            $data['start_date'] = $data['start_date'] ?? null;
            $data['end_date'] = $data['end_date'] ?? null;
            return $data;
        }

        $data['company'] = $data['company'] ?? '';
        $data['position'] = $data['position'] ?? '';
        $data['start_date'] = $data['start_date'] ?? now()->toDateString();
        $data['end_date'] = $data['end_date'] ?? null;

        return $data;
    }

   private function syncAlumniEmploymentStatus(User $user, ?string $explicitType = null): void
{
    $alumni = AlumniProfile::where('user_id', $user->id)->first();

    if (! $alumni) {
        return;
    }

    $latestEntry = JobHistory::where('user_id', $user->id)
        ->latest('created_at')
        ->first();

    $type = $explicitType ?? $latestEntry?->employment_type ?? AlumniProfile::STATUS_UNEMPLOYED;

    if ($type === AlumniProfile::STATUS_EMPLOYED) {
        $currentJob = JobHistory::where('user_id', $user->id)
            ->where('is_current', true)
            ->latest('start_date')
            ->first();

        $alumni->update([
            'employment_status' => AlumniProfile::STATUS_EMPLOYED,
            'current_job'       => $currentJob?->position,
            'company'           => $currentJob?->company,
        ]);
    } elseif ($type === AlumniProfile::STATUS_SELF_EMPLOYED) {
        $alumni->update([
            'employment_status' => AlumniProfile::STATUS_SELF_EMPLOYED,
            'current_job'       => null,
            'company'           => null,
        ]);
    } else {
        $alumni->update([
            'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
            'current_job'       => null,
            'company'           => null,
            'is_work_aligned'   => null,
            'work_aligned_reason' => null,
        ]);
    }
}
}
