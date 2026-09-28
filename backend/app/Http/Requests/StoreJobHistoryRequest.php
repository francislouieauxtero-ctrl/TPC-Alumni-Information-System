<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobHistoryRequest extends FormRequest
{
    public const PROFESSIONAL_TEXT_REGEX = 'regex:/^[\p{L}0-9 .&-]*$/u';

    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $isUnemployed = $this->input('employment_type') === 'unemployed';

        $industryRule = $isUnemployed
            ? ['nullable', 'string', 'max:255', 'not_regex:/\p{Extended_Pictographic}|\p{Emoji_Presentation}/u']
            : ['nullable', 'string', 'max:255', self::PROFESSIONAL_TEXT_REGEX];

        return [
            'company' => ['nullable', 'string', 'max:255', 'required_if:employment_type,employed', self::PROFESSIONAL_TEXT_REGEX],
            'position' => ['nullable', 'string', 'max:255', 'required_if:employment_type,employed', self::PROFESSIONAL_TEXT_REGEX],
            'industry' => $industryRule,
            'start_date' => ['nullable', 'date', 'required_if:employment_type,employed'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_current' => ['sometimes', 'boolean'],
            'employment_type' => ['required', 'string', 'in:employed,unemployed,self_employed'],
        ];
    }

    public function messages(): array
    {
        return [
            'company.regex' => 'Emojis and unsupported special characters are not allowed.',
            'position.regex' => 'Emojis and unsupported special characters are not allowed.',
            'industry.regex' => 'Emojis and unsupported special characters are not allowed.',
            'industry.not_regex' => 'Emojis are not allowed in this field.',
        ];
    }
}
