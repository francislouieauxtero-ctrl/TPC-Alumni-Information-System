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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $schoolId = (string) $this->input('school_id');
            if (trim($schoolId) === '') {
                return;
            }

            $graduate = $this->findGraduate($schoolId);

            if (! $graduate) {
                $validator->errors()->add('school_id', 'Incorrect ID Number');
                return;
            }

            if ($graduate->isRegistered()) {
                $validator->errors()->add('school_id', 'This ID number has already been registered as an Alumni.');
                return;
            }
        });
    }

    public function messages(): array
    {
        return [
            'school_id.required' => 'ID Number is required.',
            'school_id.unique' => 'This ID number has already been registered as an Alumni.',
        ];
    }
}
