<?php

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->dummyOrganization = Organization::factory()->create();
});

// This trait will reset the database for each test
uses(TestCase::class, RefreshDatabase::class);

describe('RestrictionNotesCoopCriteriaCreateController', function () {
    describe('create', function () {
        it('renders the create page with the organization and its notes', function () {
            $response = actingAs(User::factory()->create())->get(route('restrictions-coop_criteria-notes.create', $this->dummyOrganization));

            $response->assertInertia(fn (Assert $page) => $page
                ->component('restriction-notes-coop-criteria/restriction-notes-coop-criteria-create-page')
                ->has('organization', fn (Assert $org) => $org
                    ->where('id', $this->dummyOrganization->id)
                    ->etc()
                )
            );
        });
    });

    describe('store', function () {
        it('validates and stores coop criteria, restrictions, and notes', function () {
            $payload = [
                'coop_criteria' => ['for_coop' => 'Some criteria', 'ko_no_coop' => 'Some other criteria'],
                'restriction_thematic' => ['description' => 'Thematic restriction', 'type' => 'thematic'],
                'restriction_regional' => ['description' => 'Regional restriction', 'type' => 'regional'],
                'notes' => ['notes' => 'Some notes'],
            ];

            $response = actingAs(User::factory()->create())->post(route('restrictions-coop_criteria-notes.store', $this->dummyOrganization->id), $payload);

            $response->assertRedirect();
            $response->assertSessionHas('success', __('Einschränkungen und Kooperationskriterien hinzugefügt. Notizen aktualisiert.'));

            $this->assertDatabaseHas('coop_criteria', [
                'organization_id' => $this->dummyOrganization->id,
                'for_coop' => 'Some criteria',
                'ko_no_coop' => 'Some other criteria',
            ]);

            $this->assertDatabaseHas('restrictions', [
                'organization_id' => $this->dummyOrganization->id,
                'description' => 'Thematic restriction',
            ]);

            $this->assertDatabaseHas('restrictions', [
                'organization_id' => $this->dummyOrganization->id,
                'description' => 'Regional restriction',
            ]);

            $this->assertDatabaseHas('notes', [
                'organization_id' => $this->dummyOrganization->id,
                'notes' => 'Some notes',
            ]);
        });

        it('handles missing optional fields gracefully', function () {
            $payload = []; // No data provided

            $response = actingAs(User::factory()->create())->post(route('restrictions-coop_criteria-notes.store', $this->dummyOrganization->id), $payload);

            $response->assertRedirect();
            $response->assertSessionHas('success', __(''));

            $this->assertDatabaseMissing('coop_criteria', ['organization_id' => $this->dummyOrganization->id]);
            $this->assertDatabaseMissing('restrictions', ['organization_id' => $this->dummyOrganization->id]);
            $this->assertDatabaseMissing('notes', ['organization_id' => $this->dummyOrganization->id]);
        });
    });
});
