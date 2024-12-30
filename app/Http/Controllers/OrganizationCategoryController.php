<?php

namespace App\Http\Controllers;

use App\Models\OrganizationCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationCategoryController extends Controller
{
    public function getJson(OrganizationCategory $category)
    {
        $category->organizations = $category->organizations()->orderBy('name')->select(['id', 'name'])->get();

        return response()->json($category, 200);
    }

    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:64|unique:organization_categories',
            'description' => 'nullable|string|max:256|unique:organization_categories',
        ]);

        $organizations_category = OrganizationCategory::create($validated);

        return response()->json($organizations_category, 201);
    }

    public function edit(Request $request): Response
    {
        $organization_categories = OrganizationCategory::orderBy('name')->get();

        return Inertia::render('OrganizationCategories/OrganizationCategoriesEdit')->with('organizationCategories', $organization_categories);
    }

    public function destroy(OrganizationCategory $category): RedirectResponse
    {
        $name = $category->name;
        $category->delete();

        return redirect()->route('organization-categories.edit')->with('success', "Organisationskategorie '$name' gelöscht.");
    }
}
