<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DepartmentHeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\V1\GraduateController;
use App\Http\Controllers\Api\V1\AlumniController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\AnnouncementController;
use App\Http\Controllers\Api\V1\JobHistoryController;

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('register', 'register');
    Route::post('login', 'login');
    Route::post('google-register', 'googleRegister');
    Route::post('google-login', 'googleLogin');
    Route::post('forgot-password', 'forgotPassword');
    Route::post('reset-password', 'resetPassword');
});

Route::get('departments', [DepartmentController::class, 'index']);

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::prefix('auth')->controller(AuthController::class)->group(function () {
        Route::post('logout', 'logout');
        Route::get('user', 'user');
    });

Route::prefix('super-admin')->middleware('role:super_admin')->group(function () {
    Route::post('department-admins', [AuthController::class, 'createDepartmentAdmin']);
    Route::get('department-admins', [AdminController::class, 'listDepartmentAdmins']);
    Route::put('department-admins/{id}', [AdminController::class, 'updateDepartmentAdmin']);
    Route::delete('department-admins/{id}', [AdminController::class, 'deleteDepartmentAdmin']);
    Route::post('department-admins/{id}/reject', [AdminController::class, 'rejectDepartmentHead']);
    Route::post('department-admins/{id}/activate', [AdminController::class, 'activateDepartmentHead']);
    Route::post('department-admins/{id}/deactivate', [AdminController::class, 'deactivateDepartmentHead']);
    Route::patch('department-heads/{id}/activate', [AdminController::class, 'activateDepartmentHead']);
    Route::patch('department-heads/{id}/deactivate', [AdminController::class, 'deactivateDepartmentHead']);
    Route::apiResource('departments', DepartmentController::class)->except(['index']);
    Route::apiResource('graduates', GraduateController::class);
});
Route::prefix('admin')->middleware('role:super_admin,admin')->group(function () {
    Route::controller(AdminController::class)->group(function () {
        Route::get('dashboard', 'dashboard');
        Route::get('stats', 'stats');
        Route::get('students', 'listStudents');
        Route::post('students/{id}/verify', 'verifyStudent');
        Route::post('students/{id}/reject', 'rejectStudent');
        Route::post('profile', 'updateProfile');
        Route::put('profile', 'updateProfile');
        Route::post('students/{id}/deactivate', 'deactivateStudent');
        Route::post('students/{id}/activate', 'activateStudent');
        Route::delete('students/{id}', 'deleteStudent');
    });

    Route::controller(AlumniController::class)->group(function () {
        Route::get('alumni', 'index');
        Route::get('alumni/pending', 'pending');
        Route::get('alumni/rejected', 'rejected');
        Route::delete('alumni/rejected/{rejection}', 'deleteRejected');
        Route::patch('alumni/{alumni}/approve', 'approve');
        Route::patch('alumni/{alumni}/reject', 'reject');
        Route::get('alumni/alignment/summary',               'alignmentSummary');
        Route::get('alumni/alignment/detail/{departmentId}', 'alignmentDetail');
    });

    Route::get('students/{user}/employment', [JobHistoryController::class, 'forUser']);

   Route::apiResource('graduates', GraduateController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
});

    Route::prefix('department-head')->middleware('role:admin')->group(function () {
        Route::controller(DepartmentHeadController::class)->group(function () {
            Route::get('dashboard', 'dashboard');
            Route::get('stats', 'stats');
            Route::get('students', 'listStudents');
            Route::post('students/{id}/verify', 'verifyStudent');
            Route::post('students/{id}/reject', 'rejectStudent');
            Route::post('students/{id}/deactivate', 'deactivateStudent');
            Route::post('students/{id}/activate', 'activateStudent');
            Route::delete('students/{id}', 'deleteStudent');
        });
    });

    Route::prefix('student')->middleware(['role:user', 'verified.student'])->group(function () {
        Route::controller(StudentController::class)->group(function () {
            Route::get('dashboard', 'dashboard');
            Route::get('profile', 'profile');
            Route::put('profile', 'updateProfile');
        });
    });

    Route::post('profile', [ProfileController::class, 'update']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('profile/avatar', [ProfileController::class, 'deleteAvatar']);

    // Events - accessible to all authenticated users
    Route::apiResource('events', EventController::class);

    // Announcements - accessible to all authenticated users
    Route::apiResource('announcements', AnnouncementController::class);

    Route::middleware(['role:user', 'verified.student'])->group(function () {
        Route::apiResource('employment', JobHistoryController::class);

        // ── Work alignment self-report (alumni only) ──────────────────────────
        // POST /api/employment/alignment
        // Alumni answers: "Is your current job aligned with your course?"
        Route::post('employment/alignment', [AlumniController::class, 'updateAlignment']);
    });
});