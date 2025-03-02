<?php

use App\Models\Organization;
use App\Models\Resource;
use App\Models\ResourceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('Resource', function (): void {

    describe('creation', function (): void {
        it('can create a resource', function () {
            $resource = Resource::factory()->create([
                'summary' => 'Test Summary',
                'description' => 'This is a test resource description.',
                'type' => 'resource',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($resource)->toBeInstanceOf(Resource::class)
                ->and($resource->summary)->toBe('Test Summary')
                ->and($resource->description)->toBe('This is a test resource description.')
                ->and($resource->type)->toBe('resource');
        });
    });

    describe('resource categories', function (): void {
        it('can associate resource categories', function () {
            $resource = Resource::factory()->create();
            $category = ResourceCategory::factory()->create();

            $resource->resourceCategories()->attach($category);

            expect($resource->resourceCategories)->toHaveCount(1)
                ->and($resource->resourceCategories->first()->id)->toBe($category->id);
        });

        it('can associate multiple resource categories', function () {
            $resource = Resource::factory()->create();
            $categories = ResourceCategory::factory()->count(3)->create();

            $resource->resourceCategories()->attach($categories);

            expect($resource->resourceCategories)->toHaveCount(3)
                ->and($resource->resourceCategories->pluck('id'))->toEqual($categories->pluck('id'));
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $resource = Resource::factory()->create(['organization_id' => $organization->id]);

            expect($resource->organization)->toBeInstanceOf(Organization::class)
                ->and($resource->organization->id)->toBe($organization->id);
        });
    });
});
