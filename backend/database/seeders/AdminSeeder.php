<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'francislouieauxtero@gmail.com',
            ],
            [
                'name' => 'President',
                'password' => Hash::make('password'),
                'department_id' => null,
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
                'status' => User::STATUS_ACTIVE,
            ]
        );
    }
}
