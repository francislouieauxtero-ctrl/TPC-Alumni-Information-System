<?php

namespace App\Services;

use App\Repositories\GraduateRepository;
use App\Models\Graduate;
use Illuminate\Pagination\LengthAwarePaginator;

class GraduateService
{
    protected GraduateRepository $graduateRepository;

    public function __construct(GraduateRepository $graduateRepository)
    {
        $this->graduateRepository = $graduateRepository;
    }

    /**
     * Get all graduates with filters
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->graduateRepository->all($filters);
    }

    /**
     * Get graduate by ID
     */
    public function getById(int $id): ?Graduate
    {
        return $this->graduateRepository->find($id);
    }

    /**
     * Create a new graduate
     */
    public function create(array $data): Graduate
    {
        // Check if student number already exists
        if ($this->graduateRepository->findByStudentNumber($data['student_number'])) {
            throw new \Exception('Student number already exists in graduates table');
        }

        return $this->graduateRepository->create($data);
    }

    /**
     * Update graduate
     */
    public function update(Graduate $graduate, array $data): Graduate
    {
        // Prevent editing name if graduate is already registered as an Alumni
        if (isset($data['name']) && trim((string) $data['name']) !== trim((string) $graduate->name)) {
            if ($graduate->isRegistered()) {
                throw new \Exception('The registered name is locked and cannot be edited because this graduate has already registered as an Alumni.');
            }
        }

        // Check if changing student number and new one already exists
        if (isset($data['student_number']) && $data['student_number'] !== $graduate->student_number) {
            if ($this->graduateRepository->findByStudentNumber($data['student_number'])) {
                throw new \Exception('Student number already exists in graduates table');
            }
        }

        return $this->graduateRepository->update($graduate, $data);
    }

    /**
     * Delete graduate
     */
    public function delete(Graduate $graduate): bool
    {
        return $this->graduateRepository->delete($graduate);
    }
}
