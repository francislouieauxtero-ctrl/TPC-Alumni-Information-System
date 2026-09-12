<?php

namespace Tests\Feature;

use App\Mail\AlumniRegistrationConfirmedMail;
use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AlumniVerificationExactRequirementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_head_can_create_and_edit_graduate_records(): void
    {
        $department = Department::factory()->create(['name' => 'College of Information Technology']);

        $deptHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        $president = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        // 1. Department Head can create graduate record
        $response = $this->actingAs($deptHead, 'sanctum')
            ->postJson('/api/admin/graduates', [
                'name' => 'Juan Tamad',
                'student_number' => '2020-1-2020',
                'batch_year' => '2024',
                'block' => 'Block A',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('graduates', [
            'name' => 'Juan Tamad',
            'student_number' => '2020-1-2020',
            'batch_year' => '2024',
            'block' => 'Block A',
            'department_id' => $department->id,
        ]);

        $graduate = Graduate::where('student_number', '2020-1-2020')->first();

        // 2. Department Head can edit graduate record while unregistered
        $updateResp = $this->actingAs($deptHead, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'name' => 'Juan Tamad Updated',
                'student_number' => '2020-1-2021',
                'batch_year' => '2024',
                'block' => 'Block B',
            ]);

        $updateResp->assertOk();
        $this->assertDatabaseHas('graduates', [
            'id' => $graduate->id,
            'name' => 'Juan Tamad Updated',
            'student_number' => '2020-1-2021',
            'batch_year' => '2024',
            'block' => 'Block B',
        ]);

        // Revert back for subsequent verification
        $this->actingAs($deptHead, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'name' => 'Juan Tamad',
                'student_number' => '2020-1-2020',
                'batch_year' => '2024',
                'block' => 'Block A',
            ]);

        // 3. President/Super Admin cannot create or edit graduate records
        $presidentCreate = $this->actingAs($president, 'sanctum')
            ->postJson('/api/admin/graduates', [
                'name' => 'Unauthorized Graduate',
                'student_number' => '2020-1-9999',
                'batch_year' => '2024',
                'department_id' => $department->id,
            ]);
        $presidentCreate->assertStatus(403);

        $presidentEdit = $this->actingAs($president, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'name' => 'Unauthorized Edit',
            ]);
        $presidentEdit->assertStatus(403);
    }

    public function test_incorrect_id_number_returns_exact_validation_error(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Juan Tamad',
            'email' => 'juantamad@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => '9999-9-9999',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['school_id'])
            ->assertJsonFragment([
                'message' => 'Incorrect ID Number',
            ]);

        $this->assertDatabaseMissing('users', ['email' => 'juantamad@gmail.com']);
        Mail::assertNothingQueued();
    }

    public function test_incorrect_name_with_correct_id_returns_exact_validation_error(): void
    {
        Mail::fake();

        $department = Department::factory()->create();
        Graduate::factory()->create([
            'department_id' => $department->id,
            'name' => 'Juan Tamad',
            'student_number' => '2020-1-2020',
            'batch_year' => '2024',
            'block' => 'Block A',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pedro Penduko',
            'email' => 'pedro@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => '2020-1-2020',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                'message' => 'Incorrect Credentials',
            ]);

        $this->assertDatabaseMissing('users', ['email' => 'pedro@gmail.com']);
        Mail::assertNothingQueued();
    }

    public function test_successful_exact_verification_creates_alumni_and_allows_immediate_login(): void
    {
        Mail::fake();

        $department = Department::factory()->create();
        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'name' => 'Juan Tamad',
            'student_number' => '2020-1-2020',
            'batch_year' => '2024',
            'block' => 'Block A',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Juan Tamad',
            'email' => 'juantamad@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => '2020-1-2020',
        ]);

        $response->assertStatus(201);

        // Account is created and status is active (Registered)
        $user = User::where('email', 'juantamad@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertTrue($user->is_verified);
        $this->assertSame('Juan Tamad', $user->name);
        $this->assertSame('2020-1-2020', $user->school_id);

        // Alumni status is Registered
        $this->assertTrue($graduate->fresh()->isRegistered());
        $profile = $user->alumniProfile;
        $this->assertNotNull($profile);
        $this->assertSame(AlumniProfile::STATUS_NOT_SPECIFIED, $profile->employment_status);
        $this->assertSame('Not Specified', $profile->current_job);

        // Confirmation email sent with exact text
        Mail::assertQueued(AlumniRegistrationConfirmedMail::class, function ($mail) {
            $rendered = $mail->render();

            return $mail->hasTo('juantamad@gmail.com')
                && str_contains($rendered, 'You have successfully registered for the TPC Alumni Employment and Career Management System.')
                && str_contains($rendered, 'Your Alumni account has been successfully created. You will now receive official events, announcements, and other important updates from the TPC Alumni Employment and Career Management System.')
                && str_contains($rendered, 'Thank you for becoming part of the TPC Alumni community!');
        });

        // Graduate can log in immediately without any approval required
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'juantamad@gmail.com',
            'password' => 'Password123!',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJson([
                'status' => true,
                'message' => 'Login successful',
            ]);

        // Duplicate registration attempt is prevented
        $duplicateResponse = $this->postJson('/api/auth/register', [
            'name' => 'Juan Tamad',
            'email' => 'juantamad2@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => '2020-1-2020',
        ]);

        $duplicateResponse->assertStatus(422)
            ->assertJsonValidationErrors(['school_id']);

        // Mail queue count must remain 1 (no duplicate mail)
        Mail::assertQueuedCount(1);
    }

    public function test_existing_department_head_and_alumni_can_login_with_email_or_username(): void
    {
        $department = Department::factory()->create();

        // 1. Department Head
        $deptHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'name' => 'Department Head User',
            'email' => 'depthead@tpc.edu.ph',
            'password' => \Illuminate\Support\Facades\Hash::make('AdminPass123!'),
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        // Login with email
        $dhLoginEmail = $this->postJson('/api/auth/login', [
            'email' => 'depthead@tpc.edu.ph',
            'password' => 'AdminPass123!',
        ]);
        $dhLoginEmail->assertStatus(200)
            ->assertJsonPath('data.user.role', User::ROLE_ADMIN);

        // Login with username / name
        $dhLoginUsername = $this->postJson('/api/auth/login', [
            'email' => 'Department Head User',
            'password' => 'AdminPass123!',
        ]);
        $dhLoginUsername->assertStatus(200)
            ->assertJsonPath('data.user.role', User::ROLE_ADMIN);

        // 2. Alumni
        $alumni = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Existing Alumni',
            'email' => 'alumni@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('AlumniPass123!'),
            'school_id' => '2019-1-1000',
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        // Login with email
        $alumniLoginEmail = $this->postJson('/api/auth/login', [
            'email' => 'alumni@gmail.com',
            'password' => 'AlumniPass123!',
        ]);
        $alumniLoginEmail->assertStatus(200)
            ->assertJsonPath('data.user.role', User::ROLE_USER);

        // Login with ID number (school_id)
        $alumniLoginId = $this->postJson('/api/auth/login', [
            'email' => '2019-1-1000',
            'password' => 'AlumniPass123!',
        ]);
        $alumniLoginId->assertStatus(200)
            ->assertJsonPath('data.user.role', User::ROLE_USER);

        // Login with username / name
        $alumniLoginName = $this->postJson('/api/auth/login', [
            'email' => 'Existing Alumni',
            'password' => 'AlumniPass123!',
        ]);
        $alumniLoginName->assertStatus(200)
            ->assertJsonPath('data.user.role', User::ROLE_USER);
    }
}
