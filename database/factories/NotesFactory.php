<?php

namespace Database\Factories;

use App\Models\Notes;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * creates resources or requirements (randomly) with old/new organizations, but without resource categories
 */
class NotesFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Notes::class;

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
        return
            [
                'notes' => fake()->paragraph(),
                'organization_id' => $this->getRandomOrganization()->id,
            ];
    }

    private function getRandomOrganization(): Organization
    {
        return Organization::inRandomOrder()->first() ?? Organization::factory()->create();
    }
}
