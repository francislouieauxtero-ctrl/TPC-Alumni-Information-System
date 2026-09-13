<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * This endpoint is used solely to bootstrap auth state in the app.
     * It intentionally omits relationships and heavy nested data.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'role'          => $this->role,
            'departmentId'  => $this->department_id,
            'schoolId'      => $this->school_id,
        ];
    }
}
