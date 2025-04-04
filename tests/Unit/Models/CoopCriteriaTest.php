<?php

use App\Models\CoopCriteria;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('CoopCriteria', function (): void {

    describe('creation', function (): void {
        it('can create an notes and criteria', function () {
            $coopCriteria = CoopCriteria::factory()->create([
                'for_coop' => 'Test Criteria for Coop',
                'ko_no_coop' => 'Test Criteria KO No Coop',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($coopCriteria)->toBeInstanceOf(CoopCriteria::class)
                ->and($coopCriteria->for_coop)->toBe('Test Criteria for Coop')
                ->and($coopCriteria->ko_no_coop)->toBe('Test Criteria KO No Coop');
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $coopCriteria = CoopCriteria::factory()->create(['organization_id' => $organization->id]);

            expect($coopCriteria->organization)->toBeInstanceOf(Organization::class)
                ->and($coopCriteria->organization->id)->toBe($organization->id);
        });
    });
});
