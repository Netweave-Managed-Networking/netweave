<?php

namespace Database\Factories;

use App\Models\StakeholderOrganization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StakeholderOrganization>
 */
class StakeholderOrganizationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StakeholderOrganization::class;

    /**
     * Define the model's default state.
     *
     * @return array<string", mixed>
     */
    public function definition(): array
    {
        $name = $this->getRandomName();

        return fake()->boolean(10) ? ['name' => $name] : [
            'name' => $name,
            'email' => $this->getRandomEmail($name),
            'phone' => $this->getRandomPhone(),
            'postcode_city' => $this->getRandomPostcodeCity(),
            'street_hnr' => $this->getRandomStreet(),
        ];
    }

    private function getRandomName(): string
    {
        $randomKey = array_rand($this->names);
        $randomName = $this->names[$randomKey];
        unset($this->names[$randomKey]);

        return $randomName;
    }

    private function getRandomEmail($name): ?string
    {
        return fake()->boolean(5) ? null : Str::slug(Str::take($name, fake()->numberBetween(8, 20))).'@'.Str::random(3).'.de';
    }

    private function getRandomPhone(): ?string
    {
        return fake()->boolean(15) ? null : fake()->phoneNumber();
    }

    private function getRandomPostcodeCity(): ?string
    {
        $postcode = fake()->boolean(15) ? null : fake()->numberBetween(31111, 59999);
        $city = fake()->boolean(15) ? null : fake()->city();

        return $postcode ? ($city ? "$postcode $city" : $postcode) : ($city ?? null);
    }

    private function getRandomStreet(): ?string
    {
        return fake()->boolean(20) ? null : fake()->streetName.' '.fake()->numberBetween(1, 1000).(fake()->boolean(20) ? fake()->randomLetter() : '');
    }

    private $names = [
        'Zukunftswerkstatt',
        'NaturWert e.V.',
        'Lebensraumgestalter',
        'GenerationGrün',
        'Wandelwerk in Aktion',
        'StadtLeben e.V.',
        'KlimaKultur für morgen',
        'GemeinwohlPartner',
        'Erbe der Zukunft',
        'Impulse für Wandel',
        'NaturVerbund Nord',
        'Initiative NachhaltigJetzt',
        'SchöpfungsHüter',
        'BrückenBauer für Gemeinwohl',
        'Wandelkraft in Bewegung',
        'Raum für Ressourcen',
        'Land und Leute e.V.',
        'LebendigeZukunft',
        'InnovationsForum Süd',
        'PerspektivenBündnis',
        'Wurzeln und Wege',
        'FairNetzwerk e.V.',
        'Zukunft im Dialog',
        'LebensWandel für Alle',
        'ProjektVerbund West',
        'RegionalGestalter',
        'VisionenVerein',
        'HeimatImpulse für die Zukunft',
        'NetzWerkstatt',
        'Dialogwerk Region',
        'GrünWert e.V.',
        'ErneuerungsForum',
        'GemeinsamGestalten',
        'LebensWelt für morgen',
        'Wegweiser der Natur',
        'KompetenzNetzwerk',
        'Partner für Wandel',
        'ZukunftsSchmiede',
        'LandSchafftZukunft',
        'Weitblick e.V.',
        'GemeinWertWerk',
        'NachbarschaftsNetzwerk',
        'NaturWandel Initiative',
        'ZukunftsWege in der Region',
        'RessourcenZukunft',
        'DialogInitiative West',
        'GemeinWandel e.V.',
        'LebensRaumSchaffer',
        'WissenWert Netzwerk',
        'Wege und Werte e.V.',
        'StadtGestalten für Alle',
        'Impulse für das Land',
        'WandelInitiative',
        'UmWeltPartner Ost',
        'HeimatRaum in Bewegung',
        'ZukunftsGestalter',
        'GemeinWert für die Region',
        'PerspektivenWerk Nord',
        'StadtWandel Ideen',
        'BrückenSchaffer e.V.',
        'Horizonte für alle',
        'Wandel und Wege',
        'Wegweiser Zukunft',
        'Partner für Land und Leute',
        'ZukunftsPioniere im Dialog',
        'RaumGestalter für Wandel',
        'ImpulsSchmiede in Bewegung',
        'LebensWerk für die Region',
        'NaturSchaffer e.V.',
        'Gemeinschaftswerk',
        'InnovationsForum Ost',
        'WandelWerk für heute',
        'GrünSchaffen',
        'ErneuerbareImpulse',
        'Perspektiven für Wandel',
        'LebensRaum in Aktion',
        'ZukunftsPfad',
        'Gemeinschaftswerte e.V.',
        'DenkRaum für Wandel',
        'WeitBlickPartner',
        'Wandel und Aufbruch',
        'RessourcenPartner Süd',
        'Heimat und Natur',
        'DialogWerk für Stadt und Land',
        'NaturVerbund für Zukunft',
        'ZukunftsVerantwortung e.V.',
        'WissenWandel West',
        'ImpulsZukunft',
        'KlimaKultur Nord',
        'Wegweiser für Generationen',
        'WandelWerk im Dialog',
        'Zukunftsgestalter für alle',
        'LebensWerte in Bewegung',
        'ImpulsRaum für Wandel',
        'GemeinWohlWerk',
        'Land und Leben e.V.',
        'Perspektiven in Bewegung',
        'RessourcenRaum in der Region',
        'Stadt und Natur',
        'Horizonte in Aktion',
        'NetzWerkPartner',
        'Wandelstifter e.V.',
        'ZukunftsErbe Nord',
        'Erneuerbare Visionen',
        'GemeinNutzWerk',
        'BrückenForum für Wandel',
        'UmWeltPioniere',
        'IdeenWerkstatt',
        'LandGestalter',
        'Wegbereiter e.V.',
        'ZukunftsVerbund',
        'Lebenspfade für alle',
        'UmWeltErbe',
        'ZukunftsRaum in Aktion',
        'VisionenWerkstatt für Wandel',
        'ZukunftsImpulse für Stadt und Land',
        'StadtVerantwortung',
        'NaturPartner e.V.',
        'RessourcenGestalter',
        'BürgerSchmiede im Wandel',
        'UmweltInitiative',
        'Perspektiven für die Region',
        'LebensWege e.V.',
        'ZukunftsRäume',
        'Nachhaltigkeit im Dialog',
        'Wandelpfade für Generationen',
        'Wurzelwerk e.V.',
        'Wegbegleiter für Zukunft',
        'Horizonte für Wandel',
        'WissenSchaffer e.V.',
        'GrünGestalten',
        'LebensRaum im Wandel',
        'ZukunftsWege für alle',
        'PerspektivenSchaffer',
        'WandelRaum für Stadt und Land',
        'IdeenErnte e.V.',
        'GemeinschaftsImpulse',
        'Klimaforum für die Zukunft',
        'WegeSchaffer e.V.',
        'RaumGestalter in Aktion',
        'Ideen für Land und Leute',
        'ZukunftsWerk für Nachhaltigkeit',
        'Wege für Wandel',
        'ImpulsBündnis für Generationen',
    ];
}
