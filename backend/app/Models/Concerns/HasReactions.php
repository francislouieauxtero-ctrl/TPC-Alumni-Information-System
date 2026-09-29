<?php

namespace App\Models\Concerns;

use App\Models\Reaction;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasReactions
{
    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    public function userReaction(): MorphOne
    {
        return $this->morphOne(Reaction::class, 'reactable')
            ->where('user_id', auth()->id());
    }

    /**
     * Build aggregated reaction summary: total, breakdown, and user_reaction.
     * Leverages in-memory eager loaded reactions collection to prevent N+1 queries.
     */
    public function getReactionsSummary(?int $userId = null): array
    {
        $userId = $userId ?? auth()->id();
        $reactions = $this->relationLoaded('reactions')
            ? $this->reactions
            : $this->reactions()->get(['id', 'user_id', 'reactable_type', 'reactable_id', 'type']);

        $total = $reactions->count();
        $breakdown = [
            Reaction::TYPE_LIKE => 0,
            Reaction::TYPE_HEART => 0,
            Reaction::TYPE_SAD => 0,
            Reaction::TYPE_WOW => 0,
            Reaction::TYPE_FIRE => 0,
        ];

        $userReaction = null;

        foreach ($reactions as $r) {
            if (isset($breakdown[$r->type])) {
                $breakdown[$r->type]++;
            }
            if ($userId && (int)$r->user_id === (int)$userId) {
                $userReaction = $r->type;
            }
        }

        return [
            'total' => $total,
            'breakdown' => $breakdown,
            'user_reaction' => $userReaction,
        ];
    }
}
