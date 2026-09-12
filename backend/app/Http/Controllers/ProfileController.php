<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->isStudent()) {
            $data = Arr::except($data, ['name', 'batch_year']);
        }

        if ($request->hasFile('avatar')) {
            $this->deleteStoredAvatar($user);

            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = "/storage/{$path}";

            if ($user->alumniProfile) {
                $user->alumniProfile->update(['profile_photo_url' => $data['avatar']]);
            }
        }

        if ($user->alumniProfile) {
            $profileUpdates = Arr::only($data, ['contact_number', 'location']);
            if (!empty($profileUpdates)) {
                $user->alumniProfile->update($profileUpdates);
            }
        }

        $user->update(Arr::only($data, ['name', 'email', 'avatar']));

        return response()->json([
            'status' => true,
            'message' => 'Profile updated.',
            'data' => new UserResource($user->fresh()->load('department', 'alumniProfile')),
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $this->deleteStoredAvatar($user);

        $path = $request->file('avatar')->store('avatars', 'public');
        $avatarUrl = "/storage/{$path}";
        $user->update(['avatar' => $avatarUrl]);

        if ($user->alumniProfile) {
            $user->alumniProfile->update(['profile_photo_url' => $avatarUrl]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Avatar updated successfully.',
            'data' => new UserResource($user->fresh()->load('department', 'alumniProfile')),
        ]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->deleteStoredAvatar($user);
        $user->update(['avatar' => null]);

        if ($user->alumniProfile) {
            $user->alumniProfile->update(['profile_photo_url' => null]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Avatar removed.',
            'data' => new UserResource($user->fresh()->load('department', 'alumniProfile')),
        ]);
    }

    private function deleteStoredAvatar($user): void
    {
        if (! $user->avatar) {
            return;
        }

        $storedPath = $user->avatar;
        if (str_starts_with($storedPath, 'http')) {
            return;
        }

        $relativePath = ltrim(str_replace('/storage/', '', $storedPath), '/');
        if ($relativePath) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
