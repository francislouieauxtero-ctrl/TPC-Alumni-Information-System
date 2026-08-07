<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'title' => $this->title,
            'description' => $this->description,
            'event_date' => $this->event_date,
            'location' => $this->location,
            'scope' => $this->scope,
            'is_future' => $this->isFuture(),
            'is_past' => $this->isPast(),
            'attachments' => $this->attachments ?? [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
