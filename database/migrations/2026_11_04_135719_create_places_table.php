<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            //constrained() bez argumentów wskazuje kolumnę id, ale ustala nazwę tabeli na podstawie nazwy kolumny - Laravel wnioskuje, że chodzi o households.id (z innej tabelki).
            $table->foreignId('parent_id')->nullable()->constrained('places', 'id')->restrictOnDelete();
            //constrained('places') - jak sie nie zapisze argumentu 2 to z automatu przyjmuje id

            $table->string('kind', 20); // room, rack, box
            $table->string('name');
            $table->string('identifier', 50)->nullable();
            $table->string('level')->nullable();
            $table->text('placement')->nullable();

            $table->timestamps();

            $table->unique(['household_id', 'identifier']);
            $table->index(['household_id', 'parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
