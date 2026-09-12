<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\StoreGraduateRequest;
use App\Http\Requests\UpdateGraduateRequest;
use App\Http\Resources\GraduateResource;
use App\Models\Graduate;
use App\Services\GraduateService;
use Illuminate\Http\JsonResponse;

class GraduateController extends Controller
{
    use ApiResponder;

    public function __construct(protected GraduateService $graduateService)
    {
    }

    /**
     * List all graduates
     */
    public function index(): JsonResponse
    {
        try {
            $filters = request()->only(['department_id', 'batch_year', 'block', 'search']);
            $user = auth()->user();

            // Only force-scope department heads/admins to their own department.
            // Super admins/president can filter by any department.
            if ($user->isAdmin() && !$user->isSuperAdmin()) {
                $filters['department_id'] = $user->department_id;
            }

            $graduates = $this->graduateService->getAll($filters);

            return $this->successResponse(
                GraduateResource::collection($graduates),
                'Graduates retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Store a new graduate
     */
    public function store(StoreGraduateRequest $request): JsonResponse
    {
        $this->authorize('create', Graduate::class);

        try {
            $data = $request->validated();

            if (auth()->user()->isAdmin()) {
                $data['department_id'] = auth()->user()->department_id;
            }

            $graduate = $this->graduateService->create($data);

            return $this->successResponse(
                new GraduateResource($graduate),
                'Graduate created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get single graduate
     */
    public function show(Graduate $graduate): JsonResponse
    {
        $this->authorize('view', $graduate);

        try {
            return $this->successResponse(
                new GraduateResource($graduate->load('department')),
                'Graduate retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Update graduate
     */
    public function update(UpdateGraduateRequest $request, Graduate $graduate): JsonResponse
    {
        $this->authorize('update', $graduate);

        try {
            $data = $request->validated();

            $updated = $this->graduateService->update($graduate, $data);

            return $this->successResponse(
                new GraduateResource($updated->load('department')),
                'Graduate updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete graduate
     */
    public function destroy(Graduate $graduate): JsonResponse
    {
        $this->authorize('delete', $graduate);

        try {
            $this->graduateService->delete($graduate);

            return $this->successResponse(null, 'Graduate deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}