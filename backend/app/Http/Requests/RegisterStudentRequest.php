<?php

namespace App\Http\Requests;

use App\Models\Graduate;
use Illuminate\Foundation\Http\FormRequest;

class RegisterStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
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

    protected ?string $canonicalName = null;

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
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

            if (!$graduate) {
                $validator->errors()->add('school_id', 'Incorrect ID Number');
                return;
            }

            $inputName = (string) $this->input('name');
            if (trim($inputName) === '') {
                return;
            }

            if (!$this->namesMatch($inputName, $graduate->name)) {
                $validator->errors()->add('name', 'Incorrect Credentials');
                return;
            }

            // Sync with canonical name registered by the department head
            $this->canonicalName = $graduate->name;
            $this->merge(['name' => $graduate->name]);
        });
    }

    public function validated($key = null, $default = null): mixed
    {
        $validated = parent::validated($key, $default);

        if ($key === null && is_array($validated) && !empty($this->canonicalName)) {
            $validated['name'] = $this->canonicalName;
        }

        return $key ? data_get($validated, $key, $default) : $validated;
    }

    protected function namesMatch(string $inputName, string $registeredName): bool
    {
        $cleanInput = trim((string) preg_replace('/\s+/', ' ', $inputName));
        $cleanRegistered = trim((string) preg_replace('/\s+/', ' ', $registeredName));

        if ($cleanInput === '' || $cleanRegistered === '') {
            return false;
        }

        // Exact registered name match (case-insensitive, normalized whitespace)
        return mb_strtolower($cleanInput) === mb_strtolower($cleanRegistered);
    }

    public function messages(): array
    {
        return [
            'school_id.required' => 'Student ID is required.',
            'school_id.unique' => 'This student ID has already been registered, did you forget your password?',
        ];
    }
}
