<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\RoutineController;
use App\Http\Controllers\ThingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('households', [HouseholdController::class, 'store'])->name('households.store');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');

    Route::inertia('to-do', 'to-do/index')->name('to-do');
    Route::get('routines', [RoutineController::class, 'index'])->name('routines');
    Route::get('routines/add', [RoutineController::class, 'create'])->name('routines.add');
    Route::post('routines', [RoutineController::class, 'store'])->name('routines.store');
    Route::get('routines/{routine}/edit', [RoutineController::class, 'edit'])->whereNumber('routine')->name('routines.edit')
        ->missing(fn (Request $request) => app(RoutineController::class)->missing($request));
    Route::get('routines/{routine}', [RoutineController::class, 'show'])->whereNumber('routine')->name('routines.show')
        ->missing(fn (Request $request) => app(RoutineController::class)->missing($request));
    Route::put('routines/{routine}', [RoutineController::class, 'update'])->whereNumber('routine')->name('routines.update');
    Route::delete('routines/{routine}', [RoutineController::class, 'destroy'])->whereNumber('routine')->name('routines.destroy');
    Route::patch('routines/{routine}/state', [RoutineController::class, 'updateState'])->whereNumber('routine')->name('routines.state.update');
    Route::post('routines/{routine}/actions', [RoutineController::class, 'storeAction'])->whereNumber('routine')->name('routines.actions.store');
    Route::patch('routines/{routine}/actions/{entry}/undo', [RoutineController::class, 'undoAction'])->whereNumber(['routine', 'entry'])->name('routines.actions.undo');

    Route::get('maintenance', [MaintenanceController::class, 'index'])->name('maintenance');
    Route::get('maintenance/add', [MaintenanceController::class, 'create'])->name('maintenance.add');
    Route::get('maintenance/{thing}', [MaintenanceController::class, 'show'])->whereNumber('thing')->name('maintenance.show');
    Route::post('maintenance/services', [MaintenanceController::class, 'store'])->name('maintenance.services.store');
    Route::put('maintenance/services/{service}', [MaintenanceController::class, 'update'])->whereNumber('service')->name('maintenance.services.update');
    Route::delete('maintenance/services/{service}', [MaintenanceController::class, 'destroy'])->whereNumber('service')->name('maintenance.services.destroy');
    Route::post('maintenance/services/{service}/visits', [MaintenanceController::class, 'storeVisit'])->whereNumber('service')->name('maintenance.services.visits.store');

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

require __DIR__.'/settings.php';
