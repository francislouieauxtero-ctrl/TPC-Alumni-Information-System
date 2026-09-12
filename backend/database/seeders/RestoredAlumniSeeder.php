<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use App\Models\AlumniProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RestoredAlumniSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Ensure the 7 Departments with exact names and IDs
            Department::updateOrCreate(['id' => 1], ['name' => 'Bachelor of Arts in English Language']);
            Department::updateOrCreate(['id' => 2], ['name' => 'Bachelor of Arts in Political Science']);
            Department::updateOrCreate(['id' => 3], ['name' => 'Bachelor of Early Childhood Education']);
            Department::updateOrCreate(['id' => 4], ['name' => 'Bachelor of Science in Accounting Information System']);
            Department::updateOrCreate(['id' => 5], ['name' => 'Bachelor of Science in Agriculture']);
            Department::updateOrCreate(['id' => 6], ['name' => 'Bachelor of Science in Criminology']);
            Department::updateOrCreate(['id' => 7], ['name' => 'Bachelor of Science in Information System']);

            $defaultPasswordHash = Hash::make('12345678');

            // 2. The 9 Graduate records exactly from official records
            $graduatesData = [
                [
                    'student_number' => '2023-1-4001',
                    'name' => 'Peter Paul B Polestico',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'peterpaul@gmail.com',
                ],
                [
                    'student_number' => '2022-1-2390',
                    'name' => 'Kahryll Fernandez',
                    'batch_year' => '2025-2026',
                    'block' => 'Block 1',
                    'department_id' => 4,
                    'is_alumni' => true,
                    'email' => 'kahryll@gmail.com',
                ],
                [
                    'student_number' => '2023-2-2878',
                    'name' => 'Randelene B. Cutamora',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 2',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'randelene@gmail.com',
                ],
                [
                    'student_number' => '2023-1-2893',
                    'name' => 'FRANCIS LOUIE AUXTERO',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'francislouieauxtero@gmail.com',
                ],
                [
                    'student_number' => '2023-1-2972',
                    'name' => 'Johnro Balingit',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'johnro@gmail.com',
                ],
                [
                    'student_number' => '2023-1-2756',
                    'name' => 'Jeffrey Toroba Cutamora',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'jeffrey@gmail.com',
                ],
                [
                    'student_number' => '2023-1-2747',
                    'name' => 'Rena Angel A. Gutang',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => false, // Not registered in Graduate List
                    'email' => null,
                ],
                [
                    'student_number' => '2023-1-2690',
                    'name' => 'Lurengel Tampor Ambaic',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 1',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'ambaic@gmail.com',
                ],
                [
                    'student_number' => '2023-1-3282',
                    'name' => 'Kean Lester Auguis',
                    'batch_year' => '2026-2027',
                    'block' => 'Block 2',
                    'department_id' => 7,
                    'is_alumni' => true,
                    'email' => 'keanlester@gmail.com',
                ],
            ];

            foreach ($graduatesData as $item) {
                $graduate = Graduate::updateOrCreate(
                    ['student_number' => $item['student_number']],
                    [
                        'name' => $item['name'],
                        'batch_year' => $item['batch_year'],
                        'block' => $item['block'],
                        'department_id' => $item['department_id'],
                    ]
                );

                if ($item['is_alumni']) {
                    $user = User::updateOrCreate(
                        ['school_id' => $item['student_number']],
                        [
                            'name' => $item['name'],
                            'email' => $item['email'],
                            'password' => $defaultPasswordHash,
                            'department_id' => $item['department_id'],
                            'role' => User::ROLE_USER,
                            'is_verified' => true,
                            'status' => User::STATUS_ACTIVE,
                        ]
                    );

                    AlumniProfile::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'department_id' => $item['department_id'],
                            'graduate_id' => $graduate->id,
                            'batch_year' => $item['batch_year'],
                            'employment_status' => AlumniProfile::STATUS_NOT_SPECIFIED,
                            'current_job' => 'Not Specified',
                        ]
                    );
                }
            }
        });
    }
}
