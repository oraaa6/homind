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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('thing_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('place_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('from_place_id')->nullable()->constrained('places')->nullOnDelete();
            $table->foreignId('to_place_id')->nullable()->constrained('places')->nullOnDelete();
            $table->string('event', 50);
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['household_id', 'created_at']);
            $table->index(['thing_id', 'created_at']);
            $table->index(['place_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
