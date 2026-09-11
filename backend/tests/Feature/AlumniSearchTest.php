<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlumniSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_search_registered_alumni_by_student_number(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        $department = Department::factory()->create(['name' => 'Information Technology']);

        // Create graduate record with student number
        $graduate1 = Graduate::create([
            'department_id'  => $department->id,
            'student_number' => '2024-0001',
            'name'           => 'Alice Walker',
            'batch_year'     => '2024',
        ]);

        $user1 = User::factory()->create([
            'name'          => 'Alice Walker',
            'email'         => 'alice@example.com',
            'school_id'     => '2024-0001',
            'department_id' => $department->id,
            'role'          => User::ROLE_USER,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id'           => $user1->id,
            'department_id'     => $department->id,
            'graduate_id'       => $graduate1->id,
            'employment_status' => AlumniProfile::STATUS_EMPLOYED,
            'batch_year'        => '2024',
        ]);

        // Second alumnus with different student number
        $graduate2 = Graduate::create([
            'department_id'  => $department->id,
            'student_number' => '2024-0002',
            'name'           => 'Bob Smith',
            'batch_year'     => '2024',
        ]);

        $user2 = User::factory()->create([
            'name'          => 'Bob Smith',
            'email'         => 'bob@example.com',
            'school_id'     => '2024-0002',
            'department_id' => $department->id,
            'role'          => User::ROLE_USER,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id'           => $user2->id,
            'department_id'     => $department->id,
            'graduate_id'       => $graduate2->id,
            'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
            'batch_year'        => '2024',
        ]);

        // Search by student number via /api/admin/alumni
        $response = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/alumni?search=2024-0001');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('Alice Walker', $data[0]['user']['name']);
        $this->assertSame('2024-0001', $data[0]['student_number']);

        // Search by partial student number
        $partialResponse = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/alumni?search=0002');

        $partialResponse->assertOk();
        $partialData = $partialResponse->json('data');

        $this->assertCount(1, $partialData);
        $this->assertSame('Bob Smith', $partialData[0]['user']['name']);
        $this->assertSame('2024-0002', $partialData[0]['student_number']);

        // Search via /api/admin/students
        $studentsResponse = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/students?search=2024-0001');

        $studentsResponse->assertOk();
        $studentsData = $studentsResponse->json('data');
        $this->assertCount(1, $studentsData);
        $this->assertSame('Alice Walker', $studentsData[0]['name']);
    }

    public function test_department_head_can_search_registered_alumni_by_student_number(): void
    {
        $deptOne = Department::factory()->create(['name' => 'IT']);
        $deptTwo = Department::factory()->create(['name' => 'Education']);

        $deptHead = User::factory()->create([
            'role'          => User::ROLE_ADMIN,
            'department_id' => $deptOne->id,
        ]);

        // Alumnus in Dept One
        $grad1 = Graduate::create([
            'department_id'  => $deptOne->id,
            'student_number' => 'IT-2024-100',
            'name'           => 'John IT',
        ]);

        $user1 = User::factory()->create([
            'name'          => 'John IT',
            'school_id'     => 'IT-2024-100',
            'department_id' => $deptOne->id,
            'role'          => User::ROLE_USER,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id'       => $user1->id,
            'department_id' => $deptOne->id,
            'graduate_id'   => $grad1->id,
        ]);

        // Alumnus in Dept Two
        $grad2 = Graduate::create([
            'department_id'  => $deptTwo->id,
            'student_number' => 'ED-2024-200',
            'name'           => 'Jane ED',
        ]);

        $user2 = User::factory()->create([
            'name'          => 'Jane ED',
            'school_id'     => 'ED-2024-200',
            'department_id' => $deptTwo->id,
            'role'          => User::ROLE_USER,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id'       => $user2->id,
            'department_id' => $deptTwo->id,
            'graduate_id'   => $grad2->id,
        ]);

        // Dept Head searches for their own alumnus
        $response = $this->actingAs($deptHead, 'sanctum')
            ->getJson('/api/admin/alumni?search=IT-2024-100');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('John IT', $response->json('data.0.user.name'));

        // Dept Head searches for another dept's student number - should return 0 (scoped)
        $scopedResponse = $this->actingAs($deptHead, 'sanctum')
            ->getJson('/api/admin/alumni?search=ED-2024-200');

        $scopedResponse->assertOk();
        $this->assertCount(0, $scopedResponse->json('data'));
    }
}
