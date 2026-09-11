<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\ApproveAlumniRequest;
use App\Http\Requests\RejectAlumniRequest;
use App\Http\Requests\UpdateWorkAlignmentRequest;
use App\Http\Resources\AlumniProfileResource;
use App\Http\Resources\UserResource;
use App\Models\AccountActivityLog;
use App\Models\User;
use App\Services\AlumniService;
use Illuminate\Http\JsonResponse;

class AlumniController extends Controller
{
    use ApiResponder;

    public function __construct(protected AlumniService $alumniService)
    {
    }

    /**
     * Get pending alumni awaiting approval
     */
    public function pending(): JsonResponse
    {
        try {
            $pending = $this->alumniService->getPendingAlumni(auth()->user());

            return $this->successResponse(
                UserResource::collection($pending),
                'Pending alumni retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get rejected alumni registrations
     */
    public function rejected(): JsonResponse
    {
        try {
            $rejected = $this->alumniService->getRejectedAlumni(auth()->user());

            return $this->successResponse(
                $rejected,
                'Rejected alumni retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function deleteRejected(AccountActivityLog $rejection): JsonResponse
    {
        try {
            if ($rejection->action !== 'rejected_alumni') {
                return $this->errorResponse('Rejected alumni record not found', 404);
            }

            $deleted = $this->alumniService->deleteRejectedAlumni(
                $rejection->id,
                auth()->user(),
            );

            if (!$deleted) {
                return $this->errorResponse('Rejected alumni record not found', 404);
            }

            return $this->successResponse(null, 'Rejected alumni record deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get all alumni
     */
    public function index(): JsonResponse
    {
        try {
            $filters = request()->only([
                'employment_status',
                'search',
                'department_id',
                'batch_year',
                'per_page',
            ]);
            $alumni  = $this->alumniService->getAll(auth()->user(), $filters);

            return $this->successResponse(
                AlumniProfileResource::collection($alumni),
                'Alumni retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Approve alumni registration
     */
    public function approve(User $alumni, ApproveAlumniRequest $request): JsonResponse
    {
        try {
            $this->authorize('approve', $alumni);

            $profile = $this->alumniService->approveAlumni($alumni, auth()->user());

            return $this->successResponse(
                new AlumniProfileResource($profile),
                'Alumni approved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Reject alumni registration
     */
    public function reject(User $alumni, RejectAlumniRequest $request): JsonResponse
    {
        try {
            $this->authorize('reject', $alumni);

            $this->alumniService->rejectAlumni(
                $alumni,
                auth()->user(),
                $request->input('reason')
            );

            return $this->successResponse(null, 'Alumni rejected successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    // ─── Work Alignment ───────────────────────────────────────────────────────

    /**
     * Alumni answers: "Is your current job aligned with your course?"
     *
     * POST /api/v1/alumni/profile/alignment
     *
     * Request body:
     *   {
     *     "is_work_aligned": true | false,
     *     "work_aligned_reason": "optional string"   // nullable
     *   }
     *
     * Authorization is handled in UpdateWorkAlignmentRequest::authorize()
     * — only employed/self-employed alumni can submit this.
     */
    public function updateAlignment(UpdateWorkAlignmentRequest $request): JsonResponse
    {
        try {
            $profile = auth()->user()->alumniProfile;

            $profile = $this->alumniService->updateWorkAlignment(
                profile:   $profile,
                isAligned: $request->boolean('is_work_aligned'),
                reason:    $request->input('work_aligned_reason'),
            );

            return $this->successResponse(
                new AlumniProfileResource($profile),
                'Work alignment updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Alignment summary grouped by department — admin dashboard widget.
     *
     * GET /api/v1/alumni/alignment/summary
     *
     * Response per department:
     *   department, total_employed, aligned, not_aligned,
     *   no_response, alignment_rate (%)
     */
    public function alignmentSummary(): JsonResponse
    {
        try {
            $filters = request()->only(['department_id', 'batch']);
            $summary = $this->alumniService->getAlignmentSummary(auth()->user(), $filters);

            return $this->successResponse($summary, 'Alignment summary retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Per-alumni alignment detail for a department — drill-down view.
     *
     * GET /api/v1/alumni/alignment/detail/{departmentId}
     */
    public function alignmentDetail(int $departmentId): JsonResponse
    {
        try {
            $detail = $this->alumniService->getAlignmentDetail($departmentId);

            return $this->successResponse(
                AlumniProfileResource::collection($detail),
                'Alignment detail retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}