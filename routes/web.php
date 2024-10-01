<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationCodeController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/registration-codes', [RegistrationCodeController::class, 'index'])->name('registration-codes.index');
    Route::post('/registration-codes', [RegistrationCodeController::class, 'store'])->name('registration-codes.store');
    Route::delete('/registration-codes/{registrationCode}', [RegistrationCodeController::class, 'destroy'])->name('registration-codes.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

require __DIR__.'/auth.php';
