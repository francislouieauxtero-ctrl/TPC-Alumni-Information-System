<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE alumni_profiles MODIFY COLUMN employment_status VARCHAR(50) NOT NULL DEFAULT 'not_specified'");
        } else {
            Schema::table('alumni_profiles', function (Blueprint $table) {
                $table->string('employment_status', 50)->default('not_specified')->change();
            });
        }

        // Update legacy alumni profiles that were automatically defaulted to 'unemployed' without any employment records
        DB::table('alumni_profiles')
            ->where('employment_status', 'unemployed')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('job_histories')
                    ->whereColumn('job_histories.user_id', 'alumni_profiles.user_id');
            })
            ->update(['employment_status' => 'not_specified']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE alumni_profiles MODIFY COLUMN employment_status ENUM('employed', 'unemployed', 'self_employed') NOT NULL DEFAULT 'unemployed'");
        } else {
            Schema::table('alumni_profiles', function (Blueprint $table) {
                $table->string('employment_status', 50)->default('unemployed')->change();
            });
        }
    }
};
