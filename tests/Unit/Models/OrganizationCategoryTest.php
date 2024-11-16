<?php

use App\Models\Organization;
use App\Models\OrganizationCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('can create a organization category', function () {
    $category = OrganizationCategory::factory()->create([
        'name' => 'Finance',
        'description' => 'Related to financial activities',
    ]);

    expect($category)->toBeInstanceOf(OrganizationCategory::class)
        ->and($category->name)->toBe('Finance')
        ->and($category->description)->toBe('Related to financial activities');
});

it('can associate organizations with a category', function () {
    $category = OrganizationCategory::factory()->create();
    $organization1 = Organization::factory()->create();
    $organization2 = Organization::factory()->create();

    $category->organizations()->attach([$organization1->id, $organization2->id]);

    expect($category->organizations)->toHaveCount(2)
        ->and($category->organizations->pluck('id')->toArray())
        ->toContain($organization1->id, $organization2->id);
});

it('can retrieve organizations associated with a category', function () {
    $category = OrganizationCategory::factory()->create();
    $organization = Organization::factory()->create();

    $category->organizations()->attach($organization->id);

    $retrievedOrganizations = $category->organizations;

    expect($retrievedOrganizations)->toHaveCount(1)
        ->and($retrievedOrganizations->first()->id)->toBe($organization->id);
});

it('can update a organization category', function () {
    $category = OrganizationCategory::factory()->create([
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

it('can delete a organization category', function () {
    $category = OrganizationCategory::factory()->create();

    $category->delete();

    expect(OrganizationCategory::find($category->id))->toBeNull();
});
