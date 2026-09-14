<?php

namespace App\Repositories;

use App\Models\Graduate;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GraduateRepository
{
    /**
     * Get all graduates with optional filters
     */
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Graduate::query()
            ->select([
                'graduates.id',
                'graduates.department_id',
                'graduates.student_number',
                'graduates.name',
                'graduates.batch_year',
                'graduates.block',
                'graduates.created_at',
                'graduates.updated_at',
            ])
            ->selectRaw('EXISTS(SELECT 1 FROM alumni_profiles WHERE alumni_profiles.graduate_id = graduates.id) as is_registered');

        if (!empty($filters['department_id'])) {
            $query->where('graduates.department_id', $filters['department_id']);
        }

        if (!empty($filters['batch_year'])) {
            $query->whereRaw('LOWER(CAST(graduates.batch_year AS CHAR)) = ?', [mb_strtolower(trim((string) $filters['batch_year']))]);
        }

        if (!empty($filters['block'])) {
            $query->whereRaw('LOWER(CAST(graduates.block AS CHAR)) = ?', [mb_strtolower(trim((string) $filters['block']))]);
        }

        if (!empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('graduates.name', 'like', "%{$search}%")
                    ->orWhere('graduates.student_number', 'like', "%{$search}%");
            });
        }

        return $query->with(['department:id,name'])->orderBy('graduates.id', 'desc')->paginate(20);
    }

    /**
     * Find graduate by ID
     */
    public function find(int $id): ?Graduate
    {
        return Graduate::find($id);
    }

    /**
     * Find graduate by student number (exact match or numeric-equivalent duplicate)
     */
    public function findByStudentNumber(string $studentNumber, ?int $ignoreId = null): ?Graduate
    {
        $query = Graduate::query()
            ->where(function ($query) use ($studentNumber): void {
                $query->where('student_number', $studentNumber);

                if (is_numeric($studentNumber)) {
                    $query->orWhereRaw('CAST(student_number AS UNSIGNED) = ?', [(int) $studentNumber]);
                }
            });

        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->first();
    }

    /**
     * Create a new graduate
     */
    public function create(array $data): Graduate
    {
        return Graduate::create($data);
    }

    /**
     * Update graduate
     */
    public function update(Graduate $graduate, array $data): Graduate
    {
        $graduate->update($data);
        return $graduate;
    }

    /**
     * Delete graduate
     */
    public function delete(Graduate $graduate): bool
    {
        return $graduate->delete();
    }
}
