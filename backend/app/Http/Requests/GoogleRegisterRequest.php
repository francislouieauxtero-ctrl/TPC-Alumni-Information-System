<?php

namespace App\Http\Requests;

use App\Models\Graduate;
use Illuminate\Foundation\Http\FormRequest;

class GoogleRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'access_token' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'school_id' => [
                'required',
                'string',
                'max:50',
                'unique:users,school_id',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $schoolId = trim((string) $this->input('school_id'));

        if ($schoolId === '') {
            return;
        }

        $graduate = Graduate::query()
            ->where(function ($query) use ($schoolId): void {
                $query->where('student_number', $schoolId);

                if (is_numeric($schoolId)) {
                    $query->orWhereRaw('CAST(student_number AS UNSIGNED) = ?', [(int) $schoolId]);
                }
            })
            ->first();

        if ($graduate) {
            $this->merge(['department_id' => $graduate->department_id]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $schoolId = trim((string) $this->input('school_id'));

            if ($schoolId === '') {
                return;
            }

            $exists = Graduate::query()
                ->where(function ($query) use ($schoolId): void {
                    $query->where('student_number', $schoolId);

                    if (is_numeric($schoolId)) {
                        $query->orWhereRaw('CAST(student_number AS UNSIGNED) = ?', [(int) $schoolId]);
                    }
                })
                ->exists();

            if (! $exists) {
                $validator->errors()->add('school_id', 'This student ID is not found in the graduates student ID list.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'school_id.required' => 'Student ID is required.',
            'school_id.unique' => 'This student ID has already been registered, did you forget your password?',
        ];
    }
}
