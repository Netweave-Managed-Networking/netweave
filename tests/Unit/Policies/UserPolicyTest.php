<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('allows admin to delete a different user', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $userToBeDeleted = User::factory()->create();

    $policy = new UserPolicy;

    $canDelete = $policy->delete($admin, $userToBeDeleted);

    expect($canDelete->allowed())->toBeTrue();
});

it('prevents admin from deleting themselves', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $policy = new UserPolicy;

    $canDelete = $policy->delete($admin, $admin);

    expect($canDelete->allowed())->toBeFalse();
});

it('prevents admin from deleting a user who has created registration codes', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $userWithCodes = User::factory()->hasCreatedRegistrationCodes()->create();

    $policy = new UserPolicy;

    $canDelete = $policy->delete($admin, $userWithCodes);

    expect($canDelete->allowed())->toBeFalse();
});

it('prevents a non-admin user from deleting another user', function () {
    $editor = User::factory()->create(['role' => UserRole::EDITOR]);
    $userToBeDeleted = User::factory()->create();

    $policy = new UserPolicy;

    $canDelete = $policy->delete($editor, $userToBeDeleted);

    expect($canDelete->allowed())->toBeFalse();
});
