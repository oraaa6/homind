<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\ThingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('households', [HouseholdController::class, 'store'])->name('households.store');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');

    Route::inertia('to-do', 'to-do/index')->name('to-do');
    Route::get('maintenance', [MaintenanceController::class, 'index'])->name('maintenance');
    Route::get('maintenance/add', [MaintenanceController::class, 'create'])->name('maintenance.add');
    Route::get('maintenance/{thing}', [MaintenanceController::class, 'show'])->name('maintenance.show');

    Route::get('things', [ThingController::class, 'index'])->name('things');
    Route::get('things/add', [ThingController::class, 'create'])->name('things.add');
    Route::post('things', [ThingController::class, 'store'])->name('things.store');
    Route::patch('things/{element}/location', [ThingController::class, 'updateLocation'])->name('things.location.update');
    Route::patch('things/{element}/quantity', [ThingController::class, 'updateQuantity'])->name('things.quantity.update');
    Route::delete('things/{element}', [ThingController::class, 'destroy'])->name('things.destroy');
    Route::get('things/{element}', [ThingController::class, 'show'])->name('things.show');

    Route::get('places', [PlaceController::class, 'index'])->name('places');
    Route::get('places/add', [PlaceController::class, 'create'])->name('places.add');
    Route::post('places', [PlaceController::class, 'store'])->name('places.store');
    Route::patch('places/{element}/identifier', [PlaceController::class, 'regenerateIdentifier'])->name('places.identifier.regenerate');
    Route::put('places/{element}', [PlaceController::class, 'update'])->name('places.update');
    Route::get('places/{element}/qr/{identifier}', [PlaceController::class, 'openQr'])->name('places.qr');
    Route::get('places/{element}', [PlaceController::class, 'show'])->name('places.show');
    Route::delete('places/{element}', [PlaceController::class, 'destroy'])->name('places.destroy');
});

require __DIR__ . '/settings.php';
