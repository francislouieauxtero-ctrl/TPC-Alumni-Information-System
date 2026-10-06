<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlumniProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photo = $this->profile_photo_url;
        if ($photo && !str_starts_with($photo, 'http://') && !str_starts_with($photo, 'https://') && !str_starts_with($photo, 'data:') && !str_starts_with($photo, 'blob:')) {
            $clean = ltrim($photo, '/');
            while (str_starts_with($clean, 'storage/')) {
                $clean = substr($clean, 8);
            }
            if (!str_contains($clean, '/')) {
                $clean = 'avatars/' . $clean;
            }
            $photo = '/storage/' . $clean;
        }

        $currentJob = $this->current_job;
        $company = $this->company;
        $jobHistories = collect();
        if ($this->relationLoaded('jobHistories')) {
            $jobHistories = $this->jobHistories;
        } elseif ($this->relationLoaded('user') && $this->user && $this->user->relationLoaded('jobHistories')) {
            $jobHistories = $this->user->jobHistories;
        }

        $currentEntry = $jobHistories->first(fn ($job) => (bool) $job->is_current) ?? $jobHistories->first();

        if (empty($currentJob) || empty($company) || $currentJob === 'Not Specified') {
            if (!empty($currentEntry)) {
                $currentJob = ($currentJob && $currentJob !== 'Not Specified') ? $currentJob : $currentEntry->position;
                $company = $company ?: $currentEntry->company;
            }
        }

        $industry = $currentEntry?->industry;

        $hasJobHistory = $this->relationLoaded('jobHistories')
            ? $jobHistories->isNotEmpty()
            : ($this->relationLoaded('user') && $this->user ? ($this->user->job_histories_exists ?? $jobHistories->isNotEmpty()) : false);

        $graduate = $this->relationLoaded('graduate') ? $this->graduate : null;
        $user = $this->relationLoaded('user') ? $this->user : null;

        return [
            'id'                  => $this->id,
            'user_id'             => $this->user_id,
            'user'                => new UserResource($this->whenLoaded('user')),
            'department_id'       => $this->department_id,
            'department'          => new DepartmentResource($this->whenLoaded('department')),
            'graduate_id'         => $this->graduate_id,
            'graduate'            => new GraduateResource($this->whenLoaded('graduate')),
            'student_number'      => $graduate?->student_number ?? $user?->school_id,
            'school_id'           => $user?->school_id ?? $graduate?->student_number,
            'contact_number'      => $this->contact_number,
            'location'            => $this->location,
            'profile_photo_url'   => $photo ?: null,
            'current_job'         => $currentJob ?: ($this->employment_status === \App\Models\AlumniProfile::STATUS_NOT_SPECIFIED ? 'Not Specified' : null),
            'company'             => $company,
            'position'            => $currentJob,
            'industry'            => $industry ?: null,
            'batch_year'          => $this->batch_year,
            'employment_status'   => $this->employment_status ?: \App\Models\AlumniProfile::STATUS_NOT_SPECIFIED,
            'has_job_history'     => $hasJobHistory,

            // ─── Work Alignment ───────────────────────────────────────────────
            // null  = alumni has not answered the question yet
            // true  = alumni said YES (job is aligned with course)
            // false = alumni said NO  (job is not aligned with course)
            'is_work_aligned'         => $this->is_work_aligned,
            'work_aligned_reason'     => $this->work_aligned_reason,
            'has_answered_alignment'  => $this->hasAnsweredAlignment(),
            'onboarding_completed'    => (bool) $this->onboarding_completed,

            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}