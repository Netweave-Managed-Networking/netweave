<?php

use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function PHPUnit\Framework\assertEmpty;
use function PHPUnit\Framework\assertEquals;

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

describe('storeJson', function () {

    // Test for successful creation of a OrganizationCategory
    it('creates a new organization category with valid data', function () {
        $user = User::factory()->create();
        actingAs($user);

        $payload = ['name' => 'New Category', 'description' => 'A description for the new category'];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus(Response::HTTP_CREATED)
            ->assertJson(['name' => $payload['name'], 'description' => $payload['description']]);

        assertDatabaseHas('organization_categories', $payload);
    });

    // Test for name validation (required, string, max:63, unique)
    it('validates the name field', function ($name, $expectedStatus) {
        $user = User::factory()->create();
        actingAs($user);

        $payload = ['name' => $name, 'description' => 'Valid description'];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus($expectedStatus);

        if ($expectedStatus === Response::HTTP_CREATED) {
            assertDatabaseHas('organization_categories', ['name' => $name]);
        } else {
            assertEmpty(OrganizationCategory::where('name', $name)->get()->toArray());
        }
    })->with([
        ['', 302],           // required validation
        [str_repeat('a', 64), 302], // max:63 validation
        ['Unique Name', Response::HTTP_CREATED],             // valid name
    ]);

    // Test for description validation (nullable, string, max:255, unique)
    it('validates the description field', function ($description, $expectedStatus) {
        $user = User::factory()->create();
        actingAs($user);

        $payload = [
            'name' => 'Another Unique Name',
            'description' => $description,
        ];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus($expectedStatus);

        if ($expectedStatus === Response::HTTP_CREATED) {
            assertDatabaseHas('organization_categories', ['description' => $description]);
        } else {
            assertEmpty(OrganizationCategory::where('description', $description)->get()->toArray());
        }
    })->with([
        [str_repeat('a', 256), 302], // max:255 validation
        [null, Response::HTTP_CREATED],                             // nullable field
        ['Another Unique Description', Response::HTTP_CREATED],     // valid description
    ]);

    // Test for duplicate name
    it('fails to create a organization category with a duplicate name', function () {
        $user = User::factory()->create();
        actingAs($user);

        $existingCategory = OrganizationCategory::factory()->create(['name' => 'Duplicate Name']);

        $payload = [
            'name' => 'Duplicate Name',
            'description' => 'A new description',
        ];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus(302);
        assertEmpty(OrganizationCategory::where('name', $payload['name'])->where('description', $payload['description'])->get()->toArray());
    });
});

describe('getJson', function () {

    $cat = null;

    beforeEach(function () use (&$cat) {
        actingAs(User::factory()->create());
        $cat = OrganizationCategory::factory()->create(['name' => 'category name', 'description' => 'category description']);
    });

    it('should have status 200', function () use (&$cat): void {
        $response = get("/organization-categories/api/$cat->id");
        $response->assertOk();
    });

    it('should return correct category', function () use (&$cat): void {
        $response = get("/organization-categories/api/$cat->id");
        $response->assertJson(['id' => $cat->id]);
    });

    it('should fetch all of the categories organizations', function () use (&$cat) {
        $numberOfOrgs = 10;
        $cat->organizations()->sync(Organization::factory($numberOfOrgs)->create()->pluck('id'));
        $response = get("/organization-categories/api/$cat->id");

        assertEquals(count($response->json()['organizations']), $numberOfOrgs);
    });
});

describe('edit', function () {
    beforeEach(function () {
        actingAs(User::factory()->create());
        OrganizationCategory::factory()->count(10)->create();
    });

    it('should have status 200', function (): void {
        $response = get('/organization-categories/edit');
        $response->assertOk();
    });

    it('should return correct page with correct number of categories', function (): void {
        $this->get('/organization-categories/edit')
            ->assertInertia(fn (Assert $page) => $page->component('organization-categories/organization-categories-edit-page')
                ->has('organizationCategories', 10) // Adjust the count if needed
            );
    });
});

describe('update', function () {

    $cat = null;
    beforeEach(function () use (&$cat) {
        $cat = OrganizationCategory::factory()->create(['name' => 'Old Name', 'description' => 'Old Description']);
        actingAs(User::factory()->create());
    });

    it('should update a category with valid data', function ($name, $description) use (&$cat) {
        $payload = ['name' => $name, 'description' => $description];
        $response = put("/organization-categories/{$cat->id}", $payload);

        $response->assertStatus(302);
        assertDatabaseHas('organization_categories', $payload);
    })->with([
        ['Valid Name', 'Valid Description'], // valid data
        ['Valid Name', null], // description nullable is valid
    ]);

    it('should validate the update request and not update the category', function ($name, $description) use (&$cat) {
        $payload = ['name' => $name, 'description' => $description];
        $response = put("/organization-categories/{$cat->id}", $payload);

        $response->assertStatus(302);
        assertDatabaseMissing('organization_categories', ['name' => $name, 'description' => $description]);
    })->with([
        ['', 'Valid Description'], // name required fails
        [str_repeat('a', 64), 'Valid Description'], // name max:63 fails
        ['Valid Name', str_repeat('a', 256)], // description max:255 fails
    ]);
});

describe('destroy', function () {
    beforeEach(function () {
        actingAs(User::factory()->create());
        OrganizationCategory::factory()->count(1)->create();
    });

    it('should delete a category and redirect with success message', function () {
        $category = OrganizationCategory::first();
        $response = $this->delete("/organization-categories/$category->id");

        $response->assertRedirect(route('organization-categories.edit'))
            ->assertSessionHas('success', "Organisationskategorie '{$category->name}' gelöscht.");

        expect(OrganizationCategory::find($category->id))->toBeNull();
    });
});
