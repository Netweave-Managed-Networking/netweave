<?php

namespace App\Http\Controllers;

use App\Models\ResourceCategory;
use App\Rules\MaxBytes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceCategoryController extends Controller
{
    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', new MaxBytes(63), 'unique:resource_categories'],
            'definition' => ['nullable', 'string', new MaxBytes(1023), 'unique:resource_categories'],
        ]);

        $resource_category = ResourceCategory::create($validated);

        return response()->json($resource_category, 201);
    }
}
