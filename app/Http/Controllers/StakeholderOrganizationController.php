<?php

namespace App\Http\Controllers;

use App\Models\StakeholderCategory;
use App\Models\StakeholderOrganization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StakeholderOrganizationController extends Controller
{
    public function create(Request $request): Response
    {
        $stakeholder_categories = StakeholderCategory::select(['id', 'name'])->get();

        return Inertia::render('StakeholderOrganizations/StakeholderOrganizationsCreate')->with('stakeholderCategories', $stakeholder_categories);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:128|unique:stakeholder_organizations',
            'email' => 'nullable|string|max:64|unique:stakeholder_organizations',
            'phone' => 'nullable|string|max:64|unique:stakeholder_organizations',
            'postcode_city' => 'nullable|string|max:64',
            'street_hnr' => 'nullable|string|max:128',
            'stakeholder_categories' => 'required|array',
            'stakeholder_categories.*' => 'exists:stakeholder_categories,id',
        ]);

        $stakeholder_organization = StakeholderOrganization::create($validated);
        $stakeholder_organization->stakeholderCategories()->sync($validated['stakeholder_categories']);

        return redirect()->route('dashboard')->with('success', "Neuer Stakeholder '$stakeholder_organization->name' erfolgreich erstellt.");
    }
}
