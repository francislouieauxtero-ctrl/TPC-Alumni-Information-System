<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($this->user()->id),
            ],
            'avatar' => [
                'sometimes',
                'file',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:10240',
            ],
            'contact_number' => 'sometimes|string|nullable|max:50',
            'location' => 'sometimes|string|nullable|max:255',
            'batch_year' => 'sometimes|nullable|string|max:20',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $user = $this->user();
            if (! $user || ! $user->isStudent()) {
                return;
            }

            if ($this->filled('name') && trim((string) $this->input('name')) !== trim((string) $user->name)) {
                $validator->errors()->add('name', 'Alumni name cannot be edited.');
            }

            if ($this->filled('batch_year')) {
                $currentBatch = $user->alumniProfile?->batch_year ?? $user->graduate?->batch_year;
                if ($currentBatch !== null && trim((string) $this->input('batch_year')) !== trim((string) $currentBatch)) {
                    $validator->errors()->add('batch_year', 'Batch year is set automatically and cannot be edited.');
                }
            }
        });
    }
}