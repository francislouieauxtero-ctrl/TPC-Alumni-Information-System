<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'event_date' => ['sometimes', 'date_format:Y-m-d H:i', 'after:now'],
            'location' => ['nullable', 'string', 'max:255'],
            'scope' => ['sometimes', 'in:school_wide,department_specific'],
            'department_id' => ['nullable', 'exists:departments,id'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $user = auth()->user();
            $scope = $this->input('scope');

            // Admins cannot change scope to school-wide
            if ($user->isAdmin() && $scope === 'school_wide') {
                $v->errors()->add('scope', 'Only the president can set events as school-wide.');
            }

            // If scope is department_specific, department_id is required
            if ($scope === 'department_specific' && !$this->input('department_id')) {
                $v->errors()->add('department_id', 'Department is required for department-specific events.');
            }

            // Admins must use their own department if department_id provided
            if ($user->isAdmin() && $this->has('department_id')) {
                $deptId = $this->input('department_id');
                if ($deptId && $deptId != $user->department_id) {
                    $v->errors()->add('department_id', 'You may only assign events to your own department.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'event_date.after' => 'Event date must be in the future',
            'scope.in' => 'Invalid scope value',
        ];
    }
}
