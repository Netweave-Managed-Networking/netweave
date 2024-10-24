<?php

use App\Models\StakeholderCategory;
use App\Models\StakeholderOrganization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

// Test the create method
it('renders the create page with stakeholder categories', function () {
    // Arrange: create some stakeholder categories
    $categories = StakeholderCategory::factory()->count(3)->create();

    // Act: send a GET request to the create route
    $response = actingAs(User::factory()->create())->get(route('stakeholder-organizations.create'));

    // Assert: check if the response contains the correct Inertia data
    $response->assertInertia(fn (Assert $page) => $page->component('StakeholderOrganizations/StakeholderOrganizationsCreate')
        ->has('stakeholderCategories', 3)
        ->where('stakeholderCategories', fn ($categoriesArray) => collect($categoriesArray)->contains(fn ($category) => $category['id'] === $categories->first()->id &&
                $category['name'] === $categories->first()->name
        )
        )
    );
});

// Test the store method for successful creation
it('can store a new stakeholder organization', function () {
    // Arrange: create some stakeholder categories
    $categories = StakeholderCategory::factory()->count(2)->create();

    // Act: send a POST request to store the stakeholder organization
    $data = [
        'name' => 'New Stakeholder',
        'email' => 'stakeholder@example.com',
        'phone' => '123-456-7890',
        'postcode_city' => '12345 City',
        'street_hnr' => '123 Main St',
        'stakeholder_categories' => $categories->pluck('id')->toArray(),
    ];

    $response = actingAs(User::factory()->create())->post(route('stakeholder-organizations.store'), $data);

    // Assert: check if the stakeholder organization is in the database
    $response->assertRedirect(route('dashboard'))
        ->assertSessionHas('success', "Neuer Stakeholder 'New Stakeholder' erfolgreich erstellt.");
    assertDatabaseHas('stakeholder_organizations', [
        'name' => 'New Stakeholder',
        'email' => 'stakeholder@example.com',
    ]);

    // Check if the relationship is correctly saved
    $organization = StakeholderOrganization::where('name', 'New Stakeholder')->first();
    expect($organization->stakeholderCategories->pluck('id')->toArray())->toMatchArray($categories->pluck('id')->toArray());
});

// Test validation errors for required fields
it('fails to store a stakeholder organization without required fields', function () {
    // Act: send a POST request with missing required fields
    $response = actingAs(User::factory()->create())->post(route('stakeholder-organizations.store'), []);

    // Assert: check if validation errors are returned for the missing fields
    $response->assertSessionHasErrors(['name', 'stakeholder_categories']);
    assertDatabaseMissing('stakeholder_organizations', ['name' => '']);
});

// Test validation for unique constraints
it('fails to store a stakeholder organization with a non-unique name', function () {
    // Arrange: create an existing stakeholder organization
    $existingOrganization = StakeholderOrganization::factory()->create(['name' => 'Existing Stakeholder']);

    // Act: try to create another organization with the same name
    $response = actingAs(User::factory()->create())->post(route('stakeholder-organizations.store'), [
        'name' => 'Existing Stakeholder',
        'stakeholder_categories' => StakeholderCategory::factory()->count(1)->create()->pluck('id')->toArray(),
    ]);

    // Assert: check if the validation fails
    $response->assertSessionHasErrors(['name']);
    assertDatabaseHas('stakeholder_organizations', ['name' => 'Existing Stakeholder']);
});

// Test for handling missing stakeholder categories in the request
it('fails to store a stakeholder organization if stakeholder categories do not exist', function () {
    // Act: send a POST request with non-existing category IDs
    $response = actingAs(User::factory()->create())->post(route('stakeholder-organizations.store'), [
        'name' => 'New Stakeholder',
        'stakeholder_categories' => [999],
    ]);

    // Assert: check if the validation fails for the stakeholder_categories field
    $response->assertSessionHasErrors(['stakeholder_categories.0']);
    assertDatabaseMissing('stakeholder_organizations', ['name' => 'New Stakeholder']);
});

// Test unauthorized access to the create and store routes
it('redirects guests when trying to access create or store routes', function () {
    // Act: send a GET request to the create route
    $createResponse = get(route('stakeholder-organizations.create'));
    $createResponse->assertRedirect(route('login'));

    // Act: send a POST request to the store route
    $storeResponse = post(route('stakeholder-organizations.store'), []);
    $storeResponse->assertRedirect(route('login'));
});
