<?php

namespace App\Policies;

use App\Models\JobHistory;
use App\Models\User;

class JobHistoryPolicy
{
    public function view(User $user, JobHistory $jobHistory): bool
    {
        return $jobHistory->user_id === $user->id || $user->isSuperAdmin();
    }

    public function update(User $user, JobHistory $jobHistory): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($jobHistory->user_id !== $user->id) {
            return false;
        }

        return $jobHistory->is_current || ! JobHistory::where('user_id', $user->id)
            ->where('is_current', true)
            ->exists();
    }

    public function delete(User $user, JobHistory $jobHistory): bool
    {
        return $jobHistory->user_id === $user->id || $user->isSuperAdmin();
    }
}
