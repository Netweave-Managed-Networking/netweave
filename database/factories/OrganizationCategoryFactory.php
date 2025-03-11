<?php

namespace Database\Factories;

use App\Models\OrganizationCategory;

class OrganizationCategoryFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrganizationCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return $this->getUniqueMockOrGenerateNew(uniqueField: 'name');
    }

    protected function generateRandomModel(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'description' => fake()->optional()->realTextBetween(minNbChars: 10, maxNbChars: 250),
        ];
    }

    protected function getMockEntries(): array
    {
        include __DIR__.'/../mocks/mockOrganizationCategories.php';

        return $mockOrganizationCategories;
    }
}
