<?php

namespace App\Http\Requests;

use App\Models\Graduate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StoreGraduateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isAdmin() && !auth()->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'department_id' => [
                Rule::requiredIf(auth()->user()->isSuperAdmin()),
                'nullable',
                'exists:departments,id',
            ],
            'student_number' => ['required', 'string', 'unique:graduates,student_number'],
            'name' => ['required', 'string', 'max:255'],
            'batch_year' => ['required', 'string', 'regex:/^\d{4}(-\d{4})?$/'],
            'block' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $studentNumber = trim((string) $this->input('student_number'));

            if ($studentNumber === '') {
                return;
            }

            if ($this->hasDuplicateStudentNumber($studentNumber)) {
                $validator->errors()->add('student_number', 'Student number already exists');
            }
        });
    }

    protected function hasDuplicateStudentNumber(string $studentNumber): bool
    {
        $query = Graduate::query()
            ->where(function ($query) use ($studentNumber): void {
                $query->where('student_number', $studentNumber);

                if (is_numeric($studentNumber)) {
                    $castType = DB::connection()->getDriverName() === 'mysql' ? 'UNSIGNED' : 'INTEGER';
                    $query->orWhereRaw("CAST(student_number AS {$castType}) = ?", [(int) $studentNumber]);
                }
            });

        return $query->exists();
    }

    public function messages(): array
    {
        return [
            'department_id.required' => 'Department is required',
            'student_number.unique' => 'Student number already exists',
            'batch_year.regex' => 'Batch year must be in YYYY or YYYY-YYYY format (e.g. 2026 or 2026-2027)',
        ];
    }
}