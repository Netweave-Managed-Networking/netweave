<?php

namespace App\Http\Controllers;

use App\Models\StakeholderCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StakeholderCategoryController extends Controller
{
    public function storeJson(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:64|unique:stakeholder_categories',
            'description' => 'nullable|string|max:256|unique:stakeholder_categories',
        ]);

        $stakeholder_category = StakeholderCategory::create($validated);

        return response()->json($stakeholder_category, 201);
    }
}
