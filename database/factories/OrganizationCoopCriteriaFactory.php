<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\OrganizationCoopCriteria;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * creates resources or requirements (randomly) with old/new organizations, but without resource categories
 */
class OrganizationCoopCriteriaFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrganizationCoopCriteria::class;

    /**
     * Define the model's default state.
     *
     * @return array<string", mixed>
     */
    public function definition(): array
    {
        return $this->generateRandomModel();
    }

    private function generateRandomModel(): array
    {
        return fake()->boolean(90) ?
            [
                'for_coop' => fake()->boolean(80) ? fake()->paragraph() : null,
                'ko_no_coop' => fake()->boolean(80) ? fake()->paragraph() : null,
                'organization_id' => $this->getRandomOrganization()->id,
            ] : [
                'for_coop' => null,
                'ko_no_coop' => null,
                'organization_id' => $this->getRandomOrganization()->id,
            ];
    }

    private function getRandomOrganization(): Organization
    {
        return Organization::inRandomOrder()->first() ?? Organization::factory()->create();
    }
}
