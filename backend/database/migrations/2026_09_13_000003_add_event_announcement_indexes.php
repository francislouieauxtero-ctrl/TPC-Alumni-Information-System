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
        Schema::table('events', function (Blueprint $table) {
            $table->index(['scope', 'department_id', 'created_at'], 'events_scope_department_created_index');
            $table->index(['scope', 'department_id', 'event_date'], 'events_scope_department_event_date_index');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->index(['created_at'], 'announcements_created_at_index');
            $table->index(['scope', 'department_id', 'created_at'], 'announcements_scope_department_created_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_scope_department_created_index');
            $table->dropIndex('events_scope_department_event_date_index');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex('announcements_created_at_index');
            $table->dropIndex('announcements_scope_department_created_index');
        });
    }
};
