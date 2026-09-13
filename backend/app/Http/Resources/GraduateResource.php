<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GraduateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();
        $isRegistered = array_key_exists('is_registered', $attributes)
            ? (bool) $attributes['is_registered']
            : $this->isRegistered();

        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'student_number' => $this->student_number,
            'name' => $this->name,
            'batch_year' => $this->batch_year,
            'block' => $this->block,
            'registration_status' => $isRegistered ? 'registered' : 'not_registered',
            'is_registered' => $isRegistered,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
