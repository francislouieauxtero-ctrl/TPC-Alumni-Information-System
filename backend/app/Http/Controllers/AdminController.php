<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\AlumniProfile;
use App\Models\Department;
use App\Models\Graduate;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function __construct(protected UserRepository $users)
    {
    }

    public function dashboard(Request $request): JsonResponse
    {
        try {
            $actor = $request->user();

            $requestedDept = $request->input('department_id') ?? $request->input('department');
            if ($requestedDept === '') {
                $requestedDept = null;
            }
            if ($requestedDept && ! is_numeric($requestedDept)) {
                $deptId = Department::where('name', $requestedDept)->value('id');
                $requestedDept = $deptId ?: null;
            } else {
                $requestedDept = $requestedDept ? (int) $requestedDept : null;
            }
            $requestedBatch = $request->filled('batch') ? trim((string) $request->batch) : null;

            if ($actor->isAdmin()) {
                $requestedDept = $actor->department_id;
            }

            $studentsQuery = $this->users->students()->visibleTo($actor)
                ->when($requestedDept, fn ($query) => $query->where('users.department_id', $requestedDept))
                ->when($requestedBatch, fn ($query) => $query->whereHas('alumniProfile', function ($q) use ($requestedBatch) {
                    $q->where('batch_year', $requestedBatch);
                }));

            $departmentHeads = $actor->isSuperAdmin()
                ? User::admins()
                : User::admins()->where('department_id', $actor->department_id);

            $alumniQuery = AlumniProfile::query()->whereHas('user', function ($q) {
                $q->where('is_verified', true)->where('role', User::ROLE_USER);
            })
                ->when($requestedDept, fn ($query) => $query->where('department_id', $requestedDept))
                ->when($requestedBatch, fn ($query) => $query->where('batch_year', $requestedBatch));

            $userStats = (clone $studentsQuery)
                ->selectRaw(
                    'COUNT(*) as total_students, ' .
                    'SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_students, ' .
                    'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active_students, ' .
                    'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as inactive_students',
                    [User::STATUS_ACTIVE, User::STATUS_INACTIVE]
                )
                ->first();

            $employmentStats = (clone $alumniQuery)
                ->selectRaw(
                    'SUM(CASE WHEN employment_status = ? THEN 1 ELSE 0 END) as employed_alumni, ' .
                    'SUM(CASE WHEN employment_status = ? THEN 1 ELSE 0 END) as self_employed_alumni, ' .
                    'SUM(CASE WHEN employment_status = ? THEN 1 ELSE 0 END) as unemployed_alumni, ' .
                    'SUM(CASE WHEN employment_status = ? THEN 1 ELSE 0 END) as not_specified_alumni',
                    [
                        AlumniProfile::STATUS_EMPLOYED,
                        AlumniProfile::STATUS_SELF_EMPLOYED,
                        AlumniProfile::STATUS_UNEMPLOYED,
                        AlumniProfile::STATUS_NOT_SPECIFIED,
                    ]
                )
                ->first();

            $graduatesQuery = Graduate::query()
                ->when($requestedDept, fn ($query) => $query->where('graduates.department_id', $requestedDept))
                ->when($requestedBatch, fn ($query) => $query->where('graduates.batch_year', $requestedBatch));

            $graduatesStats = (clone $graduatesQuery)
                ->leftJoin('alumni_profiles', 'alumni_profiles.graduate_id', '=', 'graduates.id')
                ->selectRaw(
                    'COUNT(*) as total_graduates, ' .
                    'SUM(CASE WHEN alumni_profiles.id IS NULL THEN 1 ELSE 0 END) as not_registered_graduates'
                )
                ->first();

            $graduatesByYear = (clone $graduatesQuery)
                ->selectRaw('batch_year, COUNT(*) as cnt')
                ->groupBy('batch_year')
                ->pluck('cnt', 'batch_year')
                ->toArray();

            $departmentCounts = (clone $studentsQuery)
                ->leftJoin('alumni_profiles', 'alumni_profiles.user_id', '=', 'users.id')
                ->leftJoin('departments as user_departments', 'user_departments.id', '=', 'users.department_id')
                ->leftJoin('departments as alumni_department_names', 'alumni_department_names.id', '=', 'alumni_profiles.department_id')
                ->selectRaw('COALESCE(user_departments.name, alumni_department_names.name) as department_name, COUNT(*) as total')
                ->groupBy('department_name')
                ->pluck('total', 'department_name')
                ->toArray();

            $allDepartments = Department::query()
                ->when($requestedDept, fn ($query) => $query->whereKey($requestedDept))
                ->pluck('name')
                ->all();

            $byDepartment = [];
            foreach ($allDepartments as $departmentName) {
                $byDepartment[$departmentName] = (int) ($departmentCounts[$departmentName] ?? 0);
            }

            if (empty($byDepartment) && ! empty($departmentCounts)) {
                $byDepartment = array_map('intval', $departmentCounts);
            }

            $departmentHeadStats = (clone $departmentHeads)
                ->selectRaw(
                    'COUNT(*) as total_department_heads, ' .
                    'SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_department_heads, ' .
                    'SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) as unverified_department_heads, ' .
                    'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active_department_heads, ' .
                    'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as inactive_department_heads',
                    [User::STATUS_ACTIVE, User::STATUS_INACTIVE]
                )
                ->first();

            $stats = [
                'total_students' => (int) ($userStats->total_students ?? 0),
                'verified_students' => (int) ($userStats->verified_students ?? 0),
                'unverified_students' => 0,
                'active_students' => (int) ($userStats->active_students ?? 0),
                'inactive_students' => (int) ($userStats->inactive_students ?? 0),
                'registered_alumni' => (int) (($graduatesStats->total_graduates ?? 0) - ($graduatesStats->not_registered_graduates ?? 0)),
                'not_registered_graduates' => (int) ($graduatesStats->not_registered_graduates ?? 0),
                'employed_alumni' => (int) ($employmentStats->employed_alumni ?? 0),
                'self_employed_alumni' => (int) ($employmentStats->self_employed_alumni ?? 0),
                'unemployed_alumni' => (int) ($employmentStats->unemployed_alumni ?? 0),
                'not_specified_alumni' => (int) ($employmentStats->not_specified_alumni ?? 0),
                'total_department_heads' => (int) ($departmentHeadStats->total_department_heads ?? 0),
                'verified_department_heads' => (int) ($departmentHeadStats->verified_department_heads ?? 0),
                'unverified_department_heads' => (int) ($departmentHeadStats->unverified_department_heads ?? 0),
                'active_department_heads' => (int) ($departmentHeadStats->active_department_heads ?? 0),
                'inactive_department_heads' => (int) ($departmentHeadStats->inactive_department_heads ?? 0),
                'graduates_by_year' => $graduatesByYear,
                'by_department' => $byDepartment,
                'total_graduates' => (int) ($graduatesStats->total_graduates ?? 0),
                'total_departments' => count($allDepartments),
            ];

            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => [
                    'admin' => new UserResource($actor->load('department')),
                    'stats' => $stats,
                ],
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

    public function updateDepartmentAdmin(
        \App\Http\Requests\UpdateDepartmentAdminRequest $request,
        int $id
    ): JsonResponse {
        try {
            $admin = User::admins()->findOrFail($id);

            $data = $request->only(['name', 'email', 'department_id', 'status']);

            if ($request->filled('password')) {
                $data['password'] = $request->password;
            }

            if (($data['status'] ?? null) === User::STATUS_ACTIVE) {
                $departmentId = $data['department_id'] ?? $admin->department_id;
                $activeHeadExists = User::query()
                    ->where('role', User::ROLE_ADMIN)
                    ->where('department_id', $departmentId)
                    ->where('status', User::STATUS_ACTIVE)
                    ->where('id', '!=', $admin->id)
                    ->exists();

                if ($activeHeadExists) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Deactivate the current department head for this department before activating another one.',
                        'data' => (object) [],
                    ], 422);
                }
            }

            $admin->update($data);

            return response()->json([
                'status'  => true,
                'message' => 'Department head updated successfully',
                'data'    => new UserResource($admin->refresh()->load('department')),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'status'  => false,
                'message' => 'Department head not found',
                'data'    => (object) [],
            ], 404);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update department head',
                'data'    => (object) [],
            ], 500);
        }
    }
