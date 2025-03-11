<?php

namespace App\Http\Controllers;

use App\Models\ResourceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceCategoryController extends Controller
{
    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:63|unique:resource_categories',
            'definition' => 'nullable|string|max:1023|unique:resource_categories',
        ]);

        $resource_category = ResourceCategory::create($validated);

        return response()->json($resource_category, 201);
    }
}
