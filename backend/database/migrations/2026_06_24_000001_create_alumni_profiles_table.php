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
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('graduate_id')->nullable()->constrained('graduates')->onDelete('set null');
            $table->string('contact_number')->nullable();
            $table->string('location')->nullable();
            $table->string('profile_photo_url')->nullable();
            $table->string('current_job')->nullable();
            $table->string('company')->nullable();
            $table->string('employment_status', 50)->default('not_specified');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('department_id');
            $table->index('graduate_id');
            $table->index('employment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni_profiles');
    }
};
