<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Resource;
use App\Models\ResourceCategory;
use App\Rules\MaxBytes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ResourceController extends Controller
{
    public function create(Organization $organization): Response
    {
        $resource_categories = ResourceCategory::all();

        return Inertia::render('Resources/ResourceCreatePage')
            ->with('resourceCategories', $resource_categories)
            ->with('organization', $organization);
    }

    public function store(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'summary' => [
                'nullable',
                'string',
                new MaxBytes(255),
                Rule::unique('resources')->where(function ($query) use ($organization) {
                    return $query->where('organization_id', $organization->id);
                }),
            ],
            'description' => [
                'required',
                'string',
                new MaxBytes(8191),
                Rule::unique('resources')->where(function ($query) use ($organization) {
                    return $query->where('organization_id', $organization->id);
                }),
            ],
            'type' => ['required', Rule::in(['resource', 'requirement'])],
            'organization_id' => ['exists:organizations,id'],
            'resource_categories' => ['required', 'array'],
            'resource_categories.*' => ['exists:resource_categories,id'],
        ]);

        $resource = Resource::create($validated);
        $resource->resourceCategories()->sync($validated['resource_categories']);
        $organization->resources()->save($resource);

        $shortenedSummary = $resource->summary ? $this->shorten($resource->summary) : $this->shorten($resource->description);
        $resourceOrRequirement = $resource->type === 'resource' ? 'Neue Ressource' : 'Neuen Bedarf';

        return back()
            ->with('modelId', $resource->id) // needed in RedirectTo middleware
            ->with('success', "$resourceOrRequirement '$shortenedSummary' erfolgreich erstellt.");
    }

    private function shorten(string $text): string
    {
        $maxLength = 40;
        $abbr = '...';

        return strlen($text) < $maxLength + strlen($abbr) ? $text : substr($text, 0, $maxLength).$abbr;
    }
}
