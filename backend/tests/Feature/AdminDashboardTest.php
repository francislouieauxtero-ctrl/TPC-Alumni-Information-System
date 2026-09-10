<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_dashboard_can_filter_by_department_and_batch(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'department_id' => null,
        ]);

        $deptOne = Department::factory()->create(['name' => 'Computer Science']);
        $deptTwo = Department::factory()->create(['name' => 'Business Administration']);

        $userOne = User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => $deptOne->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => $deptTwo->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $userOne->id,
            'department_id' => $deptOne->id,
            'employment_status' => AlumniProfile::STATUS_EMPLOYED,
            'batch_year' => '2024',
            'is_work_aligned' => true,
        ]);

        Graduate::create([
            'department_id' => $deptOne->id,
            'student_number' => 'GR-001',
            'name' => 'Sample Graduate',
            'batch_year' => '2024',
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/dashboard?department_id=' . $deptOne->id . '&batch=2024');

        $response->assertOk();
        $stats = $response->json('data.stats');

        $this->assertSame(1, $stats['total_students']);
        $this->assertSame(1, $stats['total_graduates']);
        $this->assertSame(1, $stats['employed_alumni']);
        $this->assertSame(1, $stats['graduates_by_year']['2024']);
        $this->assertSame(['Computer Science'], array_keys($stats['by_department']));
    }

    public function test_admin_dashboard_is_scoped_to_assigned_department(): void
    {
        $deptOne = Department::factory()->create(['name' => 'Education']);
        $deptTwo = Department::factory()->create(['name' => 'Engineering']);

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $deptOne->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => $deptOne->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => $deptTwo->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');

        $response->assertOk();
        $stats = $response->json('data.stats');

        $this->assertSame(1, $stats['total_students']);
        $this->assertSame(1, $stats['by_department'][$deptOne->name]);
        $this->assertArrayNotHasKey($deptTwo->name, $stats['by_department']);
    }

    public function test_dashboard_uses_alumni_profile_department_when_user_department_is_missing(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'department_id' => null,
        ]);
        $department = Department::factory()->create(['name' => 'Information Systems']);

        $user = User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => null,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $user->id,
            'department_id' => $department->id,
            'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
            'batch_year' => '2024',
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/dashboard');

        $response->assertOk();
        $stats = $response->json('data.stats');

        $this->assertSame(1, $stats['by_department'][$department->name]);
        $this->assertArrayNotHasKey('No department assigned', $stats['by_department']);
        $this->assertSame(1, $stats['total_departments']);
    }
}
