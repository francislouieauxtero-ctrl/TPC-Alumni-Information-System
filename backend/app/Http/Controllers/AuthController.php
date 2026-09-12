<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\CreateDepartmentAdminRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\GoogleLoginRequest;
use App\Http\Requests\GoogleRegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\RegisterStudentRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponder;

    public function __construct(protected AuthService $authService)
    {
    }

    public function register(RegisterStudentRequest $request): JsonResponse
    {
        $user = $this->authService->createStudent($request->validated());

        return $this->success(
            'Registration successful! You can now log in.',
            new UserResource($user->load('department')),
            201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->input('email') ?? $request->input('username');

        $user = $this->authService->attemptLogin((string) $login, $request->password);

        return $this->issueTokenResponse($user, 'Login successful');
    }

    public function user(): JsonResponse
    {
        return $this->success('Success', new UserResource(auth()->user()->load('department')));
    }

    public function logout(): JsonResponse
    {
        auth()->user()->currentAccessToken()?->delete();

        return $this->success('Logged out successfully');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success('Password reset link sent to your email');
        }

        return $this->error('Unable to send reset link', 500, ['status' => __($status)]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success('Password has been reset successfully');
        }

        return $this->error('Password reset failed', 500, ['status' => __($status)]);
    }

    public function googleRegister(GoogleRegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $this->authService->registerWithGoogle(
            $request->access_token,
            $request->department_id,
            $request->school_id
        );

        return $this->success(
            'Registration successful! You can now log in.',
            new UserResource($user->load('department')),
            201
        );
    }

    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $this->authService->loginWithGoogle($request->access_token);

        return $this->issueTokenResponse($user, 'Google login successful');
    }

    public function createDepartmentAdmin(CreateDepartmentAdminRequest $request): JsonResponse
    {
        $admin = $this->authService->createDepartmentAdmin($request->validated());

        return $this->success(
            'Department head created successfully',
            new UserResource($admin->load('department')),
            201
        );
    }

    private function issueTokenResponse(User $user, string $message): JsonResponse
    {
        return $this->success($message, [
            'token' => $this->authService->issueToken($user),
            'user' => new UserResource($user->load('department')),
        ]);
    }
}
