<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\AlumniProfileResource;
use App\Http\Resources\UserResource;
use App\Models\AlumniProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $user = $request->user()->load('department', 'alumniProfile');

            return response()->json([
                'status' => true,
                'message' => 'Welcome to your student dashboard',
                'data' => new UserResource($user),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard',
                'data' => (object) [],
            ], 500);
        }
    }

    public function profile(Request $request): JsonResponse
{
    try {
        $user = $request->user()->load('department');

        $user->alumniProfile()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'department_id'     => $user->department_id,
                'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
            ]
        );

        return response()->json([
            'status'  => true,
            'message' => 'Success',
            'data'    => new UserResource($user->fresh()->load('department', 'alumniProfile')),
        ]);
    } catch (\Throwable $e) {
        report($e);

        return response()->json([
            'status'  => false,
            'message' => 'Failed to fetch profile',
            'data'    => (object) [],
        ], 500);
    }
}

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            if ($request->hasFile('avatar')) {
                if ($user->avatar && ! str_starts_with($user->avatar, 'http')) {
                    Storage::disk('public')->delete(ltrim(str_replace('/storage/', '', $user->avatar), '/'));
                }

                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = "/storage/{$path}";
            }

            $user->update(Arr::only($validated, ['email', 'avatar']));

            $profileData = Arr::only($validated, ['contact_number', 'location']);
            if ($request->hasFile('avatar')) {
                $profileData['profile_photo_url'] = $validated['avatar'];
            }

            if (!empty(array_filter($profileData, fn ($value) => $value !== null && $value !== "")) || $request->hasFile('avatar')) {
                $profile = $user->alumniProfile()->firstOrNew(['user_id' => $user->id]);
                $profile->fill($profileData);
                $profile->department_id = $user->department_id;
                if (! $profile->exists) {
                    $profile->employment_status = $profile->employment_status ?? AlumniProfile::STATUS_UNEMPLOYED;
                }
                $profile->save();
            }

            return response()->json([
                'status' => true,
                'message' => 'Profile updated successfully',
                'data' => new UserResource($user->refresh()->load('department', 'alumniProfile')),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to update profile',
                'data' => (object) [],
            ], 500);
        }
    }
}
