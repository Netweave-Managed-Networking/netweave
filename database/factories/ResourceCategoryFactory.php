<?php

namespace Database\Factories;

use App\Models\ResourceCategory;

/**
 * @extends PreferMocksFactory<ResourceCategory>
 */
class ResourceCategoryFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ResourceCategory::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return $this->getUniqueMockOrGenerateNew(uniqueField: 'title');
    }

    protected function generateRandomModel(): array
    {
        return [
            'title' => $this->faker->unique()->sentence(nbWords: 3),
            'definition' => $this->faker->optional()->paragraph(),
        ];
    }

    protected function getMockEntries(): array
    {
        include __DIR__.'/../mocks/mockResourceCategories.php';

        return $mockResourceCategories;
    }
}
