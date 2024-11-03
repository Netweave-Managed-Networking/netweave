<?php

use App\Models\StakeholderCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\post;
use function PHPUnit\Framework\assertEmpty;

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

// Test for successful creation of a StakeholderCategory
it('creates a new stakeholder category with valid data', function () {
    $user = User::factory()->create();
    actingAs($user);

    $payload = [
        'name' => 'New Category',
        'description' => 'A description for the new category',
    ];

    $response = post('/stakeholder-categories/api', $payload);

    $response->assertStatus(Response::HTTP_CREATED)
        ->assertJson([
            'name' => $payload['name'],
            'description' => $payload['description'],
        ]);

    assertDatabaseHas('stakeholder_categories', $payload);
});

// Test for name validation (required, string, max:64, unique)
it('validates the name field', function ($name, $expectedStatus) {
    $user = User::factory()->create();
    actingAs($user);

    $payload = [
        'name' => $name,
        'description' => 'Valid description',
    ];

    $response = post('/stakeholder-categories/api', $payload);

    $response->assertStatus($expectedStatus);

    if ($expectedStatus === Response::HTTP_CREATED) {
        assertDatabaseHas('stakeholder_categories', ['name' => $name]);
    } else {
        assertEmpty(StakeholderCategory::where('name', $name)->get()->toArray());
    }
})->with([
    ['', 302],           // required validation
    [str_repeat('a', 65), 302], // max:64 validation
    ['Unique Name', Response::HTTP_CREATED],             // valid name
]);

// Test for description validation (nullable, string, max:256, unique)
it('validates the description field', function ($description, $expectedStatus) {
    $user = User::factory()->create();
    actingAs($user);

    $payload = [
        'name' => 'Another Unique Name',
        'description' => $description,
    ];

    $response = post('/stakeholder-categories/api', $payload);

    $response->assertStatus($expectedStatus);

    if ($expectedStatus === Response::HTTP_CREATED) {
        assertDatabaseHas('stakeholder_categories', ['description' => $description]);
    } else {
        assertEmpty(StakeholderCategory::where('description', $description)->get()->toArray());
    }
})->with([
    [str_repeat('a', 257), 302], // max:256 validation
    [null, Response::HTTP_CREATED],                             // nullable field
    ['Another Unique Description', Response::HTTP_CREATED],     // valid description
]);

// Test for duplicate name
it('fails to create a stakeholder category with a duplicate name', function () {
    $user = User::factory()->create();
    actingAs($user);

    $existingCategory = StakeholderCategory::factory()->create(['name' => 'Duplicate Name']);

    $payload = [
        'name' => 'Duplicate Name',
        'description' => 'A new description',
    ];

    $response = post('/stakeholder-categories/api', $payload);

    $response->assertStatus(302);
    assertEmpty(StakeholderCategory::where('name', $payload['name'])->where('description', $payload['description'])->get()->toArray());
});
