<?php

namespace App\Http\Requests;

use App\Models\Graduate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

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
            $intVal = (int) $schoolId;
            if ($intVal > 0) {
                $castType = DB::connection()->getDriverName() === 'mysql' ? 'UNSIGNED' : 'INTEGER';
                $grad = Graduate::query()
                    ->whereRaw("CAST(student_number AS {$castType}) = ?", [$intVal])
                    ->first();
                if ($grad) {
                    return $grad;
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
