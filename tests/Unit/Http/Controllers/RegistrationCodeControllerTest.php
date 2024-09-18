<?php

use App\Enums\UserRole;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it can render the registration codes page and properly orders the codes', function () {

    $requestor = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($requestor);

    // Create some fake users
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $editor1 = User::factory()->create();
    $editor2 = User::factory()->create();

    // Create registration codes with different editor conditions
    $regCodeWithNullEditor = RegistrationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => null,
    ]);

    $regCodeWithEditor1 = RegistrationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor1->id,
    ]);

    $regCodeWithEditor2 = RegistrationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor2->id,
    ]);

    // Make a GET request to the index route
    $response = $this->get(route('registration-codes.index'));

    // Assert the response status is OK
    $response->assertStatus(200);

    // Assert Inertia renders the correct view with the expected data
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('RegistrationCodes/RegistrationCodesTable')
            ->has('registrationCodes', 3)
            // Ensure the ordering by editor_id (null editor comes first)
            ->where('registrationCodes.0.id', $regCodeWithNullEditor->id)
            ->where('registrationCodes.1.id', $regCodeWithEditor2->id)
            ->where('registrationCodes.2.id', $regCodeWithEditor1->id)
            // Check the admin relationship for the first registration code
            ->has(
                'registrationCodes.0.admin',
                fn (Assert $regCodeAdmin) => $regCodeAdmin
                    ->where('id', $admin->id)
                    ->where('name', $admin->name)
                    ->where('email', $admin->email)
            )
            // Ensure the first registration code has no editor (null)
            ->where('registrationCodes.0.editor', null)
            // Check the editor relationship for the second registration code
            ->has(
                'registrationCodes.1.editor',
                fn (Assert $regCodeEditor) => $regCodeEditor
                    ->where('id', $editor2->id)
                    ->where('name', $editor2->name)
                    ->where('email', $editor2->email)
            )
            // Check the editor relationship for the third registration code
            ->has(
                'registrationCodes.2.editor',
                fn (Assert $regCodeEditor) => $regCodeEditor
                    ->where('id', $editor1->id)
                    ->where('name', $editor1->name)
                    ->where('email', $editor1->email)
            )
    );
});

test('it can store a new registration code', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($admin);

    // Make a POST request to store a new registration code
    $response = $this->post(route('registration-codes.store'));

    // Assert the response is a redirect to the index page
    $response->assertRedirect(route('registration-codes.index'));

    // Retrieve the last created registration code
    $registrationCode = RegistrationCode::latest()->first();

    // Assert the registration code was created with the correct admin_id
    $this->assertEquals($admin->id, $registrationCode->admin_id);

    // Assert the code is 8 lowercase alphanumeric characters
    $this->assertTrue(
        Str::lower($registrationCode->code) === $registrationCode->code &&
        strlen($registrationCode->code) === 8
    );
});

test('it can not delete a registration code when a user used it to register', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $editor = User::factory()->create(['role' => UserRole::EDITOR]);
    $this->actingAs($admin);

    // Create a registration code
    $registrationCode = RegistrationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor->id,
    ]);

    // Make a DELETE request to delete the registration code
    $response = $this->delete(route('registration-codes.destroy', $registrationCode));

    // Assert the response is a redirect to the index page with an error message
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('error', 'Deletion not allowed: RegistrationCode belongs to an editor. When the editor is deleted his RegistrationCode will be deleted as well.');

    // Assert the registration code no longer exists in the database
    $this->assertDatabaseHas('registration_codes', [
        'id' => $registrationCode->id,
    ]);
});

test('it can delete a registration code as long as it has no editor', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($admin);

    // Create a registration code
    $registrationCode = RegistrationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => null,
    ]);

    // Make a DELETE request to delete the registration code
    $response = $this->delete(route('registration-codes.destroy', $registrationCode));

    // Assert the response is a redirect to the index page with a success message
    $response->assertRedirect(route('registration-codes.index'));
    $response->assertSessionHas('success', 'Registration code deleted successfully.');

    // Assert the registration code no longer exists in the database
    $this->assertDatabaseMissing('registration_codes', [
        'id' => $registrationCode->id,
    ]);
});
