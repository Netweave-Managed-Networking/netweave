<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Support\Str;

class OrganizationFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Organization::class;

    /**
     * Define the model's default state.
     *
     * @return array<string", mixed>
     */
    public function definition(): array
    {
        $mockOrGenerated = $this->getUniqueMockOrGenerateNew('name');

        return fake()->boolean(chanceOfGettingTrue: 10)
            ? ['name' => $mockOrGenerated['name']]
            : $this->generateRandomEntryWithName(name: $mockOrGenerated['name']);
    }

    protected function generateRandomModel(): array
    {
        $name = fake()->unique()->company;

        return
            [
                'name' => $name,
                'email' => $this->getRandomEmail(name: $name),
                'phone' => $this->getRandomPhone(),
                'postcode_city' => $this->getRandomPostcodeCity(),
                'street_hnr' => $this->getRandomStreet(),
            ];
    }

    private function generateRandomEntryWithName($name): array
    {
        return
            [
                ...$this->generateRandomModel(),
                'name' => $name,
                'email' => $this->getRandomEmail(name: $name),
            ];
    }

    private function getRandomEmail($name): ?string
    {
        return fake()->boolean(chanceOfGettingTrue: 5) ? null : Str::slug(Str::take($name, fake()->numberBetween(8, 20))).'@'.Str::random(3).'.de';
    }

    private function getRandomPhone(): ?string
    {
        return fake()->boolean(chanceOfGettingTrue: 15) ? null : fake()->phoneNumber();
    }

    private function getRandomPostcodeCity(): ?string
    {
        $postcode = fake()->boolean(chanceOfGettingTrue: 15) ? null : fake()->numberBetween(31111, 59999);
        $city = fake()->boolean(chanceOfGettingTrue: 15) ? null : fake()->city();

        return $postcode ? ($city ? "$postcode $city" : $postcode) : ($city ?? null);
    }

    private function getRandomStreet(): ?string
    {
        return fake()->boolean(chanceOfGettingTrue: 20) ? null : fake()->streetName.' '.fake()->numberBetween(1, 1000).(fake()->boolean(chanceOfGettingTrue: 20) ? fake()->randomLetter() : '');
    }

    protected function getMockEntries(): array
    {
        include __DIR__.'/../mocks/mockOrganizations.php';

        return $mockOrganizations;
    }
}
