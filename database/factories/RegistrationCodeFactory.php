<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegistrationCode>
 *
 * Needs at least one admin to exist
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
            'code' => Str::lower(Str::random(length: 8)), // Random 8-character code like 'ab123cde'
            'editor_id' => User::factory(), // create a new User as editor
            'admin_id' => User::where('role', UserRole::ADMIN)->inRandomOrder()->first()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
