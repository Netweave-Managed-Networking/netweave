<?php

use App\Enums\UserRole;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it can render the registration codes overview page', function () {

    $requestor = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($requestor);

    // Create some fake registration codes with their relationships
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $editor = User::factory()->create();

    RegistrationCode::factory()->count(3)->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor->id,
    ]);

    // Make a GET request to the index route
    $response = $this->get(route('registration-codes.index'));

    // Assert the response status is OK
    $response->assertStatus(200);

    // Assert Inertia renders the correct view with the expected data
    $response->assertInertia(
        fn(Assert $page) => $page
            ->component('RegistrationCodes/Overview')
            ->has('registrationCodes', 3)
            ->has(
                'registrationCodes.0.admin',
                fn(Assert $regCodeAdmin) => $regCodeAdmin
                    ->where('id', $admin->id)
                    ->where('name', $admin->name)
                    ->where('email', $admin->email)
            )
            ->has(
                'registrationCodes.0.editor',
                fn(Assert $regCodeEditor) => $regCodeEditor
                    ->where('id', $editor->id)
                    ->where('name', $editor->name)
                    ->where('email', $editor->email)
            )
    );
});
