<?php

namespace Database\Factories;

use App\Models\ContactPerson;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactPerson>
 */
class ContactPersonFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ContactPerson::class;

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
        return [
            'name' => fake()->name(),
            'email' => fake()->email(),
            'phone' => fake()->phoneNumber(),
            'postcode_city' => fake()->numberBetween(11111, 99999).' '.fake()->city(),
            'street_hnr' => (fake()->streetName().' '.fake()->numberBetween(1, 120)).(fake()->boolean(20) ? fake()->randomLetter() : ''),
            'organization_id' => $this->getRandomOrganization()->id,
        ];
    }

    private function getRandomOrganization(): Organization
    {
        return Organization::inRandomOrder()->first() ?? Organization::factory()->create();
    }
}
