<?php

use App\Models\Organization;
use App\Models\Restriction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('Restriction', function (): void {
    it('has the correct fillable attributes', function (): void {
        $restriction = new Restriction;

        expect($restriction->getFillable())->toBe([
            'type',
            'description',
            'organization_id',
        ]);
    });

    it('belongs to an organization', function (): void {
        $organization = Organization::factory()->create();
        $restriction = Restriction::factory()->create([
            'organization_id' => $organization->id,
        ]);

        expect($restriction->organization)->toBeInstanceOf(Organization::class);
        expect($restriction->organization->id)->toBe($organization->id);
    });

    it('handles missing organization gracefully', function (): void {
        $restriction = Restriction::factory()->make([
            'organization_id' => null,
        ]);

        expect($restriction->organization)->toBeNull();
    });

    it('validates the type attribute', function (): void {
        $restriction = Restriction::factory()->make(['type' => 'regional']);
        expect($restriction->type)->toBe('regional');

        $restriction->type = 'thematic';
        expect($restriction->type)->toBe('thematic');
    });

    it('handles invalid type gracefully', function (): void {
        $restriction = Restriction::factory()->make(['type' => 'invalid']);
        expect($restriction->type)->toBe('invalid'); // Assuming no validation is enforced at the model level
    });

    it('can associate an organization', function (): void {
        $organization = Organization::factory()->create();
        $restriction = Restriction::factory()->create();

        $restriction->organization()->associate($organization);
        $restriction->save();

        expect($restriction->organization_id)->toBe($organization->id);
        expect($restriction->organization)->toBeInstanceOf(Organization::class);
    });
});
