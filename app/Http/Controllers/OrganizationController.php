<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationCategory;
use App\Models\OrganizationNotes;
use App\Rules\MaxBytes;
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
        $organization_categories = OrganizationCategory::all();

        return Inertia::render('Organizations/OrganizationsCreatePage')->with('organizationCategories', $organization_categories);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', new MaxBytes(127), 'unique:organizations'],
            'email' => ['nullable', 'string', new MaxBytes(63), 'unique:organizations'],
            'phone' => ['nullable', 'string', new MaxBytes(63), 'unique:organizations'],
            'postcode_city' => ['nullable', 'string', new MaxBytes(63)],
            'street_hnr' => ['nullable', 'string', new MaxBytes(127)],
            'organization_categories' => ['required', 'array'],
            'organization_categories.*' => ['exists:organization_categories,id'],

            'notes' => ['nullable', 'string', new MaxBytes(4095)],
        ]);

        $organization = Organization::create($validated);
        $organization->organizationCategories()->sync($validated['organization_categories']);
        OrganizationNotes::create(['notes' => $validated['notes'] ?? null, 'organization_id' => $organization->id]);

        return back()
            ->with('modelId', $organization->id) // needed in RedirectTo middleware
            ->with('success', "Neue Organisation '$organization->name' erfolgreich erstellt.");
    }
}
