<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
            'scope' => ['sometimes', 'in:school_wide,department_specific'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'external_link' => ['nullable', 'url'],
            'posted_at' => ['nullable', 'date'],
            'posted_by' => ['nullable', 'string', 'max:50'],
            'department_category' => ['nullable', 'string', 'max:255'],
            'images' => ['nullable', 'array'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,mp4,mov,avi,webm,zip,rar', 'max:10240'],
        ];
    }
}