public function deleteDepartmentAdmin(Request $request, int $id): JsonResponse
{
    try {
        $admin = User::admins()->findOrFail($id);

        $admin->tokens()->delete();
        $admin->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Department head deleted successfully',
            'data'    => (object) [],
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
        return response()->json([
            'status'  => false,
            'message' => 'Department head not found',
            'data'    => (object) [],
        ], 404);
    } catch (\Throwable $e) {
        report($e);

        return response()->json([
            'status'  => false,
            'message' => 'Failed to delete department head',
            'data'    => (object) [],
        ], 500);
    }
}

public function rejectDepartmentHead(Request $request, int $id): JsonResponse
{
    try {
        $admin = User::admins()->findOrFail($id);

        $admin->tokens()->delete();
        $admin->forceDelete();

        return response()->json([
            'status' => true,
            'message' => 'Department head rejected and account deleted successfully',
            'data' => (object) [],
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
        return response()->json([
            'status' => false,
            'message' => 'Department head not found',
            'data' => (object) [],
        ], 404);
    } catch (\Throwable $e) {
        report($e);

        return response()->json([
            'status' => false,
            'message' => 'Failed to reject department head',
            'data' => (object) [],
        ], 500);
    }
}

public function activateDepartmentHead(Request $request, int $id): JsonResponse
{
    try {
        $admin = User::admins()->findOrFail($id);

        $activeHeadExists = User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('department_id', $admin->department_id)
            ->where('status', User::STATUS_ACTIVE)
            ->where('id', '!=', $admin->id)
            ->exists();

        if ($activeHeadExists) {
            return response()->json([
                'status' => false,
                'message' => 'This department already has an active department head.',
                'data' => (object) [],
            ], 422);
        }

        $admin->update(['status' => User::STATUS_ACTIVE]);
        $admin->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Department head activated successfully',
            'data' => new UserResource($admin->refresh()->load('department')),
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
        return response()->json([
            'status' => false,
            'message' => 'Department head not found',
            'data' => (object) [],
        ], 404);
    } catch (\Throwable $e) {
        report($e);

        return response()->json([
            'status' => false,
            'message' => 'Failed to activate department head',
            'data' => (object) [],
        ], 500);
    }
}

public function deactivateDepartmentHead(Request $request, int $id): JsonResponse
{
    try {
        $admin = User::admins()->findOrFail($id);

        $admin->update(['status' => User::STATUS_INACTIVE]);
        $admin->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Department head deactivated successfully',
            'data' => new UserResource($admin->refresh()->load('department')),
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
        return response()->json([
            'status' => false,
            'message' => 'Department head not found',
            'data' => (object) [],
        ], 404);
    } catch (\Throwable $e) {
        report($e);

        return response()->json([
            'status' => false,
            'message' => 'Failed to deactivate department head',
            'data' => (object) [],
        ], 500);
    }
}
    public function stats(Request $request): JsonResponse
    {
        return $this->dashboard($request);
    }

    public function listStudents(Request $request): JsonResponse
    {
        try {
            $query = $this->users->students()
                ->visibleTo($request->user())
                ->with(['department', 'alumniProfile']);

            if ($request->has('verified')) {
                $query->where('is_verified', $request->boolean('verified'));
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('department_id') && $request->user()->isSuperAdmin()) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('school_id', 'like', "%{$search}%")
                        ->orWhereHas('graduate', function ($gradQuery) use ($search) {
                            $gradQuery->where('student_number', 'like', "%{$search}%");
                        });
                });
            }

            $students = $query->latest()->paginate($request->integer('per_page', 15));

            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => UserResource::collection($students),
                'meta' => [
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'total' => $students->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch students',
                'data' => (object) [],
            ], 500);
        }
    }

    public function listDepartmentAdmins(Request $request): JsonResponse
    {
        try {
            if (!$request->user()->isSuperAdmin()) {
                return response()->json([
                    'status' => false,
                    'message' => 'This action requires super_admin role',
                    'data' => (object) [],
                ], 403);
            }

            $query = User::query()
                ->select(['id', 'name', 'email', 'department_id', 'status', 'is_verified'])
                ->where('role', User::ROLE_ADMIN)
                ->with(['department:id,name'])
                ->orderByDesc('created_at');

            if ($request->filled('status')) {
                $query->where('status', $request->string('status')->toString());
            }

            if ($request->filled('verified')) {
                $query->where('is_verified', filter_var($request->string('verified'), FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->filled('search')) {
                $search = trim((string) $request->search);
                if ($search !== '') {
                    $query->where(function ($searchQuery) use ($search) {
                        $searchQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            }

            $admins = $query->paginate($request->integer('per_page', 15));

            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => $admins->getCollection()->map(fn (User $admin) => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'departmentId' => $admin->department_id,
                    'department' => $admin->department ? [
                        'id' => $admin->department->id,
                        'name' => $admin->department->name,
                    ] : null,
                    'isVerified' => (bool) $admin->is_verified,
                    'status' => $admin->status,
                ])->values()->all(),
                'meta' => [
                    'current_page' => $admins->currentPage(),
                    'last_page' => $admins->lastPage(),
                    'per_page' => $admins->perPage(),
                    'total' => $admins->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch department heads',
                'data' => (object) [],
            ], 500);
        }
    }

    public function deactivateStudent(Request $request, $id): JsonResponse
    {
        return $this->updateStudentState($request, $id, ['status' => User::STATUS_INACTIVE], 'Student deactivated successfully', true);
    }

    public function activateStudent(Request $request, $id): JsonResponse
    {
        return $this->updateStudentState($request, $id, ['status' => User::STATUS_ACTIVE], 'Student activated successfully');
    }

    public function deleteStudent(Request $request, $id): JsonResponse
    {
        try {
            $student = User::students()->findOrFail($id);

            if (Gate::denies('delete', $student)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized for this student',
                    'data' => (object) [],
                ], 403);
            }

            $student->tokens()->delete();
            $student->forceDelete();

            return response()->json([
                'status' => true,
                'message' => 'Student deleted successfully',
                'data' => (object) [],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to delete student',
                'data' => (object) [],
            ], 500);
        }
    }

    private function updateStudentState(Request $request, $id, array $changes, string $message, bool $revokeTokens = false): JsonResponse
    {
        try {
            $student = User::students()->with('department')->findOrFail($id);

            if (Gate::denies('update', $student)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized for this student',
                    'data' => (object) [],
                ], 403);
            }

            $student->update($changes);

            if ($revokeTokens) {
                $student->tokens()->delete();
            }

            return response()->json([
                'status' => true,
                'message' => $message,
                'data' => new UserResource($student->refresh()->load('department')),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to update student',
                'data' => (object) [],
            ], 500);
        }
        
    }
}
