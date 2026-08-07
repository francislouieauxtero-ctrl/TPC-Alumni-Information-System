<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'scope' => $this->scope,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'external_link' => $this->external_link,
            'posted_at' => $this->posted_at?->toISOString(),
            'posted_by' => $this->posted_by,
            'department_category' => $this->department_category,
            'images' => $this->images ?? [],
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
