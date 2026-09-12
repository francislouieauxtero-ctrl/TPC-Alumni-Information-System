<?php

namespace App\Policies;

use App\Models\AlumniProfile;
use App\Models\User;

class AlumniPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdmin();
    }

    public function view(User $user, AlumniProfile $alumni): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->department_id === $alumni->department_id;
        }

        // Alumni can view own profile
        if ($user->isStudent()) {
            return $user->id === $alumni->user_id;
        }

        return false;
    }

    public function update(User $user, AlumniProfile $alumni): bool
    {
        // Alumni can only update own profile
        if ($user->isStudent()) {
            return $user->id === $alumni->user_id;
        }

        // Super admin can update any
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->department_id === $alumni->department_id;
        }

        return false;
    }
}
