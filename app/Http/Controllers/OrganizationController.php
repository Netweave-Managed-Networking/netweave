<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function indexJson(Request $request): JsonResponse
    {
        $organizations = Organization::with('organizationCategories:id,name')->orderBy('created_at', 'desc')->get();

        return response()->json($organizations);
    }
}
