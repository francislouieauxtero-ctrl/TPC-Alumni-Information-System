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

class AdminController extends Controller
{
    public function __construct(protected UserRepository $users)
    {
    }

    public function dashboard(Request $request): JsonResponse
    {
        try {
            $actor = $request->user();

            // Filters from request (batch/year and department)
            // Accept either `department_id` (numeric) or `department` (name)
            $requestedDept = $request->input('department_id') ?? $request->input('department');
            if ($requestedDept === '') {
                $requestedDept = null;
            }
            // If department provided as name, resolve to id
            if ($requestedDept && ! is_numeric($requestedDept)) {
                $deptId = Department::where('name', $requestedDept)->value('id');
                $requestedDept = $deptId ?: null;
            } else {
                $requestedDept = $requestedDept ? (int) $requestedDept : null;
            }
            $requestedBatch = $request->filled('batch') ? trim((string) $request->batch) : null;

            // Enforce department scoping for admin actors (server-side)
            if ($actor->isAdmin()) {
                $requestedDept = $actor->department_id;
            }

            // Base student query (applies visibility rules via repository)
            $studentsQuery = $this->users->students()->visibleTo($actor);
            if ($requestedDept) {
                $studentsQuery->where('department_id', $requestedDept);
            }
            if ($requestedBatch) {
                $studentsQuery->whereHas('alumniProfile', function ($q) use ($requestedBatch) {
                    $q->where('batch_year', $requestedBatch);
                });
            }

            // Department heads listing (scoped for super admin or limited to actor)
            $departmentHeads = $actor->isSuperAdmin()
                ? User::admins()
                : User::admins()->where('department_id', $actor->department_id);

            // Counts for alumni employment statuses (live DB queries)
            $alumniQuery = AlumniProfile::query()->whereHas('user', function ($q) {
                $q->where('is_verified', true)->where('role', User::ROLE_USER);
            });
            if ($requestedDept) {
                $alumniQuery->where('department_id', $requestedDept);
            }
            if ($requestedBatch) {
                $alumniQuery->where('batch_year', $requestedBatch);
            }

            $employedCount = (clone $alumniQuery)->where('employment_status', AlumniProfile::STATUS_EMPLOYED)->count();
            $selfEmployedCount = (clone $alumniQuery)->where('employment_status', AlumniProfile::STATUS_SELF_EMPLOYED)->count();
            $unemployedCount = (clone $alumniQuery)->where('employment_status', AlumniProfile::STATUS_UNEMPLOYED)->count();

            // Graduates per year and total graduates (apply same scoping)
            $graduatesQuery = Graduate::query();
            if ($requestedDept) {
                $graduatesQuery->where('department_id', $requestedDept);
            }
            if ($requestedBatch) {
                $graduatesQuery->where('batch_year', $requestedBatch);
            }
            $totalGraduates = (clone $graduatesQuery)->count();
            $graduatesByYear = (clone $graduatesQuery)
                ->selectRaw('batch_year, COUNT(*) as cnt')
                ->groupBy('batch_year')
                ->pluck('cnt', 'batch_year')
                ->toArray();

            // Students grouped by department (names => counts)
            $studentsForGroup = (clone $studentsQuery)->with('department')->get();
            $byDepartment = $studentsForGroup->groupBy(function ($u) {
                return $u->department?->name ?? 'Unassigned';
            })->map(fn ($g) => $g->count())->toArray();

            $stats = [
                'total_students' => (clone $studentsQuery)->count(),
                'verified_students' => (clone $studentsQuery)->where('is_verified', true)->count(),
                'unverified_students' => (clone $studentsQuery)->where('is_verified', false)->count(),
                'active_students' => (clone $studentsQuery)->where('status', User::STATUS_ACTIVE)->count(),
                'inactive_students' => (clone $studentsQuery)->where('status', User::STATUS_INACTIVE)->count(),
                'employed_alumni' => $employedCount,
                'self_employed_alumni' => $selfEmployedCount,
                'unemployed_alumni' => $unemployedCount,
                'total_department_heads' => (clone $departmentHeads)->count(),
                'verified_department_heads' => (clone $departmentHeads)->where('is_verified', true)->count(),
                'unverified_department_heads' => (clone $departmentHeads)->where('is_verified', false)->count(),
                'active_department_heads' => (clone $departmentHeads)->where('status', User::STATUS_ACTIVE)->count(),
                'inactive_department_heads' => (clone $departmentHeads)->where('status', User::STATUS_INACTIVE)->count(),
                // Extras used by frontend analytics
                'graduates_by_year' => $graduatesByYear,
                'by_department' => $byDepartment,
                'total_graduates' => $totalGraduates,
                'total_departments' => count($byDepartment),
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
        $admin->delete();

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
                $search = $request->search;
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
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

            $query = User::admins()
                ->with('department')
                ->latest();

            if ($request->filled('status')) {
                $query->where('status', $request->string('status')->toString());
            }

            $admins = $query->paginate($request->integer('per_page', 15));

            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => UserResource::collection($admins),
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

    public function verifyStudent(Request $request, $id): JsonResponse
    {
        return $this->updateStudentState($request, $id, ['is_verified' => true], 'Student approved successfully');
    }

    public function rejectStudent(Request $request, $id): JsonResponse
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
            $student->delete();

            return response()->json([
                'status' => true,
                'message' => 'Student application rejected',
                'data' => (object) [],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to reject student',
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
        return $this->rejectStudent($request, $id);
    }

    private function updateStudentState(Request $request, $id, array $changes, string $message, bool $revokeTokens = false): JsonResponse
    {
        try {
            $student = User::students()->with('department')->findOrFail($id);

            if (Gate::denies('approve', $student)) {
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
