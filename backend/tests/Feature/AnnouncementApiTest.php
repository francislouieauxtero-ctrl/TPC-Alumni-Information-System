<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnnouncementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_announcement_with_extended_fields(): void
    {
        Storage::fake('public');

        $department = Department::factory()->create();
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/announcements', [
            'content' => 'Department update for the month.',
            'external_link' => 'https://example.com/announcement',
            'posted_at' => '2026-08-07T14:30:00',
            'posted_by' => 'department_head',
            'department_category' => 'Computer Studies',
            'images' => [
                UploadedFile::fake()->create('cover.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('banner.png', 120, 'image/png'),
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.external_link', 'https://example.com/announcement')
            ->assertJsonPath('data.posted_by', 'department_head')
            ->assertJsonPath('data.department_category', 'Computer Studies')
            ->assertJsonPath('data.posted_at', '2026-08-07T14:30:00.000000Z');
    }

    public function test_admin_can_create_announcement_with_documents_and_video_uploads(): void
    {
        Storage::fake('public');

        $department = Department::factory()->create();
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'department_id' => $department->id,
            'status' => User::STATUS_ACTIVE,
            'is_verified' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/announcements', [
            'title' => 'Semester reminders',
            'content' => 'Please review the attached handbook and recording.',
            'external_link' => 'https://docs.google.com/document/d/example',
            'images' => [
                UploadedFile::fake()->create('handbook.pdf', 200, 'application/pdf'),
                UploadedFile::fake()->create('orientation.docx', 180, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
                UploadedFile::fake()->create('promo.mp4', 300, 'video/mp4'),
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.external_link', 'https://docs.google.com/document/d/example');

        $this->assertIsArray($response->json('data.images'));
        $this->assertNotEmpty($response->json('data.images'));
    }
}
