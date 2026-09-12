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
        return auth()->user()->isAdmin() && !auth()->user()->isSuperAdmin();
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
            $graduate = $this->route('graduate');
            if (! $graduate instanceof Graduate && $graduate) {
                $graduate = Graduate::find($graduate);
            }

            if ($graduate && $graduate->isRegistered()) {
                if ($this->has('student_number')) {
                    $newStudentNumber = trim((string) $this->input('student_number'));
                    if ($newStudentNumber !== '' && $newStudentNumber !== trim((string) $graduate->student_number)) {
                        $validator->errors()->add('student_number', 'The ID number is locked and cannot be edited because this graduate has already registered as an Alumni.');
                    }
                }

                if ($this->has('name')) {
                    $newName = trim((string) $this->input('name'));
                    if ($newName !== '' && $newName !== trim((string) $graduate->name)) {
                        $validator->errors()->add('name', 'The registered name is locked and cannot be edited because this graduate has already registered as an Alumni.');
                    }
                }

                if ($this->has('batch_year')) {
                    $newBatchYear = trim((string) $this->input('batch_year'));
                    if ($newBatchYear !== '' && $newBatchYear !== trim((string) $graduate->batch_year)) {
                        $validator->errors()->add('batch_year', 'The year graduated is locked and cannot be edited because this graduate has already registered as an Alumni.');
                    }
                }

                if ($this->has('block')) {
                    $newBlock = trim((string) ($this->input('block') ?? ''));
                    $currentBlock = trim((string) ($graduate->block ?? ''));
                    if ($newBlock !== $currentBlock) {
                        $validator->errors()->add('block', 'The block is locked and cannot be edited because this graduate has already registered as an Alumni.');
                    }
                }
            }

            if (! $this->filled('student_number')) {
                return;
            }

            $studentNumber = trim((string) $this->input('student_number'));
            $graduateId = $graduate?->id;

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