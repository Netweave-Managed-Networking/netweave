<?php

use App\Enums\UserRole;
use App\Models\InvitationCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it can render the invitation codes page and properly orders the codes', function () {

    $requestor = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($requestor);

    // Create some fake users
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $editor1 = User::factory()->create();
    $editor2 = User::factory()->create();

    // Create invitation codes with different editor conditions
    $regCodeWithNullEditor = InvitationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => null,
    ]);

    $regCodeWithEditor1 = InvitationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor1->id,
    ]);

    $regCodeWithEditor2 = InvitationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor2->id,
    ]);

    // Make a GET request to the index route
    $response = $this->get(route('invitation-codes.index'));

    // Assert the response status is OK
    $response->assertStatus(200);

    // Assert Inertia renders the correct view with the expected data
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('InvitationCodes/InvitationCodesPage')
            ->has('invitationCodes', 3)
            // Ensure the ordering by editor_id (null editor comes first)
            ->where('invitationCodes.0.id', $regCodeWithNullEditor->id)
            ->where('invitationCodes.1.id', $regCodeWithEditor2->id)
            ->where('invitationCodes.2.id', $regCodeWithEditor1->id)
            // Check the admin relationship for the first invitation code
            ->has(
                'invitationCodes.0.admin',
                fn (Assert $regCodeAdmin) => $regCodeAdmin
                    ->where('id', $admin->id)
                    ->where('name', $admin->name)
                    ->where('email', $admin->email)
            )
            // Ensure the first invitation code has no editor (null)
            ->where('invitationCodes.0.editor', null)
            // Check the editor relationship for the second invitation code
            ->has(
                'invitationCodes.1.editor',
                fn (Assert $regCodeEditor) => $regCodeEditor
                    ->where('id', $editor2->id)
                    ->where('name', $editor2->name)
                    ->where('email', $editor2->email)
            )
            // Check the editor relationship for the third invitation code
            ->has(
                'invitationCodes.2.editor',
                fn (Assert $regCodeEditor) => $regCodeEditor
                    ->where('id', $editor1->id)
                    ->where('name', $editor1->name)
                    ->where('email', $editor1->email)
            )
    );
});

test('it can store a new invitation code', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($admin);

    // Make a POST request to store a new invitation code
    $response = $this->post(route('invitation-codes.store'));

    // Assert the response is a redirect to the index page
    $response->assertRedirect(route('invitation-codes.index'));

    // Retrieve the last created invitation code
    $invitationCode = InvitationCode::latest()->first();

    // Assert the invitation code was created with the correct admin_id
    $this->assertEquals($admin->id, $invitationCode->admin_id);

    // Assert the code is 8 lowercase alphanumeric characters
    $this->assertTrue(
        Str::lower($invitationCode->code) === $invitationCode->code &&
        strlen($invitationCode->code) === 8
    );
});

test('it can not delete a invitation code when a user used it to register', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $editor = User::factory()->create(['role' => UserRole::EDITOR]);
    $this->actingAs($admin);

    // Create a invitation code
    $invitationCode = InvitationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => $editor->id,
    ]);

    // Make a DELETE request to delete the invitation code
    $response = $this->delete(route('invitation-codes.destroy', $invitationCode));

    // Assert the response is a redirect to the index page with an error message
    $response->assertRedirect(route('invitation-codes.index'));
    $response->assertSessionHas('error');

    // Assert the invitation code no longer exists in the database
    $this->assertDatabaseHas('invitation_codes', [
        'id' => $invitationCode->id,
    ]);
});

test('it can delete a invitation code as long as it has no editor', function () {

    // Create an admin user and authenticate
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($admin);

    // Create a invitation code
    $invitationCode = InvitationCode::factory()->create([
        'admin_id' => $admin->id,
        'editor_id' => null,
    ]);

    // Make a DELETE request to delete the invitation code
    $response = $this->delete(route('invitation-codes.destroy', $invitationCode));

    // Assert the response is a redirect to the index page with a success message
    $response->assertRedirect(route('invitation-codes.index'));
    $response->assertSessionHas('success');

    // Assert the invitation code no longer exists in the database
    $this->assertDatabaseMissing('invitation_codes', [
        'id' => $invitationCode->id,
    ]);
});
