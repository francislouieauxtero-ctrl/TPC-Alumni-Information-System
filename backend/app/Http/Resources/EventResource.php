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
            'attachments' => array_values(array_map(function ($att) {
                if (is_array($att) && isset($att['url'])) {
                    $att['url'] = $this->normalizeUrl($att['url']);
                }
                return $att;
            }, $this->attachments ?? [])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'reactions_summary' => $this->getReactionsSummary(request()->user()?->id),
        ];
    }

    protected function normalizeUrl(?string $url): ?string
    {
        if (!$url || !is_string($url)) {
            return $url;
        }

        if (str_starts_with($url, '/storage/')) {
            return $url;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            $host = parse_url($url, PHP_URL_HOST);
            $path = parse_url($url, PHP_URL_PATH);
            if ($path && (str_starts_with($path, '/storage/') || in_array($host, ['localhost', '127.0.0.1']))) {
                return $path;
            }
            return $url;
        }

        return '/storage/' . ltrim($url, '/');
    }
}
