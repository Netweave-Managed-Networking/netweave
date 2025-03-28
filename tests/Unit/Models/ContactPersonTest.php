<?php

use App\Models\ContactPerson;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('ContactPerson', function (): void {

    describe('creation', function (): void {
        it('can create a contact person', function () {
            $contactPerson = ContactPerson::factory()->create([
                'name' => 'James Bond',
                'email' => 'james@bond.test',
                'phone' => '+(12) 34 5678 999',
                'postcode_city' => 'I have',
                'street_hnr' => 'no clue',
                'organization_id' => Organization::factory()->create()->id,
            ]);

            expect($contactPerson)->toBeInstanceOf(ContactPerson::class)
                ->and($contactPerson->name)->toBe('James Bond')
                ->and($contactPerson->email)->toBe('james@bond.test')
                ->and($contactPerson->phone)->toBe('+(12) 34 5678 999')
                ->and($contactPerson->postcode_city)->toBe('I have')
                ->and($contactPerson->street_hnr)->toBe('no clue');
        });
    });

    describe('organization', function (): void {
        it('can associate an organization', function () {
            $organization = Organization::factory()->create();
            $contactPerson = ContactPerson::factory()->create(['organization_id' => $organization->id]);

            expect($contactPerson->organization)->toBeInstanceOf(Organization::class)
                ->and($contactPerson->organization->id)->toBe($organization->id);
        });
    });
});
