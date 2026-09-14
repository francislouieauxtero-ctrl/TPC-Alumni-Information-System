<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\StoreJobHistoryRequest;
use App\Http\Requests\UpdateJobHistoryRequest;
use App\Http\Resources\JobHistoryResource;
use App\Models\JobHistory;
use App\Models\User;
use App\Services\JobHistoryService;
use Illuminate\Http\JsonResponse;

class JobHistoryController extends Controller
{
    use ApiResponder;

    public function __construct(protected JobHistoryService $jobHistoryService)
    {
    }

    public function index(): JsonResponse
    {
        try {
            $jobHistories = $this->jobHistoryService->getForUser(auth()->user());

            return $this->successResponse(
                JobHistoryResource::collection($jobHistories),
                'Employment history retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(StoreJobHistoryRequest $request): JsonResponse
    {
        try {
            $jobHistory = $this->jobHistoryService->create(auth()->user(), $request->validated());

            return $this->successResponse(
                new JobHistoryResource($jobHistory),
                'Job history entry created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(JobHistory $employment): JsonResponse
    {
        try {
            $this->authorize('view', $employment);

            return $this->successResponse(
                new JobHistoryResource($employment),
                'Job history entry retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function update(JobHistory $employment, UpdateJobHistoryRequest $request): JsonResponse
    {
        try {
            $this->authorize('update', $employment);

            $updated = $this->jobHistoryService->update($employment, auth()->user(), $request->validated());

            return $this->successResponse(
                new JobHistoryResource($updated),
                'Job history entry updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function destroy(JobHistory $employment): JsonResponse
    {
        try {
            $this->authorize('delete', $employment);

            $this->jobHistoryService->delete($employment);

            return $this->successResponse(null, 'Job history entry deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get job history for a specific user (admin access)
     */
    public function forUser(User $user): JsonResponse
    {
        try {
            $actor = auth()->user();
            if ($actor->isAdmin() && !$actor->isSuperAdmin() && (int) $actor->department_id !== (int) $user->department_id) {
                return $this->errorResponse('Unauthorized to view employment history for this student', 403);
            }

            $jobHistories = $this->jobHistoryService->getForUser($user);

            return $this->successResponse(
                JobHistoryResource::collection($jobHistories),
                'Employment history retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
