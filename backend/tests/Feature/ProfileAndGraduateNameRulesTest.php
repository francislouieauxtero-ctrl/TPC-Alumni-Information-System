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
}
