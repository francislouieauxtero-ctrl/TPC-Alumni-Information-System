<?php

namespace Tests\Feature;

use App\Http\Requests\StoreJobHistoryRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class JobHistoryEmploymentTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_request_accepts_explicit_employment_type(): void
    {
        $request = new StoreJobHistoryRequest();

        $rules = $request->rules();

        $this->assertArrayHasKey('employment_type', $rules);
        $this->assertContains('required', $rules['employment_type']);
        $this->assertContains('in:employed,unemployed,self_employed', $rules['employment_type']);
    }

    public function test_non_employed_entries_do_not_require_company_or_position(): void
    {
        $request = new StoreJobHistoryRequest();
        $validator = Validator::make([
            'employment_type' => 'unemployed',
            'company' => '',
            'position' => '',
            'start_date' => null,
        ], $request->rules());

        $this->assertFalse($validator->fails());
    }

    public function test_valid_professional_characters_are_accepted(): void
    {
        $validInputs = [
            'ABC Company',
            'ABC Manufacturing Inc.',
            'IT Support Specialist',
            'Senior Developer - Web',
            'J&T Express',
            '3M Philippines',
        ];

        foreach ($validInputs as $input) {
            $validator = Validator::make([
                'employment_type' => 'employed',
                'company' => $input,
                'position' => $input,
                'industry' => $input,
                'start_date' => '2023-01-01',
            ], (new StoreJobHistoryRequest())->rules());

            $this->assertFalse($validator->fails(), "Failed for valid input: {$input}");
        }
    }

    public function test_emojis_and_unsupported_characters_are_rejected(): void
    {
        $invalidInputs = [
            'ABC Company 😊',
            'Software 🚀 Developer',
            '🔥 IT Solutions',
            'Company @#$',
            'Developer <>',
            'Company []',
            'IT/Software',
        ];

        foreach ($invalidInputs as $input) {
            // Test company
            $validatorCompany = Validator::make([
                'employment_type' => 'employed',
                'company' => $input,
                'position' => 'Developer',
                'industry' => 'Tech',
                'start_date' => '2023-01-01',
            ], (new StoreJobHistoryRequest())->rules());
            $this->assertTrue($validatorCompany->fails(), "Company should fail for: {$input}");
            $this->assertArrayHasKey('company', $validatorCompany->errors()->messages());

            // Test position
            $validatorPosition = Validator::make([
                'employment_type' => 'employed',
                'company' => 'Acme Corp',
                'position' => $input,
                'industry' => 'Tech',
                'start_date' => '2023-01-01',
            ], (new StoreJobHistoryRequest())->rules());
            $this->assertTrue($validatorPosition->fails(), "Position should fail for: {$input}");
            $this->assertArrayHasKey('position', $validatorPosition->errors()->messages());

            // Test industry
            $validatorIndustry = Validator::make([
                'employment_type' => 'employed',
                'company' => 'Acme Corp',
                'position' => 'Developer',
                'industry' => $input,
                'start_date' => '2023-01-01',
            ], (new StoreJobHistoryRequest())->rules());
            $this->assertTrue($validatorIndustry->fails(), "Industry should fail for: {$input}");
            $this->assertArrayHasKey('industry', $validatorIndustry->errors()->messages());
        }
    }
}
