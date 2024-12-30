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
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function PHPUnit\Framework\assertEmpty;
use function PHPUnit\Framework\assertEquals;

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

describe('storeJson', function () {

    // Test for successful creation of a OrganizationCategory
    it('creates a new organization category with valid data', function () {
        $user = User::factory()->create();
        actingAs($user);

        $payload = [
            'name' => 'New Category',
            'description' => 'A description for the new category',
        ];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus(Response::HTTP_CREATED)
            ->assertJson([
                'name' => $payload['name'],
                'description' => $payload['description'],
            ]);

        assertDatabaseHas('organization_categories', $payload);
    });

    // Test for name validation (required, string, max:64, unique)
    it('validates the name field', function ($name, $expectedStatus) {
        $user = User::factory()->create();
        actingAs($user);

        $payload = [
            'name' => $name,
            'description' => 'Valid description',
        ];

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus($expectedStatus);

        if ($expectedStatus === Response::HTTP_CREATED) {
            assertDatabaseHas('organization_categories', ['name' => $name]);
        } else {
            assertEmpty(OrganizationCategory::where('name', $name)->get()->toArray());
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

        $response = post('/organization-categories/api', $payload);

        $response->assertStatus($expectedStatus);

        if ($expectedStatus === Response::HTTP_CREATED) {
            assertDatabaseHas('organization_categories', ['description' => $description]);
        } else {
            assertEmpty(OrganizationCategory::where('description', $description)->get()->toArray());
        }
    })->with([
        [str_repeat('a', 257), 302], // max:256 validation
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
    beforeEach(function () use (&$cat) {
        actingAs(User::factory()->create());
        OrganizationCategory::factory()->count(10)->create();
    });

    it('should have status 200', function () use (&$cat): void {
        $response = get('/organization-categories/edit');
        $response->assertOk();
    });

    it('should return correct page with correct number of categories', function () use (&$cat): void {
        $this->get('/organization-categories/edit')
            ->assertInertia(fn (Assert $page) => $page->component('OrganizationCategories/OrganizationCategoriesEdit')
                ->has('organizationCategories', 10) // Adjust the count if needed
            );
    });
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
