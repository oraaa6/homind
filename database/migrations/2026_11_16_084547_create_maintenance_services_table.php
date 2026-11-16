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
        Schema::create('maintenance_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thing_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('due_at')->nullable();
            $table->dateTime('appointment_at')->nullable();
            $table->unsignedSmallInteger('recurrence_months')->nullable();
            $table->string('provider')->nullable();
            $table->string('phone', 50)->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['thing_id', 'due_at']);
            $table->index(['thing_id', 'appointment_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_services');
    }
};
