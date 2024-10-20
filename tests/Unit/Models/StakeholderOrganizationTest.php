<?php

use App\Models\StakeholderCategory;
use App\Models\StakeholderOrganization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('can create a stakeholder organization', function () {
    $organization = StakeholderOrganization::factory()->create([
        'name' => 'Test Organization',
        'email' => 'test@organization.com',
        'phone' => '123-456-7890',
        'postcode_city' => '12345 Test City',
        'street_hnr' => '123 Test St.',
    ]);

    expect($organization)->toBeInstanceOf(StakeholderOrganization::class)
        ->and($organization->name)->toBe('Test Organization')
        ->and($organization->email)->toBe('test@organization.com')
        ->and($organization->phone)->toBe('123-456-7890')
        ->and($organization->postcode_city)->toBe('12345 Test City')
        ->and($organization->street_hnr)->toBe('123 Test St.');
});

it('can associate stakeholder categories', function () {
    $organization = StakeholderOrganization::factory()->create();
    $category = StakeholderCategory::factory()->create();

    $organization->stakeholderCategories()->attach($category);

    expect($organization->stakeholderCategories)->toHaveCount(1)
        ->and($organization->stakeholderCategories->first()->id)->toBe($category->id);
});

it('can associate stated organizations', function () {
    $organization = StakeholderOrganization::factory()->create();
    $statedOrganization = StakeholderOrganization::factory()->create();

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
    $organization = StakeholderOrganization::factory()->create();
    $statingOrganization = StakeholderOrganization::factory()->create();

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
