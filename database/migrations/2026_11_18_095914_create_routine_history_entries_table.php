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
        Schema::create('routine_history_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('routine_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name');
            $table->string('type', 20);
            $table->date('scheduled_for');
            // A cancelled entry releases its term without losing the audit trail.
            $table->date('active_scheduled_for')->nullable();
            $table->date('action_at');
            $table->date('previous_next_due_at');
            $table->text('notes')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cancelled_by_name')->nullable();
            $table->timestamps();

            $table->unique(['routine_id', 'active_scheduled_for'], 'routine_active_term_unique');
            $table->index(['routine_id', 'cancelled_at', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routine_history_entries');
    }
};
