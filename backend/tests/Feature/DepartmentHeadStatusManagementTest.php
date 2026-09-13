<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentHeadStatusManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_activate_department_head(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();
        $head = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->patchJson("/api/super-admin/department-heads/{$head->id}/activate");

        $response->assertOk();
        $response->assertJsonPath('status', true);
        $this->assertSame(User::STATUS_ACTIVE, $head->fresh()->status);
    }

    public function test_list_department_admins_can_filter_by_status(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();

        $activeHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/super-admin/department-admins?status=active');

        $response->assertOk();
        $response->assertJsonPath('status', true);
        $response->assertJsonCount(1, 'data');
        $this->assertSame($activeHead->id, $response->json('data.0.id'));
    }

    public function test_list_department_admins_supports_server_side_search_and_pagination(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();

        $match = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'name' => 'Alice Department Head',
            'email' => 'alice.department@example.com',
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'name' => 'Bob Department Head',
            'email' => 'bob.department@example.com',
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/super-admin/department-admins?search=alice&verified=true&per_page=1');

        $response->assertOk();
        $response->assertJsonPath('status', true);
        $response->assertJsonPath('meta.total', 1);
        $response->assertJsonCount(1, 'data');
        $this->assertSame($match->id, $response->json('data.0.id'));
    }

    public function test_super_admin_cannot_activate_when_another_active_head_exists_in_department(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();
        User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $inactiveHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->patchJson("/api/super-admin/department-heads/{$inactiveHead->id}/activate");

        $response->assertStatus(422);
        $this->assertSame(User::STATUS_INACTIVE, $inactiveHead->fresh()->status);
    }

    public function test_super_admin_cannot_set_inactive_department_head_to_active_while_another_active_head_exists(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();
        User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $inactiveHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->putJson("/api/super-admin/department-admins/{$inactiveHead->id}", [
                'status' => User::STATUS_ACTIVE,
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'Deactivate the current department head for this department before activating another one.',
        ]);
        $this->assertSame(User::STATUS_INACTIVE, $inactiveHead->fresh()->status);
    }

    public function test_super_admin_can_reject_department_head_and_delete_the_account(): void
    {
        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $department = Department::factory()->create();
        $head = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_INACTIVE,
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->postJson("/api/super-admin/department-admins/{$head->id}/reject");

        $response->assertOk();
        $response->assertJsonPath('status', true);
        $this->assertDatabaseMissing('users', ['id' => $head->id]);
    }
}
