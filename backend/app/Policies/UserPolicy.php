<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function view(User $actor, User $target): bool
    {
        return $this->canAccessUser($actor, $target);
    }

    public function update(User $actor, User $target): bool
    {
        return $this->canAccessUser($actor, $target);
    }

    public function delete(User $actor, User $target): bool
    {
        if (!$target->isStudent()) {
            return false;
        }

        return $this->canAccessUser($actor, $target);
    }

    private function canAccessUser(User $actor, User $target): bool
    {
        if ($actor->isSuperAdmin()) {
            return true;
        }

        if ($actor->isAdmin()) {
            return $target->isStudent()
                && $actor->department_id !== null
                && $actor->department_id === $target->department_id;
        }

        return $actor->is($target);
    }
}