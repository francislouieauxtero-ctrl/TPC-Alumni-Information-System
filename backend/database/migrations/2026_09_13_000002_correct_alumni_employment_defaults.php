<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Find all alumni profiles whose employment status is 'unemployed' or 'not_specified'
        // and who do NOT have any active job history with actual company or position entered.
        $profiles = DB::table('alumni_profiles')->get();

        foreach ($profiles as $profile) {
            $hasRealJob = DB::table('job_histories')
                ->where('user_id', $profile->user_id)
                ->whereNull('deleted_at')
                ->where(function ($q) {
                    $q->where(function ($inner) {
                        $inner->whereNotNull('company')->where('company', '!=', '');
                    })->orWhere(function ($inner) {
                        $inner->whereNotNull('position')->where('position', '!=', '');
                    });
                })
                ->exists();

            if (! $hasRealJob) {
                // Remove dummy automatic entries that have no company and no position
                DB::table('job_histories')
                    ->where('user_id', $profile->user_id)
                    ->where(function ($q) {
                        $q->whereNull('company')->orWhere('company', '');
                    })
                    ->where(function ($q) {
                        $q->whereNull('position')->orWhere('position', '');
                    })
                    ->delete();

                // Update the profile to Not Specified
                DB::table('alumni_profiles')
                    ->where('id', $profile->id)
                    ->update([
                        'employment_status' => 'not_specified',
                        'current_job'       => 'Not Specified',
                    ]);
            } else {
                // If they have real jobs and their current_job is null/empty or 'Unemployed' but they are not_specified:
                if ($profile->employment_status === 'not_specified') {
                    DB::table('alumni_profiles')
                        ->where('id', $profile->id)
                        ->where(function ($q) {
                            $q->whereNull('current_job')->orWhere('current_job', '')->orWhere('current_job', 'Unemployed');
                        })
                        ->update([
                            'current_job' => 'Not Specified',
                        ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
