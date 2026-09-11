<?php

namespace App\Http\Requests;

use App\Models\Graduate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UpdateGraduateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        $graduateId = $this->route('graduate')?->id ?? $this->route('graduate');

        return [
            'department_id' => [
                'nullable',
                'exists:departments,id',
            ],
            'student_number' => [
                'sometimes',
                'string',
                Rule::unique('graduates', 'student_number')->ignore($graduateId),
            ],
            'name' => ['sometimes', 'string', 'max:255'],
            'batch_year' => ['sometimes', 'string', 'regex:/^\d{4}(-\d{4})?$/'],
            'block' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->filled('student_number')) {
                return;
            }

            $studentNumber = trim((string) $this->input('student_number'));
            $graduateId = $this->route('graduate')?->id ?? $this->route('graduate');

            if ($studentNumber === '' || $graduateId === null) {
                return;
            }

            if ($this->hasDuplicateStudentNumber($studentNumber, $graduateId)) {
                $validator->errors()->add('student_number', 'Student number already exists');
            }
        });
    }

    protected function hasDuplicateStudentNumber(string $studentNumber, int $ignoreId): bool
    {
        $query = Graduate::query()
            ->where(function ($query) use ($studentNumber): void {
                $query->where('student_number', $studentNumber);

                if (is_numeric($studentNumber)) {
                    $castType = DB::connection()->getDriverName() === 'mysql' ? 'UNSIGNED' : 'INTEGER';
                    $query->orWhereRaw("CAST(student_number AS {$castType}) = ?", [(int) $studentNumber]);
                }
            })
            ->where('id', '!=', $ignoreId);

        return $query->exists();
    }

    public function messages(): array
    {
        return [
            'department_id.exists' => 'Selected department does not exist',
            'student_number.unique' => 'Student number already exists',
            'batch_year.regex' => 'Batch year must be in YYYY or YYYY-YYYY format (e.g. 2026 or 2026-2027)',
        ];
    }
}