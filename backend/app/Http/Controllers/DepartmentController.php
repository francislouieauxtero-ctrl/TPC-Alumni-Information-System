<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function __construct(protected DepartmentService $departments)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $departments = $this->departments->all();

            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => DepartmentResource::collection($departments),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch departments',
                'data' => (object) [],
            ], 500);
        }
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        try {
            $department = $this->departments->create($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'Department created successfully',
                'data' => new DepartmentResource($department),
            ], 201);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to create department',
                'data' => (object) [],
            ], 500);
        }
    }

    public function show(Department $department): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Success',
                'data' => new DepartmentResource($department),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch department',
                'data' => (object) [],
            ], 500);
        }
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        try {
            $department->update($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'Department updated successfully',
                'data' => new DepartmentResource($department),
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to update department',
            ], 500);
        }
    }

    public function destroy(Department $department): JsonResponse
    {
        try {
            if ($department->users()->exists() || $department->graduates()->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cannot delete department with associated users or graduates. Please reassign or remove them first.',
                    'data' => (object) [],
                ], 422);
            }

            $this->departments->delete($department);

            return response()->json([
                'status' => true,
                'message' => 'Department deleted successfully',
                'data' => (object) [],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Failed to delete department',
                'data' => (object) [],
            ], 500);
        }
    }
}
