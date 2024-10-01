<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

use function Pest\Laravel\actingAs;

uses(TestCase::class, RefreshDatabase::class);

it('allows an admin to delete another user', function () {
    // Create an admin user (requestor)
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    // Create a regular user (user to be deleted)
    $user = User::factory()->create();

    // Simulate the admin being authenticated
    actingAs($admin);

    // Call the destroy method
    $response = $this->delete(route('users.destroy', $user));

    // Assert that the user was deleted
    $this->assertModelMissing($user);

    // Assert a successful redirect
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('success', 'User deleted successfully.');
});

it('prevents an admin from deleting themselves', function () {
    // Create an admin user
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    // Simulate the admin being authenticated
    actingAs($admin);

    // Call the destroy method with the admin's own user ID
    $response = $this->delete(route('users.destroy', $admin));

    // Assert the user was not deleted
    $this->assertModelExists($admin);

    // Assert a failure redirect
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('error', 'You are not authorized to delete this user.');
});

it('prevents an admin from deleting a user who has created registration codes', function () {
    // Create an admin user
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    // Create a user who has created registration codes
    $user = User::factory()->hasCreatedRegistrationCodes()->create();

    // Simulate the admin being authenticated
    actingAs($admin);

    // Call the destroy method
    $response = $this->delete(route('users.destroy', $user));

    // Assert the user was not deleted
    $this->assertModelExists($user);

    // Assert a failure redirect
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('error', 'You are not authorized to delete this user.');
});

it('prevents a non-admin user from deleting another user', function () {
    // Create a non-admin user (requestor)
    $user = User::factory()->create(['role' => UserRole::EDITOR]);

    // Create another user
    $otherUser = User::factory()->create();

    // Simulate the non-admin user being authenticated
    actingAs($user);

    // Attempt to delete another user
    $response = $this->delete(route('users.destroy', $otherUser));

    // Assert that the response is a redirect (due to middleware)
    $response->assertRedirect('');

    // Optionally, assert that the user was not deleted
    $this->assertModelExists($otherUser);
});

it('handles exceptions when deleting a user', function () {
    // Create an admin user (requestor)
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    // Create a user
    $user = User::factory()->create();

    // Simulate the admin being authenticated
    actingAs($admin);

    // Mock the Gate to throw an exception
    Gate::shouldReceive('authorize')->andThrow(AuthorizationException::class);

    // Call the destroy method
    $response = $this->delete(route('users.destroy', $user));

    // Assert the user was not deleted
    $this->assertModelExists($user);

    // Assert a failure redirect
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('error', 'You are not authorized to delete this user.');
});
