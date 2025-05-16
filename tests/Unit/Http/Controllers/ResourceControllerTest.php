<?php

use App\Models\Organization;
use App\Models\Resource;
use App\Models\ResourceCategory;
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
    $this->categories = ResourceCategory::factory()->count(3)->create();
    $this->organization = Organization::factory()->create();
    $this->dummyResource = [
        'type' => 'resource',
        'summary' => 'Resource Summary',
        'description' => 'Resource Description',
        'resource_categories' => $this->categories->pluck('id')->toArray(),
        'organization_id' => $this->organization->id,
    ];
    $this->dummyRequirement = [
        'type' => 'requirement',
        'summary' => 'A long Requirement Summary is getting shortened',
        'description' => 'Requirement Description',
        'resource_categories' => $this->categories->pluck('id')->toArray(),
        'organization_id' => $this->organization->id,
    ];
});

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

// Test the create method
it('renders the create page with resource categories', function () {
    // Act: send a GET request to the create route
    $response = actingAs(User::factory()->create())->get(route('resources.create', $this->organization));

    // Assert: check if the response contains the correct Inertia data
    $response->assertInertia(fn (Assert $page): Assert => $page->component('resources/resource-create-page')
        ->has('resourceCategories', 3)
        ->where('resourceCategories', fn ($categoriesArray) => collect($categoriesArray)->contains(fn ($category) => $category['id'] === $this->categories->first()->id &&
                $category['title'] === $this->categories->first()->title
        )
        )
        ->where('organization.id', $this->organization->id)
    );
});

// Test the store method for successful creation
it('can store a new resource', function () {
    // Act: send a POST request to store the resource
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), $this->dummyResource);

    // Assert: check if the resource is in the database
    $response
        ->assertSessionHas('success', "Neue Ressource 'Resource Summary' erfolgreich erstellt.");
    assertDatabaseHas('resources', [
        'summary' => 'Resource Summary',
        'description' => 'Resource Description',
        'type' => 'resource',
    ]);

    // Check if the relationship is correctly saved
    $resource = Resource::where('summary', 'Resource Summary')->first();
    expect($resource->resourceCategories->pluck('id')->toArray())->toMatchArray($this->categories->pluck('id')->toArray());
});

// Test the success message
it('can store a new requirement', function () {
    // Act: send a POST request to store the resource
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), $this->dummyRequirement);

    // Assert: check if the resource is in the database
    $response
        ->assertSessionHas('success', "Neuen Bedarf 'A long Requirement Summary is getting sh...' erfolgreich erstellt.");
    assertDatabaseHas('resources', [
        'summary' => 'A long Requirement Summary is getting shortened',
        'description' => 'Requirement Description',
        'type' => 'requirement',
    ]);

    // Check if the relationship is correctly saved
    $requirement = Resource::where('description', 'Requirement Description')->first();
    expect($requirement->resourceCategories->pluck('id')->toArray())->toMatchArray($this->categories->pluck('id')->toArray());
});

// Test that modelId is included in the session when a resource is successfully created
it('includes modelId in the session when a resource is created', function () {
    // Act: send a POST request to store the resource
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), $this->dummyResource);

    // Assert: check if the modelId is in the session
    $resource = Resource::where('summary', 'Resource Summary')->first();
    $response->assertSessionHas('modelId', $resource->id);
});

// Test validation errors for required fields
it('fails to store a resource without required fields', function () {
    // Act: send a POST request with missing required fields
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), []);

    // Assert: check if validation errors are returned for the missing fields
    $response->assertSessionHasErrors(['description', 'type', 'resource_categories']);
    assertDatabaseMissing('resources', ['summary' => '']);
});

// Test validation for unique constraints
it('fails to store a resource with a non-unique summary', function () {
    // Arrange: create an existing resource
    $existingResource = Resource::factory()->create(['summary' => 'Existing Resource']);

    // Act: try to create another resource with the same summary
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), [
        'summary' => 'Existing Resource',
        'description' => 'Resource Description',
        'type' => 'resource',
        'resource_categories' => ResourceCategory::factory()->count(1)->create()->pluck('id')->toArray(),
    ]);

    // Assert: check if the validation fails
    $response->assertSessionHasErrors(['summary']);
    assertDatabaseHas('resources', ['summary' => 'Existing Resource']);
});

// Test for handling missing resource categories in the request
it('fails to store a resource if resource categories do not exist', function () {
    // Act: send a POST request with non-existing category IDs
    $response = actingAs(User::factory()->create())->post(route('resources.store', $this->organization), [
        'summary' => 'New Resource',
        'description' => 'Resource Description',
        'type' => 'resource',
        'resource_categories' => [999],
    ]);

    // Assert: check if the validation fails for the resource_categories field
    $response->assertSessionHasErrors(['resource_categories.0']);
    assertDatabaseMissing('resources', ['summary' => 'New Resource']);
});

// Test unauthorized access to the create and store routes
it('redirects guests when trying to access create or store routes', function () {
    // Act: send a GET request to the create route
    $createResponse = get(route('resources.create', $this->organization));
    $createResponse->assertRedirect(route('login'));

    // Act: send a POST request to the store route
    $storeResponse = post(route('resources.store', $this->organization), []);
    $storeResponse->assertRedirect(route('login'));
});
