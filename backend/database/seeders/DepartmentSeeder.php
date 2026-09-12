<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'Bachelor of Arts in English Language',
            'Bachelor of Arts in Political Science',
            'Bachelor of Early Childhood Education',
            'Bachelor of Science in Accounting Information System',
            'Bachelor of Science in Agriculture',
            'Bachelor of Science in Criminology',
            'Bachelor of Science in Information System',
        ];

        foreach ($departments as $name) {
            Department::firstOrCreate(['name' => $name]);
        }
    }
}
