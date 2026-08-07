<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    public const SCOPE_SCHOOL_WIDE = 'school_wide';
    public const SCOPE_DEPARTMENT_SPECIFIC = 'department_specific';

    protected $fillable = [
        'created_by',
        'department_id',
        'title',
        'content',
        'scope',
        'external_link',
        'posted_at',
        'posted_by',
        'department_category',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'scope' => 'string',
            'posted_at' => 'datetime',
            'images' => 'array',
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
}
