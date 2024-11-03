<?php

use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StakeholderCategoryController;
use App\Http\Controllers\StakeholderOrganizationController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

//////////
// OPEN //
//////////

Route::get('/', function (): Response {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (): Response {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

///////////
// ADMIN //
///////////

Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::prefix('invitation-codes')->group(function (): void {
        Route::get('', [InvitationCodeController::class, 'index'])->name('invitation-codes.index');
        Route::post('', [InvitationCodeController::class, 'store'])->name('invitation-codes.store');
        Route::delete('/{invitationCode}', [InvitationCodeController::class, 'destroy'])->name('invitation-codes.destroy');
    });

    Route::prefix('users')->group(function (): void {
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

//////////
// AUTH //
//////////

Route::middleware('auth')->group(function (): void {
    Route::prefix('profile')->group(function (): void {
        Route::get('', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    Route::prefix('stakeholder-organizations')->group(function (): void {
        Route::get('/create', [StakeholderOrganizationController::class, 'create'])->name('stakeholder-organizations.create');
        Route::post('', [StakeholderOrganizationController::class, 'store'])->name('stakeholder-organizations.store');
        Route::prefix('api')->group(function (): void {
            Route::get('', [StakeholderOrganizationController::class, 'indexJson'])->name('stakeholder-organizations.api.index');
        });
    });

    Route::prefix('stakeholder-categories')->group(function (): void {
        Route::prefix('api')->group(function (): void {
            Route::post('', [StakeholderCategoryController::class, 'storeJson'])->name('stakeholder-categories.api');
        });
    });
});

require __DIR__.'/auth.php';
