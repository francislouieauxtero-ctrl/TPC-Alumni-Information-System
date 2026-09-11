<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\JobHistory;

class AlumniProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'user_id'             => $this->user_id,
            'user'                => new UserResource($this->whenLoaded('user')),
            'department_id'       => $this->department_id,
            'department'          => new DepartmentResource($this->whenLoaded('department')),
            'graduate_id'         => $this->graduate_id,
            'graduate'            => new GraduateResource($this->whenLoaded('graduate')),
            'student_number'      => $this->graduate?->student_number ?? $this->user?->school_id,
            'school_id'           => $this->user?->school_id ?? $this->graduate?->student_number,
            'contact_number'      => $this->contact_number,
            'location'            => $this->location,
            'profile_photo_url'   => $this->profile_photo_url,
            'current_job'         => $this->current_job,
            'company'             => $this->company,
            'batch_year'          => $this->batch_year,
            'employment_status'   => $this->employment_status,
            'has_job_history'     => (bool) JobHistory::where('user_id', $this->user_id)->exists(),

            // ─── Work Alignment ───────────────────────────────────────────────
            // null  = alumni has not answered the question yet
            // true  = alumni said YES (job is aligned with course)
            // false = alumni said NO  (job is not aligned with course)
            'is_work_aligned'         => $this->is_work_aligned,
            'work_aligned_reason'     => $this->work_aligned_reason,
            'has_answered_alignment'  => $this->hasAnsweredAlignment(),

            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}