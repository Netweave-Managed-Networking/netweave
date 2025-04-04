<?php

use App\Models\Notes;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('Notes', function (): void {

    describe('creation', function (): void {
        it('can create an notes and criteria', function () {
            $notes = Notes::factory()->create([
                'notes' => 'Test Notes',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($notes)->toBeInstanceOf(Notes::class)
                ->and($notes->notes)->toBe('Test Notes');
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $notes = Notes::factory()->create(['organization_id' => $organization->id]);

            expect($notes->organization)->toBeInstanceOf(Organization::class)
                ->and($notes->organization->id)->toBe($organization->id);
        });
    });
});
