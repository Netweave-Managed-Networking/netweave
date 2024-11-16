<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function indexJson(Request $request): JsonResponse
    {
        $organizations = Organization::with('organizationCategories:id,name')->orderBy('created_at', 'desc')->get();

        return response()->json($organizations);
    }

    public function create(Request $request): Response
    {
        $organization_categories = OrganizationCategory::select(['id', 'name'])->get();

        return Inertia::render('Organizations/OrganizationsCreate')->with('organizationCategories', $organization_categories);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:128|unique:organizations',
            'email' => 'nullable|string|max:64|unique:organizations',
            'phone' => 'nullable|string|max:64|unique:organizations',
            'postcode_city' => 'nullable|string|max:64',
            'street_hnr' => 'nullable|string|max:128',
            'organization_categories' => 'required|array',
            'organization_categories.*' => 'exists:organization_categories,id',
        ]);

        $organization = Organization::create($validated);
        $organization->organizationCategories()->sync($validated['organization_categories']);

        return redirect()->route('dashboard')->with('success', "Neue Organisation '$organization->name' erfolgreich erstellt.");
    }
}
