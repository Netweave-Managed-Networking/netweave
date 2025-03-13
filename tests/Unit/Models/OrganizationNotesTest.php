<?php

use App\Models\Organization;
use App\Models\OrganizationNotes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('OrganizationNotes', function (): void {

    describe('creation', function (): void {
        it('can create an organization notes and criteria', function () {
            $organizationNotes = OrganizationNotes::factory()->create([
                'notes' => 'Test Notes',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($organizationNotes)->toBeInstanceOf(OrganizationNotes::class)
                ->and($organizationNotes->notes)->toBe('Test Notes');
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $organizationNotes = OrganizationNotes::factory()->create(['organization_id' => $organization->id]);

            expect($organizationNotes->organization)->toBeInstanceOf(Organization::class)
                ->and($organizationNotes->organization->id)->toBe($organization->id);
        });
    });
});
