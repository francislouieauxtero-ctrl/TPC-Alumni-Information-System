<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reactable_type', 191);
            $table->unsignedBigInteger('reactable_id');
            $table->string('type', 20); // like, heart, sad, wow, fire
            $table->timestamps();

            // Crucial database constraint: exactly ONE reaction per user per post
            $table->unique(['user_id', 'reactable_type', 'reactable_id'], 'unique_user_reaction');
            // Fast lookup index for aggregating reaction counts
            $table->index(['reactable_type', 'reactable_id', 'type'], 'reaction_lookup_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
