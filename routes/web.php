<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::inertia('to-do', 'to-do/index')->name('to-do');

    Route::inertia('things', 'things/index')->name('things');
    Route::inertia('things/add', 'things/add')->name('things.add');
    Route::get('things/{element}', fn (string $element) => Inertia::render('things/show', [
        'element' => $element,
    ]))->name('things.show');

    Route::inertia('places', 'places/index')->name('places');
    Route::inertia('places/add', 'places/add')->name('places.add');
    Route::get('places/{element}', fn (string $element) => Inertia::render('places/show', [
        'element' => $element,
    ]))->name('places.show');
});

require __DIR__ . '/settings.php';
