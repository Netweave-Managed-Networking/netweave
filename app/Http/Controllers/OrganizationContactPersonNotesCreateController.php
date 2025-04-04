<?php

namespace App\Http\Controllers;

use App\Models\ContactPerson;
use App\Models\Notes;
use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Rules\MaxBytes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * creates a new organization along a new contact person and a new note
 * associates the organization with categories
 */
class OrganizationContactPersonNotesCreateController extends Controller
{
    public function create(Request $request): Response
    {
        $organization_categories = OrganizationCategory::all();

        return Inertia::render('Organizations/OrganizationsCreatePage')->with('organizationCategories', $organization_categories);
    }

    public function store(Request $request): RedirectResponse
    {

        $isContactPersonFilled = collect($request->input('organization_first_contact_person', []))->filter()->isNotEmpty();
        $validationRulesTotal = $this->prepareValidationRules($isContactPersonFilled);
        $validated = $request->validate($validationRulesTotal);

        $organization = null;
        DB::transaction(function () use ($validated, $isContactPersonFilled, &$organization) {
            $organization = Organization::create($validated);
            $organization->organizationCategories()->sync($validated['organization_categories']);
            Notes::create(['notes' => $validated['notes'] ?? null, 'organization_id' => $organization->id]);

            if ($isContactPersonFilled) {
                $contactPersonValidated = $validated['organization_first_contact_person'] ?? [];
                ContactPerson::create(array_merge($contactPersonValidated, ['organization_id' => $organization->id]));
            }
        });

        return back()
            ->with('modelId', $organization->id) // needed in RedirectTo middleware
            ->with('success', "Neue Organisation '$organization->name' erfolgreich erstellt.");
    }

    private function prepareValidationRules(bool $isContactPersonFilled): array
    {
        // create validation rules
        $validationRulesOrganization = $this->getOrganizationValidationRules();
        $validationRulesCategories = $this->getCategoriesValidationRules();
        $validationRulesNotes = $this->getNotesValidationRules();
        $validationRulesContactPerson = $this->getContactPersonValidationRules();
        $validationRulesTotal = array_merge($validationRulesOrganization, $validationRulesCategories, $validationRulesNotes);

        // add contact person validation rules if filled
        if ($isContactPersonFilled) {
            $validationRulesTotal = array_merge($validationRulesTotal, $validationRulesContactPerson);
        }

        return $validationRulesTotal;
    }

    private function getOrganizationValidationRules(): array
    {
        return [
            'name' => ['required', 'string', new MaxBytes(127), 'unique:organizations'],
            'email' => ['nullable', 'email', new MaxBytes(63), 'unique:organizations'],
            'phone' => ['nullable', 'string', new MaxBytes(63), 'unique:organizations'],
            'postcode_city' => ['nullable', 'string', new MaxBytes(63)],
            'street_hnr' => ['nullable', 'string', new MaxBytes(127)],

            'organization_first_contact_person' => ['nullable'],

        ];
    }

    private function getCategoriesValidationRules(): array
    {
        return [
            'organization_categories' => ['required', 'array'],
            'organization_categories.*' => ['exists:organization_categories,id'],
        ];
    }

    private function getNotesValidationRules(): array
    {
        return ['notes' => ['nullable', 'string', new MaxBytes(4095)]];
    }

    private function getContactPersonValidationRules(): array
    {
        return [
            'organization_first_contact_person.name' => ['required', 'string', new MaxBytes(127)],
            'organization_first_contact_person.email' => ['nullable', 'email', new MaxBytes(63)],
            'organization_first_contact_person.phone' => ['nullable', 'string', new MaxBytes(63)],
            'organization_first_contact_person.postcode_city' => ['nullable', 'string', new MaxBytes(63)],
            'organization_first_contact_person.street_hnr' => ['nullable', 'string', new MaxBytes(127)],
        ];
    }
}
