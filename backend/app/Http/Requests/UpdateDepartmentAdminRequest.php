<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() === true;
    }

    public function rules(): array
    {
        $adminId = $this->route('id');

        return [
            'name' => 'sometimes|string|max:255',
            'email'=> [
                'sometimes', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($adminId),
            ],
            'password'      => 'sometimes|string|min:8|confirmed',
            'department_id' => [
                'sometimes',
                'exists:departments,id',
                function (string $attribute, mixed $value, \Closure $fail) use ($adminId) {
                    $hasActiveHead = User::query()
                        ->where('department_id', $value)
                        ->where('role', User::ROLE_ADMIN)
                        ->where('status', User::STATUS_ACTIVE)
                        ->where('id', '!=', $adminId) // exclude current admin
                        ->exists();

                    if ($hasActiveHead) {
                        $fail('This department already has an active department head.');
                    }
                },
            ],
            'status' => ['sometimes', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $status = $this->input('status');
            $departmentId = $this->input('department_id');
            $adminId = $this->route('id');

            if ($status !== User::STATUS_ACTIVE) {
                return;
            }

            $targetDepartmentId = $departmentId ?? $this->route('department_id');
            if (! $targetDepartmentId) {
                return;
            }

            $activeHeadExists = User::query()
                ->where('role', User::ROLE_ADMIN)
                ->where('department_id', $targetDepartmentId)
                ->where('status', User::STATUS_ACTIVE)
                ->where('id', '!=', $adminId)
                ->exists();

            if ($activeHeadExists) {
                $validator->errors()->add('status', 'Deactivate the current department head for this department before activating another one.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'department_id.exists' => 'Selected department does not exist.',
        ];
    }
}