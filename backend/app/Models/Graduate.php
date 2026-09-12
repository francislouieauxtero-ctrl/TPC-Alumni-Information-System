<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Graduate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'department_id',
        'student_number',
        'name',
        'batch_year',
        'block',
    ];

    protected function casts(): array
    {
        return [
            'batch_year' => 'string',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function alumniProfile(): HasOne
    {
        return $this->hasOne(AlumniProfile::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    /**
     * Check if this graduate has registered as a user
     */
    public function isRegistered(): bool
    {
        return $this->alumniProfile()->exists()
            || User::where('school_id', $this->student_number)->where('role', User::ROLE_USER)->exists();
    }

    /**
     * Get registration status
     */
    public function getRegistrationStatusAttribute(): string
    {
        return $this->isRegistered() ? 'registered' : 'not_registered';
    }
}