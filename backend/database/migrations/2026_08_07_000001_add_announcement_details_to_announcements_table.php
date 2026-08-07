<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'title')) {
                $table->string('title')->nullable();
            } else {
                $table->string('title')->nullable()->change();
            }

            if (!Schema::hasColumn('announcements', 'content')) {
                $table->text('content')->nullable();
            } else {
                $table->text('content')->nullable()->change();
            }

            if (!Schema::hasColumn('announcements', 'external_link')) {
                $table->text('external_link')->nullable()->after('content');
            }

            if (!Schema::hasColumn('announcements', 'posted_at')) {
                $table->dateTime('posted_at')->nullable()->after('external_link');
            }

            if (!Schema::hasColumn('announcements', 'posted_by')) {
                $table->string('posted_by')->nullable()->after('posted_at');
            }

            if (!Schema::hasColumn('announcements', 'department_category')) {
                $table->string('department_category')->nullable()->after('posted_by');
            }

            if (!Schema::hasColumn('announcements', 'images')) {
                $table->json('images')->nullable()->after('department_category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'external_link')) {
                $table->dropColumn(['external_link', 'posted_at', 'posted_by', 'department_category', 'images']);
            }
        });
    }
};
