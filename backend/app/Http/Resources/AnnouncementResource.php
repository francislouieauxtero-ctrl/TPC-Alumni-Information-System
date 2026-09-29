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
            'images' => array_values(array_filter(array_map(fn ($img) => $this->normalizeUrl($img), $this->images ?? []))),
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
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
