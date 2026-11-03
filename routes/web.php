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
});

require __DIR__ . '/settings.php';
