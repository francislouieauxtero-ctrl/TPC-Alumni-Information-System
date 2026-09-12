<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlumniEmploymentLogicTest extends TestCase
{
    use RefreshDatabase;

    public function test_newly_registered_alumni_defaults_to_registered_and_not_specified_employment(): void
    {
        $department = Department::factory()->create(['name' => 'College of Computer Studies']);

        $graduate = Graduate::create([
            'department_id'  => $department->id,
            'student_number' => 'CCS-2026-0001',
            'name'           => 'Juan Dela Cruz',
            'batch_year'     => '2026',
            'block'          => 'A',
        ]);

        $this->assertFalse($graduate->isRegistered());
        $this->assertSame('not_registered', $graduate->registration_status);

        // Register student
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Juan Dela Cruz',
            'email'                 => 'juan@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'department_id'         => $department->id,
            'school_id'             => 'CCS-2026-0001',
        ]);

        $response->assertStatus(201);

        // Graduate is now registered
        $graduate->refresh();
        $this->assertTrue($graduate->isRegistered());
        $this->assertSame('registered', $graduate->registration_status);

        // User and profile checks
        $user = User::where('email', 'juan@example.com')->first();
        $this->assertNotNull($user);

        $profile = $user->alumniProfile;
        $this->assertNotNull($profile);

        // Crucial requirement: Do NOT automatically set to unemployed
        $this->assertSame(AlumniProfile::STATUS_NOT_SPECIFIED, $profile->employment_status);
        $this->assertSame('Not Specified', $profile->current_job);
        $this->assertNotSame(AlumniProfile::STATUS_UNEMPLOYED, $profile->employment_status);

        // Fetching profile endpoint returns not_specified
        $profileResponse = $this->actingAs($user, 'sanctum')->getJson('/api/student/profile');
        $profileResponse->assertOk()
            ->assertJsonPath('data.alumniProfile.employment_status', 'not_specified')
            ->assertJsonPath('data.alumniProfile.current_job', 'Not Specified');

        // Admin alumni listing returns not_specified
        $admin = User::factory()->create([
            'role'          => User::ROLE_ADMIN,
            'department_id' => $department->id,
        ]);

        $adminResponse = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/alumni');
        $adminResponse->assertOk();
        $adminAlumni = $adminResponse->json('data');
        $this->assertCount(1, $adminAlumni);
        $this->assertSame('not_specified', $adminAlumni[0]['employment_status']);
        $this->assertSame('Not Specified', $adminAlumni[0]['current_job']);
    }

    public function test_alumni_can_update_employment_information_after_registration(): void
    {
        $department = Department::factory()->create(['name' => 'Engineering']);

        $graduate = Graduate::create([
            'department_id'  => $department->id,
            'student_number' => 'ENG-2026-0002',
            'name'           => 'Maria Clara',
            'batch_year'     => '2026',
        ]);

        $user = User::factory()->create([
            'name'          => 'Maria Clara',
            'email'         => 'maria@example.com',
            'school_id'     => 'ENG-2026-0002',
            'department_id' => $department->id,
            'role'          => User::ROLE_USER,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        $profile = AlumniProfile::create([
            'user_id'           => $user->id,
            'department_id'     => $department->id,
            'graduate_id'       => $graduate->id,
            'employment_status' => AlumniProfile::STATUS_NOT_SPECIFIED,
            'batch_year'        => '2026',
        ]);

        // 1. Alumni adds employed job
        $storeResponse = $this->actingAs($user, 'sanctum')->postJson('/api/employment', [
            'company'         => 'Tech Innovations Inc',
            'position'        => 'Software Engineer',
            'employment_type' => AlumniProfile::STATUS_EMPLOYED,
            'start_date'      => '2026-01-15',
            'is_current'      => true,
        ]);

        $storeResponse->assertStatus(201);
        $profile->refresh();
        $this->assertSame(AlumniProfile::STATUS_EMPLOYED, $profile->employment_status);
        $this->assertSame('Software Engineer', $profile->current_job);
        $this->assertSame('Tech Innovations Inc', $profile->company);

        // 2. Alumni updates to self-employed
        $selfEmpResponse = $this->actingAs($user, 'sanctum')->postJson('/api/employment', [
            'company'         => 'Self Consulting',
            'position'        => 'Freelance Developer',
            'employment_type' => AlumniProfile::STATUS_SELF_EMPLOYED,
            'is_current'      => true,
        ]);

        $selfEmpResponse->assertStatus(201);
        $profile->refresh();
        $this->assertSame(AlumniProfile::STATUS_SELF_EMPLOYED, $profile->employment_status);

        // 3. Alumni updates to unemployed explicitly
        $unemployedResponse = $this->actingAs($user, 'sanctum')->postJson('/api/employment', [
            'industry'        => 'Taking time to study for certifications',
            'employment_type' => AlumniProfile::STATUS_UNEMPLOYED,
            'is_current'      => true,
        ]);

        $unemployedResponse->assertStatus(201);
        $profile->refresh();
        $this->assertSame(AlumniProfile::STATUS_UNEMPLOYED, $profile->employment_status);
        $this->assertNull($profile->current_job);
    }

    public function test_dashboard_does_not_count_not_specified_as_unemployed(): void
    {
        $department = Department::factory()->create(['name' => 'Business']);

        $user = User::factory()->create([
            'role'          => User::ROLE_USER,
            'department_id' => $department->id,
            'is_verified'   => true,
            'status'        => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id'           => $user->id,
            'department_id'     => $department->id,
            'employment_status' => AlumniProfile::STATUS_NOT_SPECIFIED,
            'batch_year'        => '2026',
        ]);

        $admin = User::factory()->create([
            'role'          => User::ROLE_ADMIN,
            'department_id' => $department->id,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');
        $response->assertOk();

        $stats = $response->json('data.stats');
        $this->assertSame(0, $stats['unemployed_alumni'], 'Newly registered alumni must not inflate unemployed_alumni metric');
        $this->assertSame(0, $stats['employed_alumni']);
        $this->assertSame(1, $stats['not_specified_alumni']);
    }
}
