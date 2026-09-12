<?php

namespace Tests\Feature;

use App\Mail\AnnouncementNotificationMail;
use App\Mail\EventNotificationMail;
use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProfileAndGraduateNameRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_alumni_cannot_edit_name(): void
    {
        $department = Department::factory()->create();

        $student = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Original Student Name',
            'email' => 'student@example.com',
            'department_id' => $department->id,
            'school_id' => 'STU-100',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $student->id,
            'department_id' => $department->id,
            'batch_year' => '2026',
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/profile', [
                'name' => 'Attempted Changed Name',
                'email' => 'student@example.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                'name' => ['Alumni name cannot be edited.'],
            ]);

        $this->assertSame('Original Student Name', $student->fresh()->name);
    }

    public function test_alumni_can_update_email_contact_number_and_location(): void
    {
        $department = Department::factory()->create();

        $student = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Maria Clara',
            'email' => 'old_email@gmail.com',
            'department_id' => $department->id,
            'school_id' => 'STU-101',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $student->id,
            'department_id' => $department->id,
            'contact_number' => '09123456789',
            'location' => 'Old Address',
            'batch_year' => '2026',
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/profile', [
                'name' => 'Maria Clara', // unchanged name allowed
                'email' => 'new_email@gmail.com',
                'contact_number' => '09988776655',
                'location' => 'New Address, Bohol',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', true);

        $freshUser = $student->fresh()->load('alumniProfile');
        $this->assertSame('Maria Clara', $freshUser->name);
        $this->assertSame('new_email@gmail.com', $freshUser->email);
        $this->assertSame('09988776655', $freshUser->alumniProfile->contact_number);
        $this->assertSame('New Address, Bohol', $freshUser->alumniProfile->location);
    }

    public function test_updated_email_receives_future_event_and_announcement_notifications(): void
    {
        Mail::fake();

        $department = Department::factory()->create();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $student = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Crisostomo Ibarra',
            'email' => 'old_primary@gmail.com',
            'department_id' => $department->id,
            'school_id' => 'STU-102',
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $student->id,
            'department_id' => $department->id,
            'batch_year' => '2026',
        ]);

        // Student updates their email
        $updateResp = $this->actingAs($student, 'sanctum')
            ->putJson('/api/student/profile', [
                'name' => 'Crisostomo Ibarra',
                'email' => 'new_primary@gmail.com',
            ]);
        $updateResp->assertStatus(200);

        // Admin creates an announcement
        $announcementResp = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/announcements', [
                'title' => 'Important Alumni Gathering',
                'content' => 'Join our upcoming general assembly.',
                'department_id' => $department->id,
            ]);
        $announcementResp->assertStatus(201);

        // Admin creates an event
        $eventResp = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/events', [
                'title' => 'Annual Alumni Gala',
                'description' => 'Celebration of achievements.',
                'location' => 'Grand Hall',
                'event_date' => now()->addDays(5)->format('Y-m-d H:i'),
                'scope' => 'department_specific',
                'department_id' => $department->id,
            ]);
        $eventResp->assertStatus(201);

        // Verify notifications target new email
        Mail::assertQueued(AnnouncementNotificationMail::class, function ($mail) {
            return $mail->hasTo('new_primary@gmail.com');
        });

        Mail::assertQueued(EventNotificationMail::class, function ($mail) {
            return $mail->hasTo('new_primary@gmail.com');
        });

        // Verify old email is NEVER queued
        Mail::assertNotQueued(AnnouncementNotificationMail::class, function ($mail) {
            return $mail->hasTo('old_primary@gmail.com');
        });

        Mail::assertNotQueued(EventNotificationMail::class, function ($mail) {
            return $mail->hasTo('old_primary@gmail.com');
        });
    }

    public function test_department_head_can_edit_name_of_unregistered_graduate(): void
    {
        $department = Department::factory()->create();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'GRAD-001',
            'name' => 'Initial Graduate Name',
            'batch_year' => '2026',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'name' => 'Corrected Graduate Name',
                'student_number' => 'GRAD-001',
                'batch_year' => '2026',
            ]);

        $response->assertStatus(200);
        $this->assertSame('Corrected Graduate Name', $graduate->fresh()->name);
    }

    public function test_department_head_cannot_edit_name_of_registered_graduate(): void
    {
        $department = Department::factory()->create();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'GRAD-002',
            'name' => 'Locked Registered Name',
            'batch_year' => '2026',
        ]);

        // Graduate registers as Alumni
        $user = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Locked Registered Name',
            'email' => 'locked@gmail.com',
            'school_id' => 'GRAD-002',
            'department_id' => $department->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $user->id,
            'graduate_id' => $graduate->id,
            'department_id' => $department->id,
            'batch_year' => '2026',
        ]);

        $this->assertTrue($graduate->fresh()->isRegistered());

        // Department Head attempts to edit the name
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'name' => 'Attempted Name Change By Dept Head',
                'student_number' => 'GRAD-002',
                'batch_year' => '2026',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                'name' => ['The registered name is locked and cannot be edited because this graduate has already registered as an Alumni.'],
            ]);

        $this->assertSame('Locked Registered Name', $graduate->fresh()->name);
    }

    public function test_department_head_can_update_id_number_of_unregistered_graduate_and_old_id_is_freed(): void
    {
        $department = Department::factory()->create();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'OLD-ID-999',
            'name' => 'John Santos',
            'batch_year' => '2025',
            'block' => 'Block 1',
        ]);

        // Dept head updates ID number and fields on unregistered graduate
        $updateResponse = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'student_number' => 'NEW-ID-999',
                'name' => 'John Santos Updated',
                'batch_year' => '2026',
                'block' => 'Block 2',
            ]);

        $updateResponse->assertStatus(200);

        $fresh = $graduate->fresh();
        $this->assertSame('NEW-ID-999', $fresh->student_number);
        $this->assertSame('John Santos Updated', $fresh->name);
        $this->assertSame('2026', $fresh->batch_year);
        $this->assertSame('Block 2', $fresh->block);

        // 1. Old ID Number is freed: another graduate can take OLD-ID-999
        $newGraduateWithOldId = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'OLD-ID-999',
            'name' => 'Another Student',
            'batch_year' => '2026',
        ]);
        $this->assertDatabaseHas('graduates', [
            'id' => $newGraduateWithOldId->id,
            'student_number' => 'OLD-ID-999',
        ]);

        // 2. Old ID Number is no longer valid for the updated graduate during Alumni registration
        $regAttemptWithOldId = $this->postJson('/api/auth/register', [
            'name' => 'John Santos Updated',
            'email' => 'john.old@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => 'OLD-ID-999', // Points to "Another Student", not "John Santos Updated"
        ]);
        $regAttemptWithOldId->assertStatus(422)
            ->assertJsonValidationErrors(['name']); // Fails name check because OLD-ID-999 belongs to "Another Student"

        // 3. New ID Number is used for future Alumni registration validation and succeeds
        $regAttemptWithNewId = $this->postJson('/api/auth/register', [
            'name' => 'John Santos Updated',
            'email' => 'john.new@gmail.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => 'NEW-ID-999',
        ]);
        $regAttemptWithNewId->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'john.new@gmail.com',
            'school_id' => 'NEW-ID-999',
        ]);
    }

    public function test_department_head_cannot_edit_id_number_year_graduated_or_block_of_registered_graduate(): void
    {
        $department = Department::factory()->create();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'GRAD-LOCKED-01',
            'name' => 'Alumni Graduate',
            'batch_year' => '2026',
            'block' => 'Block 1',
        ]);

        // Register graduate as Alumni
        $alumniUser = User::factory()->create([
            'role' => User::ROLE_USER,
            'name' => 'Alumni Graduate',
            'email' => 'alumni.locked@gmail.com',
            'school_id' => 'GRAD-LOCKED-01',
            'department_id' => $department->id,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        AlumniProfile::create([
            'user_id' => $alumniUser->id,
            'graduate_id' => $graduate->id,
            'department_id' => $department->id,
            'batch_year' => '2026',
        ]);

        $this->assertTrue($graduate->fresh()->isRegistered());

        // Attempt to edit ID Number
        $idResp = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'student_number' => 'GRAD-ATTEMPTED-CHANGE',
                'name' => 'Alumni Graduate',
                'batch_year' => '2026',
                'block' => 'Block 1',
            ]);
        $idResp->assertStatus(422)
            ->assertJsonValidationErrors(['student_number'])
            ->assertJsonFragment([
                'student_number' => ['The ID number is locked and cannot be edited because this graduate has already registered as an Alumni.'],
            ]);

        // Attempt to edit Year Graduated
        $yearResp = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'student_number' => 'GRAD-LOCKED-01',
                'name' => 'Alumni Graduate',
                'batch_year' => '2027',
                'block' => 'Block 1',
            ]);
        $yearResp->assertStatus(422)
            ->assertJsonValidationErrors(['batch_year'])
            ->assertJsonFragment([
                'batch_year' => ['The year graduated is locked and cannot be edited because this graduate has already registered as an Alumni.'],
            ]);

        // Attempt to edit Block
        $blockResp = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'student_number' => 'GRAD-LOCKED-01',
                'name' => 'Alumni Graduate',
                'batch_year' => '2026',
                'block' => 'Block 99',
            ]);
        $blockResp->assertStatus(422)
            ->assertJsonValidationErrors(['block'])
            ->assertJsonFragment([
                'block' => ['The block is locked and cannot be edited because this graduate has already registered as an Alumni.'],
            ]);

        // Verify graduate record in database is completely untouched
        $fresh = $graduate->fresh();
        $this->assertSame('GRAD-LOCKED-01', $fresh->student_number);
        $this->assertSame('Alumni Graduate', $fresh->name);
        $this->assertSame('2026', $fresh->batch_year);
        $this->assertSame('Block 1', $fresh->block);
    }

    public function test_department_head_can_create_graduate_record(): void
    {
        $department = Department::factory()->create();

        $deptHead = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($deptHead, 'sanctum')
            ->postJson('/api/admin/graduates', [
                'department_id' => $department->id,
                'student_number' => 'GRAD-NEW-2026',
                'name' => 'New Graduate Name',
                'batch_year' => '2026',
                'block' => 'Block A',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('graduates', [
            'department_id' => $department->id,
            'student_number' => 'GRAD-NEW-2026',
            'name' => 'New Graduate Name',
            'batch_year' => '2026',
            'block' => 'Block A',
        ]);
    }

    public function test_super_admin_cannot_create_or_update_graduate_records(): void
    {
        $department = Department::factory()->create();

        $superAdmin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'status' => User::STATUS_ACTIVE,
        ]);

        $graduate = Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'GRAD-PRESIDENT-TEST',
            'name' => 'President Test Grad',
            'batch_year' => '2026',
        ]);

        // Attempt Create
        $createResponse = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/admin/graduates', [
                'department_id' => $department->id,
                'student_number' => 'GRAD-SUPERADMIN-FAIL',
                'name' => 'Attempted Grad',
                'batch_year' => '2026',
            ]);
        $createResponse->assertStatus(403);

        // Attempt Update
        $updateResponse = $this->actingAs($superAdmin, 'sanctum')
            ->putJson("/api/admin/graduates/{$graduate->id}", [
                'student_number' => 'GRAD-UPDATED-BY-SUPERADMIN',
                'name' => 'President Test Grad Updated',
                'batch_year' => '2026',
            ]);
        $updateResponse->assertStatus(403);

        // Attempt Delete
        $deleteResponse = $this->actingAs($superAdmin, 'sanctum')
            ->deleteJson("/api/admin/graduates/{$graduate->id}");
        $deleteResponse->assertStatus(403);
    }

    public function test_newly_registered_alumni_has_registered_status_and_not_specified_employment(): void
    {
        $department = Department::factory()->create();

        Graduate::factory()->create([
            'department_id' => $department->id,
            'student_number' => 'REG-2026-TEST',
            'name' => 'Pedro Penduko',
            'batch_year' => '2026',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pedro Penduko',
            'email' => 'pedro@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'department_id' => $department->id,
            'school_id' => 'REG-2026-TEST',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'pedro@example.com')->firstOrFail();
        $this->assertTrue($user->is_verified);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);

        $profile = $user->alumniProfile;
        $this->assertNotNull($profile);
        $this->assertSame(AlumniProfile::STATUS_NOT_SPECIFIED, $profile->employment_status);
        $this->assertSame('Not Specified', $profile->current_job);
        $this->assertNull($profile->company);
    }
}

