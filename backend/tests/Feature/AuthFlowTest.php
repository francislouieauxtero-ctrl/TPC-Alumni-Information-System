<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_and_login(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20240001',
            'name' => 'Jane Doe',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'STU20240001',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => true,
                'message' => 'Student account registered and pending approval',
                'data' => [
                    'email' => 'jane@example.com',
                    'role' => User::ROLE_USER,
                    'departmentId' => $department->id,
                    'schoolId' => 'STU20240001',
                ],
            ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'secret123',
        ]);

        $login->assertStatus(403)
            ->assertJson([
                'status' => false,
                'message' => 'Your account is pending department approval. Please wait.',
            ]);
    }

    public function test_registration_rejects_unknown_student_id(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'UNKNOWN-ID',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['school_id'])
            ->assertJsonFragment([
                'message' => 'This student ID is not found in the graduates student ID list.',
            ]);
    }

    public function test_registration_accepts_numeric_student_id_that_matches_graduate_record(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        $graduate = \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => '0001',
            'name' => 'Jane Doe',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane-match@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => '1',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.schoolId', '1');
    }

    public function test_invalid_credentials_return_unauthorized_message(): void
    {
        $department = Department::factory()->create(['name' => 'Business']);

        User::factory()->create([
            'email' => 'student@example.com',
            'password' => Hash::make('secret123'),
            'role' => User::ROLE_USER,
            'department_id' => $department->id,
            'school_id' => 'STU20240002',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'student@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    public function test_verified_student_can_login_and_access_profile(): void
    {
        $department = Department::factory()->create(['name' => 'Business']);

        $student = User::factory()->create([
            'email' => 'student@example.com',
            'password' => Hash::make('secret123'),
            'role' => User::ROLE_USER,
            'department_id' => $department->id,
            'school_id' => 'STU20240002',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'student@example.com',
            'password' => 'secret123',
        ]);

        $login->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'email',
                        'role',
                    ],
                ],
            ]);

        $token = $login->json('data.token');

        $profile = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/user');

        $profile->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'email' => 'student@example.com',
                    'role' => User::ROLE_USER,
                    'departmentId' => $department->id,
                    'schoolId' => 'STU20240002',
                ],
            ]);
    }
}
