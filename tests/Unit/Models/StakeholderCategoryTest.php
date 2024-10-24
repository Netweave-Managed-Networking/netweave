<?php

use App\Models\StakeholderCategory;
use App\Models\StakeholderOrganization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('can create a stakeholder category', function () {
    $category = StakeholderCategory::factory()->create([
        'name' => 'Finance',
        'description' => 'Related to financial activities',
    ]);

    expect($category)->toBeInstanceOf(StakeholderCategory::class)
        ->and($category->name)->toBe('Finance')
        ->and($category->description)->toBe('Related to financial activities');
});

it('can associate stakeholder organizations with a category', function () {
    $category = StakeholderCategory::factory()->create();
    $organization1 = StakeholderOrganization::factory()->create();
    $organization2 = StakeholderOrganization::factory()->create();

    $category->stakeholderOrganizations()->attach([$organization1->id, $organization2->id]);

    expect($category->stakeholderOrganizations)->toHaveCount(2)
        ->and($category->stakeholderOrganizations->pluck('id')->toArray())
        ->toContain($organization1->id, $organization2->id);
});

it('can retrieve stakeholder organizations associated with a category', function () {
    $category = StakeholderCategory::factory()->create();
    $organization = StakeholderOrganization::factory()->create();

    $category->stakeholderOrganizations()->attach($organization->id);

    $retrievedOrganizations = $category->stakeholderOrganizations;

    expect($retrievedOrganizations)->toHaveCount(1)
        ->and($retrievedOrganizations->first()->id)->toBe($organization->id);
});

it('can update a stakeholder category', function () {
    $category = StakeholderCategory::factory()->create([
        'name' => 'Marketing',
        'description' => 'Marketing related activities',
    ]);

    $category->update([
        'name' => 'Updated Marketing',
        'description' => 'Updated description',
    ]);

    expect($category->fresh()->name)->toBe('Updated Marketing')
        ->and($category->fresh()->description)->toBe('Updated description');
});

it('can delete a stakeholder category', function () {
    $category = StakeholderCategory::factory()->create();

    $category->delete();

    expect(StakeholderCategory::find($category->id))->toBeNull();
});
