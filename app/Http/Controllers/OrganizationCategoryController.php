<?php

namespace App\Http\Controllers;

use App\Models\OrganizationCategory;
use App\Rules\MaxBytes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationCategoryController extends Controller
{
    public function getJson(OrganizationCategory $category)
    {
        $category->load(['organizations' => function ($query) {
            $query->orderBy('name')->select(['id', 'name']);
        }]);

        return response()->json($category, 200);
    }

    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', new MaxBytes(63), 'unique:organization_categories'],
            'description' => ['nullable', 'string', new MaxBytes(255), 'unique:organization_categories'],
        ]);

        $organizations_category = OrganizationCategory::create($validated);

        return response()->json($organizations_category, 201);
    }

    public function edit(Request $request): Response
    {
        $organization_categories = OrganizationCategory::orderBy('name')->get();

        return Inertia::render('OrganizationCategories/OrganizationCategoriesEditPage')->with('organizationCategories', $organization_categories);
    }

    public function update(Request $request, OrganizationCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', new MaxBytes(63), Rule::unique('organization_categories')->ignore($category->id)],
            'description' => ['nullable', 'string', new MaxBytes(255),  Rule::unique('organization_categories')->ignore($category->id)],
        ]);

        $category->update($validated);

        return redirect()->route('organization-categories.edit')->with('success', "Organisationskategorie '$category->name' aktualisiert.");
    }

    public function destroy(OrganizationCategory $category): RedirectResponse
    {
        $name = $category->name;
        $category->delete();

        return redirect()->route('organization-categories.edit')->with('success', "Organisationskategorie '$name' gelöscht.");
    }
}
