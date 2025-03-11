<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Resource;

/**
 * creates resources or requirements (randomly) with old/new organizations, but without resource categories
 */
class ResourceFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Resource::class;

    /**
     * Define the model's default state.
     *
     * @return array<string", mixed>
     */
    public function definition(): array
    {
        $mockEntry = $this->getUniqueMockOrGenerateNew('description');
        unset($mockEntry['resource_categories']);

        return $mockEntry;
    }

    protected function generateRandomModel(): array
    {
        return
            [
                'summary' => fake()->sentence(),
                'description' => fake()->paragraph(),
                'organization_id' => $this->getRandomOrganization()->id,
                'type' => fake()->randomElement(['resource', 'requirement']),
            ];
    }

    protected function getMockEntries(): array
    {
        include __DIR__.'/../mocks/mockResourcesRequirements.php';

        return array_map(function ($entry) {
            return ['description' => $entry['description'], 'type' => $entry['type'], 'organization_id' => $this->getRandomOrganization()->id, 'summary' => null];
        }, array_merge(
            array_map(fn ($mockResource): array => [...$mockResource, 'type' => 'resource'], $mockResources),
            array_map(fn ($mockRequirement): array => [...$mockRequirement, 'type' => 'requirement'], $mockRequirements)
        ));
    }

    private function getRandomOrganization(): Organization
    {
        return Organization::inRandomOrder()->first() ?? Organization::factory()->create();
    }
}
