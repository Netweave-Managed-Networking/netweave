<?php

namespace Database\Factories;

use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegistrationCode>
 */
class RegistrationCodeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = RegistrationCode::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->bothify('??###?'), // Random 6-character code like 'AB123C'
            'editor_id' => $this->faker->boolean(50) ? User::factory() : null, // 50% chance of being null or a user
            'admin_id' => User::factory(), // Always assigns a valid user as admin
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
