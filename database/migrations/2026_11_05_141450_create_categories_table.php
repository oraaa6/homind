<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->timestamps();
        });

        Schema::table('things', function (Blueprint $table) {
            $table->foreignId('category_id')
                ->nullable()
                ->after('place_id')
                ->constrained('categories')
                ->restrictOnDelete();
        });

        $categoryNames = DB::table('things')
            ->select('category')
            ->distinct()
            ->pluck('category');

        foreach ($categoryNames as $name) {
            $categoryId = DB::table('categories')
                ->where('name', $name)
                ->value('id');

            if ($categoryId === null) {
                $categoryId = DB::table('categories')->insertGetId([
                    'name' => $name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('things')
                ->where('category', $name)
                ->update(['category_id' => $categoryId]);
        }

        Schema::table('things', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->unsignedBigInteger('category_id')->nullable(false)->change();
            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->restrictOnDelete();
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('things', function (Blueprint $table) {
            $table->string('category', 100)->nullable()->after('name');
        });

        $things = DB::table('things')
            ->join('categories', 'categories.id', '=', 'things.category_id')
            ->get(['things.id', 'categories.name as category_name']);

        foreach ($things as $thing) {
            DB::table('things')
                ->where('id', $thing->id)
                ->update(['category' => $thing->category_name]);
        }

        Schema::table('things', function (Blueprint $table) {
            $table->string('category', 100)->nullable(false)->change();
            $table->dropConstrainedForeignId('category_id');
        });

        Schema::dropIfExists('categories');
    }
};
