<?php

use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->categories = OrganizationCategory::factory()->count(3)->create();
    $this->dummyOrganization = [
        'name' => 'New Organization',
        'email' => 'organization@example.com',
        'phone' => '123-456-7890',
        'postcode_city' => '12345 City',
        'street_hnr' => '123 Main St',
        'organization_categories' => $this->categories->pluck('id')->toArray(),
    ];
});

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

describe('create', function () {
    it('renders the create page with organization categories', function () {

        // Act: send a GET request to the create route
        $response = actingAs(User::factory()->create())->get(route('organizations.create'));

        // Assert: check if the response contains the correct Inertia data
        $response->assertInertia(fn (Assert $page): Assert => $page->component('Organizations/OrganizationsCreatePage')
            ->has('organizationCategories', 3)
            ->where('organizationCategories', fn ($categoriesArray) => collect($categoriesArray)->contains(fn ($category) => $category['id'] === $this->categories->first()->id &&
                    $category['name'] === $this->categories->first()->name
            )
            )
        );
    });
});

describe('store', function () {
    describe('organization main data & categories', function () {

        // Test the store method for successful creation
        it('can store a new organization', function () {
            $response = actingAs(User::factory()->create())->post(route('organizations.store'), $this->dummyOrganization);

            // Assert: check if the organization organization is in the database
            $response
                ->assertSessionHas('success', "Neue Organisation 'New Organization' erfolgreich erstellt.");
            assertDatabaseHas('organizations', [
                'name' => 'New Organization',
                'email' => 'organization@example.com',
            ]);

            // Check if the relationship is correctly saved
            $organization = Organization::where('name', 'New Organization')->first();
            expect($organization->organizationCategories->pluck('id')->toArray())->toMatchArray($this->categories->pluck('id')->toArray());
        });

        // Test that modelId is included in the session when an organization is successfully created
        it('includes modelId in the session when an organization is created', function () {
            $response = actingAs(User::factory()->create())->post(route('organizations.store'), $this->dummyOrganization);

            // Assert: check if the modelId is in the session
            $organization = Organization::where('name', 'New Organization')->first();
            $response->assertSessionHas('modelId', $organization->id);
        });

        // Test validation errors for required fields
        it('fails to store a organization without required fields', function () {
            // Act: send a POST request with missing required fields
            $response = actingAs(User::factory()->create())->post(route('organizations.store'), []);

            // Assert: check if validation errors are returned for the missing fields
            $response->assertSessionHasErrors(['name', 'organization_categories']);
            assertDatabaseMissing('organizations', ['name' => '']);
        });

        // Test validation for unique constraints
        it('fails to store a organization with a non-unique name', function () {
            // Arrange: create an existing organization
            $existingOrganization = Organization::factory()->create(['name' => 'Existing Organization']);

            // Act: try to create another organization with the same name
            $response = actingAs(User::factory()->create())->post(route('organizations.store'), [
                'name' => 'Existing Organization',
                'organization_categories' => OrganizationCategory::factory()->count(1)->create()->pluck('id')->toArray(),
            ]);

            // Assert: check if the validation fails
            $response->assertSessionHasErrors(['name']);
            assertDatabaseHas('organizations', ['name' => 'Existing Organization']);
        });

        // Test for handling missing organization categories in the request
        it('fails to store a organization if organization categories do not exist', function () {
            // Act: send a POST request with non-existing category IDs
            $response = actingAs(User::factory()->create())->post(route('organizations.store'), [
                'name' => 'New Organization',
                'organization_categories' => [999],
            ]);

            // Assert: check if the validation fails for the organization_categories field
            $response->assertSessionHasErrors(['organization_categories.0']);
            assertDatabaseMissing('organizations', ['name' => 'New Organization']);
        });

        // Test unauthorized access to the create and store routes
        it('redirects guests when trying to access create or store routes', function () {
            // Act: send a GET request to the create route
            $createResponse = get(route('organizations.create'));
            $createResponse->assertRedirect(route('login'));

            // Act: send a POST request to the store route
            $storeResponse = post(route('organizations.store'), []);
            $storeResponse->assertRedirect(route('login'));
        });
    });

    describe('notes', function () {
        it('can store notes for a new organization', function () {
            $this->dummyOrganization['notes'] = 'These are some notes for the organization.';

            $response = actingAs(User::factory()->create())->post(route('organizations.store'), $this->dummyOrganization);

            $response->assertSessionHas('success', "Neue Organisation 'New Organization' erfolgreich erstellt.");
            assertDatabaseHas('notes', [
                'notes' => 'These are some notes for the organization.',
                'organization_id' => Organization::where('name', 'New Organization')->first()->id,
            ]);
        });

        it('can store an organization without notes', function () {
            unset($this->dummyOrganization['notes']);

            $response = actingAs(User::factory()->create())->post(route('organizations.store'), $this->dummyOrganization);

            $response->assertSessionHas('success', "Neue Organisation 'New Organization' erfolgreich erstellt.");
            assertDatabaseHas('notes', [
                'notes' => null,
                'organization_id' => Organization::where('name', 'New Organization')->first()->id,
            ]);
        });
    });
});
