<?php

namespace Database\Factories;

use App\Models\StakeholderCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StakeholderCategory>
 */
class StakeholderCategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StakeholderCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->getRandomName(),
            'description' => fake()->realTextBetween(10, 250),
        ];
    }

    private function getRandomName(): string
    {
        $randomKey = array_rand($this->names);
        $randomName = $this->names[$randomKey];
        unset($this->names[$randomKey]);

        return $randomName;
    }

    private $names = [
        1 => 'Behörde',
        2 => 'Stiftung',
        3 => 'Gemeinde/Stadt',
        4 => 'Naturschutzverein',
        5 => 'Jagdverein',
        6 => 'Unterhaltungsverband',
        7 => 'Fischereiverein',
        8 => 'Landwirtschaftsorganisation',
        9 => 'Waldwirtschaftsverband',
        10 => 'Imkerverein',
        11 => 'Tourismusverband',
        12 => 'Universität Osnabrück',
        13 => 'Hochschule Osnabrück',
        14 => 'Unternehmen',
        15 => 'Heimatverein',
        16 => 'Umweltbildungszentrum',
        17 => 'Klimaschutzinitiative',
        18 => 'Wasserverband',
        19 => 'Abfallentsorgungsverband',
        20 => 'Energiegenossenschaft',
        21 => 'Bürgerinitiative',
        22 => 'Sportverein',
        23 => 'Kulturverein',
        24 => 'Jugendorganisation',
        25 => 'Sozialer Dienstleister',
        26 => 'Krankenversicherungsunternehmen',
        27 => 'Arbeitgeberverband',
        28 => 'Gewerkschaft',
        29 => 'Forschungsinstitut',
        30 => 'Technische Hochschule',
        31 => 'Karitative Organisation',
        32 => 'Bildungswerk',
        33 => 'Kulturstiftung',
        34 => 'Krankenhausverband',
        35 => 'Feuerwehrverein',
        36 => 'Katastrophenschutzorganisation',
        37 => 'Genossenschaftsbank',
        38 => 'Handwerkskammer',
        39 => 'Industrie- und Handelskammer',
        40 => 'Handelsverband',
        41 => 'Naturschutzstiftung',
        42 => 'Verkehrsunternehmen',
        43 => 'Sozialverband',
        44 => 'Schützenverein',
        45 => 'Musikverein',
        46 => 'Wissenschaftlicher Beirat',
        47 => 'Tierschutzverein',
        48 => 'Kunstverein',
        49 => 'Wassersportclub',
        50 => 'Seniorenvereinigung',
    ];
}
