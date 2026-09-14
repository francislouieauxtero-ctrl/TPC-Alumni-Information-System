<?php

namespace App\Policies;

use App\Models\Graduate;
use App\Models\User;

class GraduatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdmin();
    }

    public function view(User $user, Graduate $graduate): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->department_id === $graduate->department_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || ($user->isAdmin() && $user->department_id !== null);
    }

    public function update(User $user, Graduate $graduate): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->department_id === $graduate->department_id;
        }

        return false;
    }

    public function delete(User $user, Graduate $graduate): bool
    {
        return $this->update($user, $graduate);
    }
}
