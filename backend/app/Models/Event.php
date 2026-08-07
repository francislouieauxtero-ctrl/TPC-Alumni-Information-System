<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    // Scope constants
    public const SCOPE_SCHOOL_WIDE = 'school_wide';
    public const SCOPE_DEPARTMENT_SPECIFIC = 'department_specific';

    protected $fillable = [
        'created_by',
        'department_id',
        'title',
        'description',
        'event_date',
        'location',
        'scope',
        'attachments',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'scope' => 'string',
            'attachments' => 'array',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Check if event is in the future
     */
    public function isFuture(): bool
    {
        return $this->event_date->isFuture();
    }

    /**
     * Check if event is past
     */
    public function isPast(): bool
    {
        return $this->event_date->isPast();
    }
}
