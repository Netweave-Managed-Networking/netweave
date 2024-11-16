<?php

use App\Models\Organization;
use App\Models\OrganizationCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

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

it('can associate organization categories', function () {
    $organization = Organization::factory()->create();
    $category = OrganizationCategory::factory()->create();

    $organization->OrganizationCategories()->attach($category);

    expect($organization->OrganizationCategories)->toHaveCount(1)
        ->and($organization->OrganizationCategories->first()->id)->toBe($category->id);
});

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
