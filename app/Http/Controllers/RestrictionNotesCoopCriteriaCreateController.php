<?php

namespace App\Http\Controllers;

use App\Models\CoopCriteria;
use App\Models\Notes;
use App\Models\Organization;
use App\Models\Restriction;
use App\Rules\MaxBytes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RestrictionNotesCoopCriteriaCreateController extends Controller
{
    public function create(Organization $organization): Response
    {
        $organization->load('notes');

        return Inertia::render('RestrictionNotesCoopCriteria/RestrictionNotesCoopCriteriaCreatePage')
            ->with('organization', $organization);
    }

    public function store(Request $request, Organization $organization): RedirectResponse
    {

        $validationRulesTotal = $this->prepareValidationRules();
        $validated = $request->validate($validationRulesTotal);

        return DB::transaction(function () use ($organization, $validated) {
            $orgNotesBeforeUpdate = $organization->notes?->notes;
            $coopCreated = (bool) $this->createCoopCriteria($organization, $validated);
            $resTheCreated = (bool) $this->createRestrictionThematic($organization, $validated);
            $resRegCreated = (bool) $this->createRestrictionRegional($organization, $validated);
            $notesExist = (bool) $this->updateNotes($organization, $validated);

            $resCreated = $resTheCreated || $resRegCreated;
            $notesUpdated = $notesExist && ($orgNotesBeforeUpdate !== $organization->notes()->first()->notes);
            $message = __(($resCreated ? 'Einschränkungen ' : '').($resCreated && $coopCreated ? 'und ' : '').($coopCreated ? 'Kooperationskriterien ' : '').($coopCreated || $resCreated ? 'hinzugefügt.' : '').($notesUpdated ? ' Notizen aktualisiert.' : ''));

            return back()->with('success', __($message));
        });

    }

    private function createCoopCriteria(Organization $organization, array $validated): ?CoopCriteria
    {
        $hasCoopCriteria = (bool) (isset($validated['coop_criteria']) && ($validated['coop_criteria']['for_coop'] || $validated['coop_criteria']['ko_no_coop']));

        return ! $hasCoopCriteria ? null : $organization->coopCriteria()->updateOrCreate(
            ['organization_id' => $organization->id],
            $validated['coop_criteria']
        );

    }

    private function createRestrictionThematic(Organization $organization, array $validated): ?Restriction
    {
        $hasRestrictionThematic = (bool) (isset($validated['restriction_thematic']) && $validated['restriction_thematic']['description']);

        return ! $hasRestrictionThematic ? null : $organization->restrictionThematic()->create(
            [...$validated['restriction_thematic'], 'organization_id' => $organization->id]
        );

    }

    private function createRestrictionRegional(Organization $organization, array $validated): ?Restriction
    {
        $hasRestrictionRegional = (bool) (isset($validated['restriction_regional']) && $validated['restriction_regional']['description']);

        return ! $hasRestrictionRegional ? null : $organization->restrictionRegional()->create(
            [...$validated['restriction_regional'], 'organization_id' => $organization->id]
        );

    }

    private function updateNotes(Organization $organization, array $validated): ?Notes
    {
        $hasNotes = (bool) (isset($validated['notes']) && $validated['notes']['notes']);

        return ! $hasNotes ? null : $organization->notes()->updateOrCreate(
            ['organization_id' => $organization->id],
            $validated['notes']
        );

    }

    private function prepareValidationRules(): array
    {
        // create validation rules
        $validationRulesCoopCriteria = $this->getCoopCriteriaValidationRules();
        $validationRulesRestrictionThematic = $this->getRestrictionThematicValidationRules();
        $validationRulesRestrictionRegional = $this->getRestrictionRegionalValidationRules();
        $validationRulesNotes = $this->getNotesValidationRules();
        $validationRulesTotal = array_merge($validationRulesCoopCriteria, $validationRulesRestrictionThematic, $validationRulesRestrictionRegional, $validationRulesNotes);

        return $validationRulesTotal;
    }

    private function getCoopCriteriaValidationRules(): array
    {
        return [
            'coop_criteria.for_coop' => ['nullable', 'string', new MaxBytes(4095)],
            'coop_criteria.ko_no_coop' => ['nullable', 'string', new MaxBytes(4095)],
        ];
    }

    private function getRestrictionThematicValidationRules(): array
    {
        return [
            'restriction_thematic.type' => ['nullable', 'string', Rule::in(['thematic'])],
            'restriction_thematic.description' => ['nullable', 'string', new MaxBytes(1023)],
        ];
    }

    private function getRestrictionRegionalValidationRules(): array
    {
        return [
            'restriction_regional.type' => ['nullable', 'string', Rule::in(['regional'])],
            'restriction_regional.description' => ['nullable', 'string', new MaxBytes(1023)],
        ];
    }

    private function getNotesValidationRules(): array
    {
        return ['notes.notes' => ['nullable', 'string', new MaxBytes(4095)]];
    }
}
