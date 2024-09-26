<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use function Pest\Laravel\actingAs;

uses(TestCase::class, RefreshDatabase::class);

it('redirects non-admin users from user deletion route', function () {
    // Create a non-admin user
    $nonAdminUser = User::factory()->create(['role' => UserRole::EDITOR]);

    // Simulate the non-admin user being authenticated
    actingAs($nonAdminUser);

    // Attempt to access the delete route
    $response = $this->delete(route('users.destroy', User::factory()->create()));

    // Assert the response is a redirect
    $response->assertRedirect('');
});
