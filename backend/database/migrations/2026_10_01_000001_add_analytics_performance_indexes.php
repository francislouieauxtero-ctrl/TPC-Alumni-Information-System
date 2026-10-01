<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->index('batch_year', 'alumni_profiles_batch_year_index');
            $table->index(['department_id', 'batch_year'], 'alumni_profiles_department_batch_index');
            $table->index(['department_id', 'employment_status'], 'alumni_profiles_department_status_index');
        });

        Schema::table('graduates', function (Blueprint $table) {
            $table->index(['department_id', 'batch_year'], 'graduates_department_batch_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropIndex('alumni_profiles_batch_year_index');
            $table->dropIndex('alumni_profiles_department_batch_index');
            $table->dropIndex('alumni_profiles_department_status_index');
        });

        Schema::table('graduates', function (Blueprint $table) {
            $table->dropIndex('graduates_department_batch_index');
        });
    }
};
