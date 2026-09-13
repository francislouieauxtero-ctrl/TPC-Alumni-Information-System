<?php

namespace Tests\Feature;

use App\Mail\AlumniRegistrationConfirmedMail;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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
                'message' => 'Registration successful! You can now log in.',
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

        $login->assertStatus(200)
            ->assertJson([
                'status' => true,
                'message' => 'Login successful',
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
                'message' => 'Incorrect ID Number',
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

    public function test_admin_can_delete_student_without_rejection_email(): void
    {
        Mail::fake();

        $department = Department::factory()->create(['name' => 'Business']);

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        $student = User::factory()->create([
            'role' => User::ROLE_USER,
            'department_id' => $department->id,
            'school_id' => 'STU20240005',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->withHeader('Accept', 'application/json')
            ->deleteJson("/api/admin/students/{$student->id}");

        $response->assertOk();
        $response->assertJsonPath('status', true);
        $this->assertDatabaseMissing('users', ['id' => $student->id]);
        Mail::assertNothingQueued();
    }

    public function test_registration_fails_when_name_does_not_match_registered_graduate(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20240099',
            'name' => 'Maria Santos',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Wrong Name',
            'email' => 'maria@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'STU20240099',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                'message' => 'Incorrect Credentials',
            ]);
    }

    public function test_registration_fails_when_name_is_inverted_or_different(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20240100',
            'name' => 'Juan Dela Cruz',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'dela cruz, juan',
            'email' => 'juan@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'STU20240100',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                'message' => 'Incorrect Credentials',
            ]);
    }

    public function test_registration_accepts_exact_registered_name(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20240101',
            'name' => 'Juan Dela Cruz',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'juan dela cruz',
            'email' => 'juan.exact@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'STU20240101',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Juan Dela Cruz');
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
                        'name',
                        'role',
                        'departmentId',
                        'schoolId',
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
                    'id' => $student->id,
                    'name' => $student->name,
                    'role' => User::ROLE_USER,
                    'departmentId' => $department->id,
                    'schoolId' => 'STU20240002',
                ],
            ]);
    }

    public function test_registration_sends_confirmation_email_to_registered_gmail_address(): void
    {
        Mail::fake();

        $department = Department::factory()->create(['name' => 'Information Technology']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20249999',
            'name' => 'Maria Clara',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Maria Clara',
            'email' => 'mariaclara@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department_id' => $department->id,
            'school_id' => 'STU20249999',
        ]);

        $response->assertStatus(201);

        Mail::assertQueued(AlumniRegistrationConfirmedMail::class, function ($mail) {
            $rendered = $mail->render();

            return $mail->hasTo('mariaclara@gmail.com')
                && str_contains($rendered, 'TPC Alumni Employment and Career Management System')
                && str_contains($rendered, 'Your Alumni account has been successfully created')
                && str_contains($rendered, 'events, announcements, and other important updates')
                && str_contains($rendered, 'Thank you for becoming part of the TPC Alumni community!');
        });

        // Verify AlumniProfile was also automatically created and linked
        $user = User::where('email', 'mariaclara@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->is_verified);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertNotNull($user->alumniProfile);
        $this->assertSame($department->id, $user->alumniProfile->department_id);
    }

    public function test_registration_does_not_send_email_when_credentials_invalid(): void
    {
        Mail::fake();

        $department = Department::factory()->create(['name' => 'Information Technology']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20248888',
            'name' => 'Crisostomo Ibarra',
            'batch_year' => '2026',
        ]);

        // 1. Unknown school ID
        $response1 = $this->postJson('/api/auth/register', [
            'name' => 'Crisostomo Ibarra',
            'email' => 'ibarra@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department_id' => $department->id,
            'school_id' => 'WRONG-ID-999',
        ]);
        $response1->assertStatus(422);

        // 2. Mismatched name
        $response2 = $this->postJson('/api/auth/register', [
            'name' => 'Wrong Name',
            'email' => 'ibarra@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department_id' => $department->id,
            'school_id' => 'STU20248888',
        ]);
        $response2->assertStatus(422);

        Mail::assertNothingQueued();
    }

    public function test_duplicate_registration_does_not_send_duplicate_confirmation_email(): void
    {
        Mail::fake();

        $department = Department::factory()->create(['name' => 'Information Technology']);

        \App\Models\Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'STU20247777',
            'name' => 'Elias Salome',
            'batch_year' => '2026',
        ]);

        // First successful registration
        $first = $this->postJson('/api/auth/register', [
            'name' => 'Elias Salome',
            'email' => 'elias@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department_id' => $department->id,
            'school_id' => 'STU20247777',
        ]);
        $first->assertStatus(201);
        Mail::assertQueuedCount(1);

        // Duplicate attempt with same credentials
        $second = $this->postJson('/api/auth/register', [
            'name' => 'Elias Salome',
            'email' => 'elias@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department_id' => $department->id,
            'school_id' => 'STU20247777',
        ]);
        $second->assertStatus(422);

        // Mail queue count must still be exactly 1
        Mail::assertQueuedCount(1);
    }
}

