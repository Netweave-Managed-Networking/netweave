<?php

namespace Database\Seeders;

use App\Models\Resource;
use App\Models\ResourceCategory;
use Illuminate\Database\Seeder;

/**
 * * seeds resources to the database and adds matching resource categories to it
 * * creates matching resource categories if they do not exist
 * * works best if the resources categories are already seeded by the ResourceCategorySeeder
 */
class ResourceSeeder extends Seeder
{
    private $count;

    public function __construct($count = 50)
    {
        $this->count = $count;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run($count = 50)
    {
        $resources = Resource::factory()->count($count)->create();
        foreach ($resources as $resource) {
            /** @var array|null */ $mockResource = $this->getMockResourceByDescription($resource->description);
            $resourceCategories = $mockResource
                ? $this->getMockResourceCategoriesByTitle($mockResource['resource_categories'])
                : ResourceCategory::inRandomOrder()->limit(random_int(1, 3))->get()->pluck('id')->toArray();
            $resource->resourceCategories()->attach($resourceCategories);
        }
    }

    private function getMockResourceByDescription(string $description): ?array
    {
        include __DIR__.'/../factories/mockResourcesRequirements.php';

        $array = array_filter(array_merge($mockResources, $mockRequirements), fn ($entry) => $entry['description'] === $description);

        return count($array) === 0 ? null : array_values($array)[0];
    }

    private function getMockResourceCategoriesByTitle(array $titles): array
    {
        $categories = ResourceCategory::whereIn('title', $titles)->get()->toArray();
        foreach ($titles as $title) {
            if (! in_array($title, array_column($categories, 'title'))) {
                $category = ResourceCategory::create(['title' => $title]);
                $categories[] = $category;
            }
        }

        return array_column($categories, 'id');
    }
}
