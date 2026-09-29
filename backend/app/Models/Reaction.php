<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reaction extends Model
{
    use HasFactory;

    public const TYPE_LIKE = 'like';
    public const TYPE_HEART = 'heart';
    public const TYPE_SAD = 'sad';
    public const TYPE_WOW = 'wow';
    public const TYPE_FIRE = 'fire';

    public const ALLOWED_TYPES = [
        self::TYPE_LIKE,
        self::TYPE_HEART,
        self::TYPE_SAD,
        self::TYPE_WOW,
        self::TYPE_FIRE,
    ];

    protected $fillable = [
        'user_id',
        'reactable_type',
        'reactable_id',
        'type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reactable(): MorphTo
    {
        return $this->morphTo();
    }
}
