<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'role'          => $this->role,
            'departmentId'  => $this->department_id,
            'schoolId'      => $this->school_id,
            'school_id'     => $this->school_id,
            'student_number' => $this->school_id,
            'department'    => new DepartmentResource($this->whenLoaded('department')),
            'isVerified'    => (bool) $this->is_verified,
            'status'        => $this->status,
            'avatar'        => $this->avatar ? $this->avatar : null,
            'alumniProfile' => new AlumniProfileResource($this->whenLoaded('alumniProfile')),
            'createdAt'     => $this->created_at,
            'updatedAt'     => $this->updated_at,
        ];
    }
}