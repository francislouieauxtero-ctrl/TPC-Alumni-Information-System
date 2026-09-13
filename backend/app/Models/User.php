<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Laravel\Sanctum\HasApiTokens;
use App\Models\JobHistory;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, CanResetPassword;

    // Roles
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_USER = 'user';

    // Status
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'department_id',
        'school_id',
        'password',
        'google_id',
        'avatar',
        'role',
        'is_verified',
        'status',
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }
    public function getAvatarAttribute($value): ?string
    {
        // Return the raw value without conversion - let the Resource handle formatting
        return $value;
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function alumniProfile(): HasOne
    {
        return $this->hasOne(AlumniProfile::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    /**
     * Check if user is president/super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user is department head/admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is student/user
     */
    public function isStudent(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function isUser(): bool
    {
        return $this->isStudent();
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    /**
     * Check if user is verified
     */
    public function isVerified(): bool
    {
        return $this->is_verified;
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Scope admins
     */
    public function scopeSuperAdmins(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_SUPER_ADMIN);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    public function scopeStudents(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_USER);
    }

    public function scopeVisibleTo(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->isAdmin()) {
            return $query
                ->students()
                ->where('users.department_id', $actor->department_id);
        }

        return $query->whereKey($actor->id);
    }

    public function scopeVerifiedStudents(Builder $query): Builder
    {
        return $query
            ->where('role', self::ROLE_USER)
            ->where('is_verified', true);
    }

    public function scopeUnverifiedStudents(Builder $query): Builder
    {
        return $query
            ->where('role', self::ROLE_USER)
            ->where('is_verified', false);
    }
    public function graduate(): HasOne
{
    return $this->hasOne(Graduate::class, 'student_number', 'school_id');
}
public function jobHistories(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(JobHistory::class);
}

}
