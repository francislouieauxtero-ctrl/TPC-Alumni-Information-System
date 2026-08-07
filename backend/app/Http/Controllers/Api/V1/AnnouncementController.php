<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Requests\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use App\Services\AnnouncementService;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    use ApiResponder;

    public function __construct(protected AnnouncementService $announcementService)
    {
    }

    public function index(): JsonResponse
    {
        try {
            $filters = request()->only(['search', 'page']);
            $announcements = $this->announcementService->getVisibleAnnouncements(auth()->user(), $filters);

            return $this->successResponse(
                AnnouncementResource::collection($announcements),
                'Announcements retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        try {
            $this->authorize('create', Announcement::class);
            $data = $request->validated();
            if ($request->hasFile('images')) {
                $data['images'] = $request->file('images');
            }

            $announcement = $this->announcementService->create(auth()->user(), $data);

            return $this->successResponse(
                new AnnouncementResource($announcement->load('creator', 'department')),
                'Announcement created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Announcement $announcement): JsonResponse
    {
        try {
            $this->authorize('view', $announcement);

            return $this->successResponse(
                new AnnouncementResource($announcement->load('creator', 'department')),
                'Announcement retrieved successfully'
            );
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): JsonResponse
    {
        try {
            $this->authorize('update', $announcement);

            $data = $request->validated();
            if ($request->hasFile('images')) {
                $data['images'] = $request->file('images');
            }
            if ($request->has('removed_images')) {
                $data['removed_images'] = $request->input('removed_images');
            }

            $updated = $this->announcementService->update($announcement, auth()->user(), $data);

            return $this->successResponse(
                new AnnouncementResource($updated->load('creator', 'department')),
                'Announcement updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        try {
            $this->authorize('delete', $announcement);

            $this->announcementService->delete($announcement, auth()->user());

            return $this->successResponse(null, 'Announcement deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
