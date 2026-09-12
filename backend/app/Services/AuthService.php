<?php

namespace App\Services;

use App\Exceptions\Auth\AccountInactiveException;
use App\Exceptions\Auth\EmailAlreadyRegisteredException;
use App\Exceptions\Auth\InvalidCredentialsException;
use App\Exceptions\Auth\InvalidGoogleTokenException;
use App\Exceptions\Auth\PendingApprovalException;
use App\Exceptions\Auth\StudentNotFoundException;
use App\Mail\AlumniRegistrationConfirmedMail;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class AuthService
{
    public function __construct(protected UserRepository $users)
    {
    }

    public function createStudent(array $attributes): User
    {
        return DB::transaction(function () use ($attributes) {
            $user = $this->users->create([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
                'department_id' => $attributes['department_id'],
                'school_id' => $attributes['school_id'] ?? null,
                'role' => User::ROLE_USER,
                'is_verified' => true,
                'status' => User::STATUS_ACTIVE,
            ]);

            $graduate = $user->graduate;
            AlumniProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'department_id'     => $user->department_id,
                    'graduate_id'       => $graduate?->id,
                    'batch_year'        => $graduate?->batch_year,
                    'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
                ]
            );

            Mail::to($user->email)->queue(new AlumniRegistrationConfirmedMail($user));

            return $user;
        });
    }

    public function createDepartmentAdmin(array $attributes): User
    {
        return $this->users->create([
            'name' => $attributes['name'],
            'email' => $attributes['email'],
            'password' => Hash::make($attributes['password']),
            'department_id' => $attributes['department_id'],
            'role' => User::ROLE_ADMIN,
            'is_verified' => true,
            'status' => User::STATUS_ACTIVE,
        ]);
    }

    public function createStudentFromGoogle(array $profile, int $departmentId, ?string $schoolId = null): User
    {
        return DB::transaction(function () use ($profile, $departmentId, $schoolId) {
            $user = $this->users->create([
                'name' => $profile['name'] ?? $profile['email'],
                'email' => $profile['email'],
                'google_id' => $profile['sub'],
                'avatar' => $profile['picture'] ?? null,
                'department_id' => $departmentId,
                'school_id' => $schoolId,
                'role' => User::ROLE_USER,
                'is_verified' => true,
                'status' => User::STATUS_ACTIVE,
                'password' => null,
            ]);

            $graduate = $user->graduate;
            AlumniProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'department_id'     => $user->department_id,
                    'graduate_id'       => $graduate?->id,
                    'batch_year'        => $graduate?->batch_year,
                    'employment_status' => AlumniProfile::STATUS_UNEMPLOYED,
                ]
            );

            Mail::to($user->email)->queue(new AlumniRegistrationConfirmedMail($user));

            return $user;
        });
    }

    public function attemptLogin(string $email, string $password): User
    {
        $user = $this->users->findByEmail($email);

        if (!$user || !$user->password || !Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException();
        }

        if (!$user->isActive()) {
            throw new AccountInactiveException();
        }

        if ($user->isStudent() && !$user->isVerified()) {
            throw new PendingApprovalException();
        }

        return $user;
    }

    public function loginWithGoogle(string $accessToken): User
    {
        $profile = $this->googleProfile($accessToken);

        if (!$profile) {
            throw new InvalidGoogleTokenException();
        }

        $user = $this->users->findByEmail($profile['email']);

        if (!$user || !$user->isStudent() || ($user->google_id && $user->google_id !== $profile['sub'])) {
            throw new StudentNotFoundException();
        }

        if (!$user->google_id) {
            $user->update(['google_id' => $profile['sub']]);
        }

        if (!$user->isActive()) {
            throw new AccountInactiveException();
        }

        if (!$user->isVerified()) {
            throw new PendingApprovalException();
        }

        return $user;
    }

    public function registerWithGoogle(string $accessToken, int $departmentId, ?string $schoolId = null): User
    {
        $profile = $this->googleProfile($accessToken);

        if (!$profile) {
            throw new InvalidGoogleTokenException();
        }

        if ($this->users->findByEmail($profile['email'])) {
            throw new EmailAlreadyRegisteredException();
        }

        return $this->createStudentFromGoogle($profile, $departmentId, $schoolId);
    }

    public function issueToken(User $user): string
    {
        return $user->createToken('auth-token')->plainTextToken;
    }

    public function googleProfile(string $accessToken): ?array
    {
        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if (!$response->ok()) {
            return null;
        }

        $profile = $response->json();

        if (!isset($profile['sub'], $profile['email'])) {
            return null;
        }

        return $profile;
    }
}
