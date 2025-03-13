<?php

use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\OrganizationNotes;
use App\Models\Resource;
use App\Models\ResourceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('Organization', function (): void {

    describe('creation', function (): void {
        it('can create a organization', function () {
            $organization = Organization::factory()->create([
                'name' => 'Test Organization',
                'email' => 'test@organization.com',
                'phone' => '123-456-7890',
                'postcode_city' => '12345 Test City',
                'street_hnr' => '123 Test St.',
            ]);

            expect($organization)->toBeInstanceOf(Organization::class)
                ->and($organization->name)->toBe('Test Organization')
                ->and($organization->email)->toBe('test@organization.com')
                ->and($organization->phone)->toBe('123-456-7890')
                ->and($organization->postcode_city)->toBe('12345 Test City')
                ->and($organization->street_hnr)->toBe('123 Test St.');
        });
    });

    describe('organization categories', function (): void {
        it('can associate organization categories', function () {
            $organization = Organization::factory()->create();
            $category = OrganizationCategory::factory()->create();

            $organization->OrganizationCategories()->attach($category);

            expect($organization->OrganizationCategories)->toHaveCount(1)
                ->and($organization->OrganizationCategories->first()->id)->toBe($category->id);
        });
    });

    describe('state organizations', function (): void {
        it('can associate stated organizations', function () {
            $organization = Organization::factory()->create();
            $statedOrganization = Organization::factory()->create();

            $organization->statedOrganizations()->attach($statedOrganization, [
                'type' => 'type_example',
                'conflict' => false,
            ]);

            expect($organization->statedOrganizations)->toHaveCount(1)
                ->and($organization->statedOrganizations->first()->id)->toBe($statedOrganization->id)
                ->and($organization->statedOrganizations->first()->pivot->type)->toBe('type_example')
                ->and($organization->statedOrganizations->first()->pivot->conflict)->toBeFalsy();
        });

        it('can associate stating organizations', function () {
            $organization = Organization::factory()->create();
            $statingOrganization = Organization::factory()->create();

            $organization->statingOrganizations()->attach($statingOrganization, [
                'type' => 'another_type',
                'conflict' => true,
            ]);

            $statingOrgs = $organization->statingOrganizations;

            expect($statingOrgs)->toHaveCount(1)
                ->and($statingOrgs->first()->id)->toBe($statingOrganization->id)
                ->and($statingOrgs->first()->pivot->type)->toBe('another_type')
                ->and($statingOrgs->first()->pivot->conflict)->toBeTruthy();
        });
    });

    describe('notes', function (): void {
        it('can retrieve notes', function (): void {
            $organization = Organization::factory()->create();
            OrganizationNotes::factory()->create(['organization_id' => $organization->id, 'notes' => 'Test notes']);

            $retrievedNotes = $organization->notes;

            expect($retrievedNotes)->not->toBeNull()
                ->and($retrievedNotes->notes)->toBe('Test notes');
        });
    });

    describe('resources', function (): void {
        it('can associate resources', function () {
            $organization = Organization::factory()->create();
            $resource = Resource::factory()->create(['type' => 'resource']);

            $organization->resources()->save($resource);

            expect($organization->resources)->toHaveCount(1)
                ->and($organization->resources->first()->id)->toBe($resource->id);
        });

        it('can associate multiple resources', function () {
            $organization = Organization::factory()->create();
            $resources = Resource::factory()->count(3)->create(['type' => 'resource']);

            $organization->resources()->saveMany($resources);

            expect($organization->resources()->get())->toHaveCount(3)
                ->and($organization->resources()->get()->pluck('id'))->toEqual($resources->pluck('id'));
        });
    });

    describe('requirements', function (): void {
        it('can associate requirements', function () {
            $organization = Organization::factory()->create();
            $resource = Resource::factory()->create(['type' => 'requirement']);

            $organization->requirements()->save($resource);

            expect($organization->requirements)->toHaveCount(1)
                ->and($organization->requirements->first()->id)->toBe($resource->id);
        });

        it('can associate multiple requirements', function () {
            $organization = Organization::factory()->create();
            $requirements = Resource::factory()->count(3)->create(['type' => 'requirement']);

            $organization->requirements()->saveMany($requirements);

            expect($organization->requirements()->get())->toHaveCount(3)
                ->and($organization->requirements()->get()->pluck('id'))->toEqual($requirements->pluck('id'));
        });
    });

    describe('getResourceCategories', function (): void {
        it('can get distinct resource categories of the resources of this organization', function () {
            $organization = Organization::factory()->create();
            $resources = Resource::factory(2)->create(['type' => 'resource']);
            $resourceCategories = ResourceCategory::factory(4)->create();
            $resources[0]->resourceCategories()->attach($resourceCategories[0]);
            $resources[0]->resourceCategories()->attach($resourceCategories[1]);
            $resources[1]->resourceCategories()->attach($resourceCategories[0]);
            $resources[1]->resourceCategories()->attach($resourceCategories[3]);

            $organization->resources()->saveMany($resources);

            $resourceCategoriesOfOrganization = $organization->getResourceCategories();

            expect($resourceCategoriesOfOrganization)->toHaveCount(3)
                ->and($resourceCategoriesOfOrganization->pluck('id'))
                ->toContain($resourceCategories[0]->id)
                ->toContain($resourceCategories[1]->id)
                ->toContain($resourceCategories[3]->id)
                ->not->toContain($resourceCategories[2]->id);
        });
    });

    describe('getRequirementCategories', function (): void {
        it('can get distinct requirement categories of the requirements of this organization', function () {
            $organization = Organization::factory()->create();
            $requirements = Resource::factory(2)->create(['type' => 'requirement']);
            $requirementCategories = ResourceCategory::factory(5)->create();
            $requirements[0]->resourceCategories()->attach($requirementCategories[3]);
            $requirements[0]->resourceCategories()->attach($requirementCategories[0]);
            $requirements[1]->resourceCategories()->attach($requirementCategories[3]);
            $requirements[1]->resourceCategories()->attach($requirementCategories[2]);
            $requirements[1]->resourceCategories()->attach($requirementCategories[0]);

            $organization->requirements()->saveMany($requirements);

            $requirementCategoriesOfOrganization = $organization->getRequirementCategories();

            expect($requirementCategoriesOfOrganization)->toHaveCount(3)
                ->and($requirementCategoriesOfOrganization->pluck('id'))
                ->toContain($requirementCategories[0]->id)
                ->toContain($requirementCategories[2]->id)
                ->toContain($requirementCategories[3]->id)
                ->not->toContain($requirementCategories[1]->id);
        });
    });
});
