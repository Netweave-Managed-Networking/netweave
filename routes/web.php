<?php

use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\OrganizationCategoryController;
use App\Http\Controllers\OrganizationContactPersonNotesCreateController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceCategoryController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\RestrictionNotesCoopCriteriaCreateController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

// /////// //
// NO AUTH //
// /////// //

Route::get('/', function (): Response {
    return Inertia::render('welcome-page', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home', function (): Response {
    return Inertia::render('home-page');
})->middleware(['auth', 'verified'])->name('home');

// ///// //
// ADMIN //
// ///// //

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

// ///////// //
// LOGGED IN //
// ///////// //

Route::middleware('auth')->group(function (): void {
    Route::prefix('profile')->group(function (): void {
        Route::get('', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    Route::prefix('organizations')->group(function (): void {
        Route::get('/create', [OrganizationContactPersonNotesCreateController::class, 'create'])->name('organizations.create');
        Route::post('', [OrganizationContactPersonNotesCreateController::class, 'store'])->name('organizations.store');
        Route::get('api', [OrganizationController::class, 'indexJson'])->name('organizations.api.index');

        Route::prefix('{organization}/resources')->group(function (): void {
            Route::get('/create', [ResourceController::class, 'create'])->name('resources.create');
            Route::post('', [ResourceController::class, 'store'])->name('resources.store');
        });

        Route::prefix('{organization}/restrictions,coop_criteria,notes')->group(function (): void {
            Route::get('/create', [RestrictionNotesCoopCriteriaCreateController::class, 'create'])->name('restrictions-coop_criteria-notes.create');
            Route::post('', [RestrictionNotesCoopCriteriaCreateController::class, 'store'])->name('restrictions-coop_criteria-notes.store');
        });
    });

    Route::prefix('organization-categories')->group(function (): void {
        Route::get('api/{category}', [OrganizationCategoryController::class, 'getJson'])->name('organization-categories.api.get');
        Route::post('api', [OrganizationCategoryController::class, 'storeJson'])->name('organization-categories.api.store');
        Route::get('/edit', [OrganizationCategoryController::class, 'edit'])->name('organization-categories.edit');
        Route::put('/{category}', [OrganizationCategoryController::class, 'update'])->name('organization-categories.update');
        Route::delete('/{category}', [OrganizationCategoryController::class, 'destroy'])->name('organization-categories.destroy');
    });

    Route::prefix('resource-categories')->group(function (): void {
        Route::post('api', [ResourceCategoryController::class, 'storeJson'])->name('resource-categories.api.store');
    });
});

require __DIR__.'/auth.php';
