<?php

namespace Tests\Feature;

use App\Http\Resources\AlumniProfileResource;
use App\Http\Resources\UserResource;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageRouteFallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_storage_route_serves_existing_file_from_public_disk(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/test-image.jpg', 'fake-image-binary-data');

        $response = $this->get('/storage/avatars/test-image.jpg');

        $response->assertOk();
        $this->assertEquals('fake-image-binary-data', $response->streamedContent());
    }

    public function test_storage_route_serves_bare_filename_from_avatars_folder(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/bare-avatar.webp', 'fake-webp-binary-data');

        $response = $this->get('/storage/bare-avatar.webp');

        $response->assertOk();
        $this->assertEquals('fake-webp-binary-data', $response->streamedContent());
    }

    public function test_storage_route_returns_404_for_nonexistent_files(): void
    {
        Storage::fake('public');

        $response = $this->get('/storage/avatars/non-existent.jpg');

        $response->assertNotFound();
    }

    public function test_user_and_alumni_resources_normalize_bare_filenames(): void
    {
        $user = new User([
            'id' => 999,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'role' => 'user',
            'avatar' => 'bare-profile.webp',
        ]);

        $userResourceArray = (new UserResource($user))->toArray(request());
        $this->assertEquals('/storage/avatars/bare-profile.webp', $userResourceArray['avatar']);

        $profile = new AlumniProfile([
            'id' => 999,
            'user_id' => 999,
            'profile_photo_url' => 'bare-profile.webp',
        ]);

        $profileResourceArray = (new AlumniProfileResource($profile))->toArray(request());
        $this->assertEquals('/storage/avatars/bare-profile.webp', $profileResourceArray['profile_photo_url']);
    }
}
