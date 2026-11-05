<?php

use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\PlaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('households', [HouseholdController::class, 'store'])->name('households.store');

    Route::inertia('to-do', 'to-do/index')->name('to-do');

    Route::inertia('things', 'things/index')->name('things');
    Route::inertia('things/add', 'things/add')->name('things.add');
    Route::get('things/{element}', fn (string $element) => Inertia::render('things/show', [
        'element' => $element,
    ]))->name('things.show');

    Route::get('places', [PlaceController::class, 'index'])->name('places');
    Route::get('places/add', [PlaceController::class, 'create'])->name('places.add');
    Route::post('places', [PlaceController::class, 'store'])->name('places.store');
    Route::get('places/{element}', [PlaceController::class, 'show'])->name('places.show');
});

require __DIR__ . '/settings.php';
