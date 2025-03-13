<?php

use App\Models\Organization;
use App\Models\OrganizationCoopCriteria;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('OrganizationCoopCriteria', function (): void {

    describe('creation', function (): void {
        it('can create an organization notes and criteria', function () {
            $organizationCoopCriteria = OrganizationCoopCriteria::factory()->create([
                'criteria_for_coop' => 'Test Criteria for Coop',
                'criteria_ko_no_coop' => 'Test Criteria KO No Coop',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($organizationCoopCriteria)->toBeInstanceOf(OrganizationCoopCriteria::class)
                ->and($organizationCoopCriteria->criteria_for_coop)->toBe('Test Criteria for Coop')
                ->and($organizationCoopCriteria->criteria_ko_no_coop)->toBe('Test Criteria KO No Coop');
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $organizationCoopCriteria = OrganizationCoopCriteria::factory()->create(['organization_id' => $organization->id]);

            expect($organizationCoopCriteria->organization)->toBeInstanceOf(Organization::class)
                ->and($organizationCoopCriteria->organization->id)->toBe($organization->id);
        });
    });
});
