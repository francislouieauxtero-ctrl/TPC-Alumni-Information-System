<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
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