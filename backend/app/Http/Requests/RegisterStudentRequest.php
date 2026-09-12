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

    protected function findGraduate(string $schoolId): ?Graduate
    {
        $schoolId = trim($schoolId);
        if ($schoolId === '') {
            return null;
        }

        $candidates = [$schoolId];
        if (is_numeric($schoolId)) {
            $unpadded = ltrim($schoolId, '0');
            if ($unpadded !== '') {
                $candidates[] = $unpadded;
            }
        }

        $graduate = Graduate::query()
            ->whereIn('student_number', array_unique($candidates))
            ->first();

        if ($graduate) {
            return $graduate;
        }

        if (is_numeric($schoolId)) {
            $unpadded = ltrim($schoolId, '0');
            $all = Graduate::query()->get();
            foreach ($all as $g) {
                if (is_numeric($g->student_number) && ltrim((string) $g->student_number, '0') === $unpadded) {
                    return $g;
                }
            }
        }

        return null;
    }

    protected function prepareForValidation(): void
    {
        $schoolId = (string) $this->input('school_id');
        $graduate = $this->findGraduate($schoolId);

        if ($graduate) {
            $this->merge(['department_id' => $graduate->department_id]);
        }
    }

    protected ?string $canonicalName = null;

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $schoolId = (string) $this->input('school_id');
            if (trim($schoolId) === '') {
                return;
            }

            $graduate = $this->findGraduate($schoolId);

            if (!$graduate) {
                $validator->errors()->add('school_id', 'Incorrect ID Number');
                return;
            }

            if ($graduate->isRegistered()) {
                $validator->errors()->add('school_id', 'This ID number has already been registered as an Alumni.');
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
            'school_id.required' => 'ID Number is required.',
            'school_id.unique' => 'This ID number has already been registered as an Alumni.',
        ];
    }
}
