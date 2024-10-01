<?php

use App\Enums\UserRole;
use App\Models\InvitationCode;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users register with code', function () {
    $invitationCode = createAdminAndRegCode(null);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'invitation_code' => $invitationCode->code,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertNotNull($invitationCode->fresh()->editor);

});

test('new users cannot register without code', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertGuest();
    $response->assertInvalid(['invitation_code']);
});

test('new users cannot register with invalid code', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'invitation_code' => 'abcdefgh',
    ]);

    $this->assertGuest();
    $response->assertInvalid(['invitation_code']);
});

test('new users cannot register with code which was already used', function () {
    $editor = createEditor();
    $invitationCode = createAdminAndRegCode($editor);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'invitation_code' => $invitationCode->code,
    ]);

    $this->assertGuest();
    $response->assertInvalid(['invitation_code']);
});

function createEditor(): User
{
    return User::factory()->create([
        'name' => 'Test Editor',
        'email' => 'testeditor@test.test',
        'role' => UserRole::EDITOR,
    ]);
}

function createAdminAndRegCode(?User $editor): InvitationCode
{
    User::factory()->create([
        'name' => 'Test Admin',
        'email' => 'testadmin@test.test',
        'role' => UserRole::ADMIN,
    ]);

    return InvitationCode::factory()->create(['editor_id' => $editor?->id]);
}
