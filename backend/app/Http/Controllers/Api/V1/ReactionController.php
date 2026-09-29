<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Reaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    use ApiResponder;

    public function reactToAnnouncement(Request $request, int $id): JsonResponse
    {
        $type = $this->normalizeReactionType($request->input('type'));
        if (!$type || !in_array($type, Reaction::ALLOWED_TYPES, true)) {
            return $this->errorResponse('Invalid reaction type. Allowed types: ' . implode(', ', Reaction::ALLOWED_TYPES), 422);
        }

        $user = auth()->user();
        $announcement = Announcement::findOrFail($id);

        // Visibility check
        if (!$this->canUserAccessPost($user, $announcement)) {
            return $this->errorResponse('You do not have permission to react to this announcement', 403);
        }

        $summary = $this->toggleReaction($user->id, $announcement, $type);

        return $this->successResponse($summary, 'Reaction updated successfully');
    }

    public function reactToEvent(Request $request, int $id): JsonResponse
    {
        $type = $this->normalizeReactionType($request->input('type'));
        if (!$type || !in_array($type, Reaction::ALLOWED_TYPES, true)) {
            return $this->errorResponse('Invalid reaction type. Allowed types: ' . implode(', ', Reaction::ALLOWED_TYPES), 422);
        }

        $user = auth()->user();
        $event = Event::findOrFail($id);

        // Visibility check
        if (!$this->canUserAccessPost($user, $event)) {
            return $this->errorResponse('You do not have permission to react to this event', 403);
        }

        $summary = $this->toggleReaction($user->id, $event, $type);

        return $this->successResponse($summary, 'Reaction updated successfully');
    }

    protected function normalizeReactionType(?string $type): ?string
    {
        if (!$type) {
            return null;
        }

        $clean = strtolower(trim($type));
        $map = [
            '❤️' => Reaction::TYPE_HEART,
            '❤' => Reaction::TYPE_HEART,
            'love' => Reaction::TYPE_HEART,
            'heart' => Reaction::TYPE_HEART,
            '👍' => Reaction::TYPE_LIKE,
            'like' => Reaction::TYPE_LIKE,
            '🔥' => Reaction::TYPE_FIRE,
            'fire' => Reaction::TYPE_FIRE,
            '😮' => Reaction::TYPE_WOW,
            'wow' => Reaction::TYPE_WOW,
            '😢' => Reaction::TYPE_SAD,
            'sad' => Reaction::TYPE_SAD,
        ];

        return $map[$clean] ?? $clean;
    }

    protected function toggleReaction(int $userId, $reactable, string $type): array
    {
        $existing = $reactable->reactions()->where('user_id', $userId)->first();

        if ($existing) {
            if ($existing->type === $type) {
                // Same reaction clicked -> remove it (toggle off)
                $existing->delete();
            } else {
                // Different reaction -> update to new type
                $existing->update(['type' => $type]);
            }
        } else {
            // New reaction
            $reactable->reactions()->create([
                'user_id' => $userId,
                'type' => $type,
            ]);
        }

        // Reload fresh reactions for accurate summary
        $reactable->unsetRelation('reactions');
        return $reactable->getReactionsSummary($userId);
    }

    protected function canUserAccessPost($user, $post): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($post->scope === 'school_wide') {
            return true;
        }

        return $user->department_id && (int)$user->department_id === (int)$post->department_id;
    }
}
