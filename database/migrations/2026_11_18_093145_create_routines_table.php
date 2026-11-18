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
        Schema::create('routines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 150);
            $table->string('category', 30);
            $table->string('state', 20)->default('active');
            $table->string('schedule_type', 20);
            $table->unsignedInteger('interval_count')->default(1);
            $table->string('interval_unit', 10)->default('week');
            $table->json('weekdays');
            $table->date('starts_at');
            $table->date('next_due_at');
            $table->text('notes')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();

            $table->index(['household_id', 'state', 'next_due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routines');
    }
};
