<?php

namespace App\Http\Controllers;

use App\Models\OrganizationCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationCategoryController extends Controller
{
    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:64|unique:organization_categories',
            'description' => 'nullable|string|max:256|unique:organization_categories',
        ]);

        $organizations_category = OrganizationCategory::create($validated);

        return response()->json($organizations_category, 201);
    }
}
