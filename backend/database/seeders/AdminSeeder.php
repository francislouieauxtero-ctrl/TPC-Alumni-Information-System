<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Pulls credentials strictly from environment variables.
     */
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', env('ADMIN_EMAIL'));
        $password = env('SUPER_ADMIN_PASSWORD', env('ADMIN_PASSWORD'));
        $name = env('SUPER_ADMIN_NAME', env('ADMIN_NAME', 'Super Admin'));

        if (empty($email) || empty($password)) {
            $this->command?->warn('AdminSeeder: Skipped. SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in the environment.');
            return;
        }

        // Find existing super_admin or user by email to prevent duplicate accounts
        $user = User::where('role', User::ROLE_SUPER_ADMIN)->first()
            ?? User::where('email', $email)->first()
            ?? new User();

        $user->name = $name;
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->department_id = null;
        $user->role = User::ROLE_SUPER_ADMIN;
        $user->is_verified = true;
        $user->status = User::STATUS_ACTIVE;
        $user->save();

        $this->command?->info("AdminSeeder: Super Admin account initialized for [{$email}].");
    }
}
