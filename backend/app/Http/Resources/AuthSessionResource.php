<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $avatar = $this->avatar;
        if ($avatar && !str_starts_with($avatar, 'http://') && !str_starts_with($avatar, 'https://') && !str_starts_with($avatar, 'data:') && !str_starts_with($avatar, 'blob:')) {
            $clean = ltrim($avatar, '/');
            while (str_starts_with($clean, 'storage/')) {
                $clean = substr($clean, 8);
            }
            if (!str_contains($clean, '/')) {
                $clean = 'avatars/' . $clean;
            }
            $avatar = '/storage/' . $clean;
        }

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'role'           => $this->role,
            'departmentId'   => $this->department_id,
            'schoolId'       => $this->school_id,
            'school_id'      => $this->school_id,
            'student_number' => $this->school_id,
            'department'     => $this->whenLoaded('department', fn () => new DepartmentResource($this->department)),
            'isVerified'     => (bool) $this->is_verified,
            'status'         => $this->status,
            'avatar'         => $avatar ?: null,
            'alumniProfile'  => $this->whenLoaded('alumniProfile', fn () => new AlumniProfileResource($this->alumniProfile)),
            'createdAt'      => $this->created_at,
            'updatedAt'      => $this->updated_at,
        ];
    }
}
