<?php

use App\Models\ContactPerson;
use App\Models\CoopCriteria;
use App\Models\Notes;
use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\Resource;
use App\Models\ResourceCategory;
use App\Models\Restriction;
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

            $organization->OrganizationCategories()->attach($category->id);

            expect($organization->OrganizationCategories)->toHaveCount(1)
                ->and($organization->OrganizationCategories->first()->id)->toBe($category->id);
        });
    });

    describe('state organizations', function (): void {
        it('can associate stated organizations', function () {
            $organization = Organization::factory()->create();
            $statedOrganization = Organization::factory()->create();

            $organization->statedOrganizations()->attach($statedOrganization->id, [
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

            $organization->statingOrganizations()->attach($statingOrganization->id, [
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
            Notes::factory()->create(['organization_id' => $organization->id, 'notes' => 'Test notes']);

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
        it('is an empty array for an organization without resources', function () {
            $organization = Organization::factory()->create();

            $resourceCategoriesOfOrganization = $organization->getResourceCategories();
            expect($resourceCategoriesOfOrganization)->toHaveCount(0);
        });

        it('is an empty array for an organization with resources which have no categories', function () {
            $organization = Organization::factory()->create();
            $resources = Resource::factory(2)->create(['type' => 'resource']);
            $organization->resources()->saveMany($resources);

            $resourceCategoriesOfOrganization = $organization->getResourceCategories();
            expect($resourceCategoriesOfOrganization)->toHaveCount(0);

        });

        it('can get distinct resource categories of the resources of this organization', function () {
            $organization = Organization::factory()->create();
            $resources = Resource::factory(2)->create(['type' => 'resource']);
            $resourceCategories = ResourceCategory::factory(4)->create();
            $resources[0]->resourceCategories()->attach($resourceCategories[0]->id);
            $resources[0]->resourceCategories()->attach($resourceCategories[1]->id);
            $resources[1]->resourceCategories()->attach($resourceCategories[0]->id);
            $resources[1]->resourceCategories()->attach($resourceCategories[3]->id);
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
            $requirements[0]->resourceCategories()->attach($requirementCategories[3]->id);
            $requirements[0]->resourceCategories()->attach($requirementCategories[0]->id);
            $requirements[1]->resourceCategories()->attach($requirementCategories[3]->id);
            $requirements[1]->resourceCategories()->attach($requirementCategories[2]->id);
            $requirements[1]->resourceCategories()->attach($requirementCategories[0]->id);
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

    describe('notes', function (): void {
        it('can associate notes', function () {
            $organization = Organization::factory()->create();
            $note = Notes::factory()->create(['organization_id' => $organization->id]);

            expect($organization->notes)->toBeInstanceOf(Notes::class)
                ->and($organization->notes->id)->toBe($note->id);
        });
    });

    describe('contact person', function (): void {
        it('can associate a contact person', function () {
            $organization = Organization::factory()->create();
            $contactPerson = ContactPerson::factory()->create(['organization_id' => $organization->id]);

            expect($organization->contactPersons[0])->toBeInstanceOf(ContactPerson::class)
                ->and($organization->contactPersons[0]->id)->toBe($contactPerson->id);
        });

        it('can associate 3 contact persons', function () {
            $organization = Organization::factory()->create();
            $contactPersons = ContactPerson::factory(3)->create(['organization_id' => $organization->id]);

            expect($organization->contactPersons[0])->toBeInstanceOf(ContactPerson::class)
                ->and($organization->contactPersons[0]->id)->toBe($contactPersons[0]->id);
            expect($organization->contactPersons[1])->toBeInstanceOf(ContactPerson::class)
                ->and($organization->contactPersons[1]->id)->toBe($contactPersons[1]->id);
            expect($organization->contactPersons[2])->toBeInstanceOf(ContactPerson::class)
                ->and($organization->contactPersons[2]->id)->toBe($contactPersons[2]->id);
        });
    });

    describe('coop criteria', function (): void {
        it('can associate coop criteria', function () {
            $organization = Organization::factory()->create();
            $coopCriteria = CoopCriteria::factory()->create(['organization_id' => $organization->id]);

            expect($organization->coopCriteria)->toBeInstanceOf(CoopCriteria::class)
                ->and($organization->coopCriteria->id)->toBe($coopCriteria->id);
        });
    });

    describe('restrictions', function (): void {
        it('can associate thematic restrictions', function () {
            $organization = Organization::factory()->create();
            $restriction = Restriction::factory()->create(['organization_id' => $organization->id, 'type' => 'thematic']);

            expect($organization->restrictionThematic)->toBeInstanceOf(Restriction::class)
                ->and($organization->restrictionThematic->id)->toBe($restriction->id);
        });

        it('can associate regional restrictions', function () {
            $organization = Organization::factory()->create();
            $restriction = Restriction::factory()->create(['organization_id' => $organization->id, 'type' => 'regional']);

            expect($organization->restrictionRegional)->toBeInstanceOf(Restriction::class)
                ->and($organization->restrictionRegional->id)->toBe($restriction->id);
        });
    });
});
