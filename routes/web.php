<?php

use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\OrganizationCategoryController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ProfileController;
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

Route::get('/home', function (): Response {
    return Inertia::render('HomePage');
})->middleware(['auth', 'verified'])->name('home');

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

    Route::prefix('organizations')->group(function (): void {
        Route::get('/create', [OrganizationController::class, 'create'])->name('organizations.create');
        Route::post('', [OrganizationController::class, 'store'])->name('organizations.store');
        Route::prefix('api')->group(function (): void {
            Route::get('', [OrganizationController::class, 'indexJson'])->name('organizations.api.index');
        });
    });

    Route::prefix('organization-categories')->group(function (): void {
        Route::prefix('api')->group(function (): void {
            Route::post('', [OrganizationCategoryController::class, 'storeJson'])->name('organization-categories.api');
        });
    });
});

require __DIR__.'/auth.php';
