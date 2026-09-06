<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'company' => ['nullable', 'string', 'max:255', 'required_unless:employment_type,unemployed'],
            'position' => ['nullable', 'string', 'max:255', 'required_unless:employment_type,unemployed'],
            'industry' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date', 'required_if:employment_type,employed'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_current' => ['sometimes', 'boolean'],
            'employment_type' => ['sometimes', 'string', 'in:employed,unemployed,self_employed'],
        ];
    }
}
