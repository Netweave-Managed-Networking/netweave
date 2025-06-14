<?php

use App\Models\Organization;
use App\Models\Resource;
use App\Models\ResourceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('ResourceCategory', function (): void {

    describe('creation', function (): void {
        it('can create a resource category', function () {
            $resourceCategory = ResourceCategory::factory()->create([
                'title' => 'Test Category',
                'definition' => 'This is a test category definition.',
            ]);

            expect($resourceCategory)->toBeInstanceOf(ResourceCategory::class)
                ->and($resourceCategory->title)->toBe('Test Category')
                ->and($resourceCategory->definition)->toBe('This is a test category definition.');
        });
    });

    describe('resources and requirements', function (): void {
        it('can associate resources', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resource = Resource::factory()->create(['type' => 'resource']);

            $resourceCategory->resources()->attach($resource->id);

            expect($resourceCategory->resources)->toHaveCount(1)
                ->and($resourceCategory->resources->first()->id)->toBe($resource->id);
        });

        it('can associate requirements', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resource = Resource::factory()->create(['type' => 'requirement']);

            $resourceCategory->requirements()->attach($resource->id);

            expect($resourceCategory->requirements)->toHaveCount(1)
                ->and($resourceCategory->requirements->first()->id)->toBe($resource->id);
        });

        it('can associate multiple resources and requirements (via resources)', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $requirementOrResourceList = Resource::factory()->count(7)->create();
            $requirements = $requirementOrResourceList->where('type', 'requirement');
            $resources = $requirementOrResourceList->where('type', 'resource');

            $resourceCategory->resources()->attach($requirementOrResourceList->pluck('id')->toArray());

            expect($resourceCategory->requirements)->toHaveCount($requirements->count())
                ->and($resourceCategory->requirements->pluck('id'))->toEqual($requirements->pluck('id'));
            expect($resourceCategory->resources)->toHaveCount($resources->count())
                ->and($resourceCategory->resources->pluck('id'))->toEqual($resources->pluck('id'));
        });

        it('can associate multiple resources and requirements (via requirements)', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $requirementOrResourceList = Resource::factory()->count(7)->create();
            $requirements = $requirementOrResourceList->where('type', 'requirement');
            $resources = $requirementOrResourceList->where('type', 'resource');

            $resourceCategory->requirements()->attach($requirementOrResourceList->pluck('id')->toArray());

            expect($resourceCategory->requirements)->toHaveCount($requirements->count())
                ->and($resourceCategory->requirements->pluck('id'))->toEqual($requirements->pluck('id'));
            expect($resourceCategory->resources)->toHaveCount($resources->count())
                ->and($resourceCategory->resources->pluck('id'))->toEqual($resources->pluck('id'));
        });
    });

    describe('getRequiringOrganizations', function (): void {
        it('can get 3 distinct organizations which have resources of this category', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resourceCategoryDumb = ResourceCategory::factory()->create();
            $organization1 = Organization::factory()->create();
            $organization2 = Organization::factory()->create();
            $organization3 = Organization::factory()->create();
            $organization4 = Organization::factory()->create();
            $organization5 = Organization::factory()->create();

            $resource1 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization1->id]);
            $resource2 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization2->id]);
            $resource3 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization3->id]);
            $resource4 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization4->id]);
            $requirement1 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization3->id]);
            $requirement2 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization5->id]);

            $resourceCategory->resources()->attach([$resource1->id, $resource2->id, $resource3->id, $requirement1->id, $requirement2->id]);
            $resourceCategoryDumb->resources()->attach([$resource4->id]);

            $requiringOrganizations = $resourceCategory->getProvidingOrganizations();

            expect($requiringOrganizations)->toHaveCount(3)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization1->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization2->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization3->id);
        });

        it('can get 2 distinct organizations which require resources of this category', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resourceCategoryDumb = ResourceCategory::factory()->create();
            $organization1 = Organization::factory()->create();
            $organization2 = Organization::factory()->create();
            $organization3 = Organization::factory()->create();
            $organization4 = Organization::factory()->create();
            $organization5 = Organization::factory()->create();

            $resource1 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization1->id]);
            $resource2 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization2->id]);
            $resource3 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization3->id]);
            $resource4 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization4->id]);
            $requirement1 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization3->id]);
            $requirement2 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization5->id]);

            $resourceCategory->resources()->attach([$resource1->id, $resource2->id, $resource3->id, $requirement1->id, $requirement2->id]);
            $resourceCategoryDumb->resources()->attach([$resource4->id]);

            $requiringOrganizations = $resourceCategory->getRequiringOrganizations();

            expect($requiringOrganizations)->toHaveCount(2)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization3->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization5->id);
        });
    });

    describe('getProvidingOrganizations', function (): void {
        it('can get 2 distinct organizations which have resources of this category', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resourceCategoryDumb = ResourceCategory::factory()->create();
            $organization1 = Organization::factory()->create();
            $organization2 = Organization::factory()->create();
            $organization3 = Organization::factory()->create();
            $organization4 = Organization::factory()->create();
            $organization5 = Organization::factory()->create();

            $requirement1 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization1->id]);
            $requirement2 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization2->id]);
            $requirement3 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization3->id]);
            $requirement4 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization4->id]);
            $resource1 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization3->id]);
            $resource2 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization5->id]);

            $resourceCategory->resources()->attach([$requirement1->id, $requirement2->id, $requirement3->id, $resource1->id, $resource2->id]);
            $resourceCategoryDumb->resources()->attach([$requirement4->id]);

            $requiringOrganizations = $resourceCategory->getProvidingOrganizations();

            expect($requiringOrganizations)->toHaveCount(2)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization3->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization5->id);
        });

        it('can get 3 distinct organizations which have resources of this category', function () {
            $resourceCategory = ResourceCategory::factory()->create();
            $resourceCategoryDumb = ResourceCategory::factory()->create();
            $organization1 = Organization::factory()->create();
            $organization2 = Organization::factory()->create();
            $organization3 = Organization::factory()->create();
            $organization4 = Organization::factory()->create();
            $organization5 = Organization::factory()->create();

            $resource1 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization1->id]);
            $resource2 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization2->id]);
            $resource3 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization3->id]);
            $resource4 = Resource::factory()->create(['type' => 'resource', 'organization_id' => $organization4->id]);
            $requirement1 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization3->id]);
            $requirement2 = Resource::factory()->create(['type' => 'requirement', 'organization_id' => $organization5->id]);

            $resourceCategory->resources()->attach([$resource1->id, $resource2->id, $resource3->id, $requirement1->id, $requirement2->id]);
            $resourceCategoryDumb->resources()->attach([$resource4->id]);

            $requiringOrganizations = $resourceCategory->getProvidingOrganizations();

            expect($requiringOrganizations)->toHaveCount(3)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization1->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization2->id)
                ->and($requiringOrganizations->pluck('id'))->toContain($organization3->id);
        });
    });
});
