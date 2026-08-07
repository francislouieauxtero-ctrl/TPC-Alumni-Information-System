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
}
