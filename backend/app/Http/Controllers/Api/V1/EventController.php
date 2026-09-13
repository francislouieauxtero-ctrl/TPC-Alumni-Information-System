<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponder;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    use ApiResponder;

    public function __construct(protected EventService $eventService)
    {
    }

    /**
     * Get visible events for current user
     */
    public function index(): JsonResponse
    {
        try {
            $filters = request()->only(['scope', 'department_id', 'search', 'include_past', 'page', 'limit']);

            $events = $this->eventService->getVisibleEvents(auth()->user(), $filters);

            return $this->successResponse(
                EventResource::collection($events),
                'Events retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Create event
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        try {
            $this->authorize('create', Event::class);

            $data = $request->validated();
            // include uploaded files for processing in service
            if ($request->hasFile('attachments')) {
                $data['attachments'] = $request->file('attachments');
            }

            $event = $this->eventService->create(
                auth()->user(),
                $data
            );

            return $this->successResponse(
                new EventResource($event->load('creator', 'department')),
                'Event created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get single event
     */
    public function show(Event $event): JsonResponse
    {
        try {
            $this->authorize('view', $event);

            return $this->successResponse(
                new EventResource($event->load('creator', 'department')),
                'Event retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Update event
     */
    public function update(Event $event, UpdateEventRequest $request): JsonResponse
    {
        try {
            $this->authorize('update', $event);

            $data = $request->validated();
            if ($request->hasFile('attachments')) {
                $data['attachments'] = $request->file('attachments');
            }
            if ($request->has('removed_attachments')) {
                $data['removed_attachments'] = $request->input('removed_attachments');
            }

            $updated = $this->eventService->update(
                $event,
                auth()->user(),
                $data
            );

            return $this->successResponse(
                new EventResource($updated->load('creator', 'department')),
                'Event updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Delete event
     */
    public function destroy(Event $event): JsonResponse
    {
        try {
            $this->authorize('delete', $event);

            $this->eventService->delete($event, auth()->user());

            return $this->successResponse(null, 'Event deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
