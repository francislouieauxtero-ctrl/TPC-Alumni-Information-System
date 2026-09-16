<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;

class DepartmentRepository
{
    public function all(): Collection
    {
        return Department::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Department
    {
        $department = Department::withTrashed()->where('name', $data['name'])->first();
        
        if ($department) {
            if ($department->trashed()) {
                $department->restore();
            }
            return $department;
        }

        return Department::create($data);
    }

    public function update(Department $department, array $data): Department
    {
        $department->update($data);

        return $department;
    }

    public function delete(Department $department): void
    {
        $department->delete();
    }
}
