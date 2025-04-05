<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Restriction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Restriction>
 */
class RestrictionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Restriction::class;

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
        /** @var 'regional' | 'thematic' */
        $type = fake()->boolean(50) ? 'regional' : 'thematic';

        return [
            'type' => $type,
            'description' => fake()->text(200),
            'organization_id' => $this->getRandomOrganization()->id,
        ];
    }

    private function getRandomOrganization(): Organization
    {
        return Organization::inRandomOrder()->first() ?? Organization::factory()->create();
    }
}
