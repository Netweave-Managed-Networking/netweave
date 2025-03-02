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
        return [
            1 => ['name' => 'Zukunftswerkstatt'],
            2 => ['name' => 'NaturWert e.V.'],
            3 => ['name' => 'Lebensraumgestalter'],
            4 => ['name' => 'GenerationGrün'],
            5 => ['name' => 'Wandelwerk in Aktion'],
            6 => ['name' => 'StadtLeben e.V.'],
            7 => ['name' => 'KlimaKultur für morgen'],
            8 => ['name' => 'GemeinwohlPartner'],
            9 => ['name' => 'Erbe der Zukunft'],
            10 => ['name' => 'Impulse für Wandel'],
            11 => ['name' => 'NaturVerbund Nord'],
            12 => ['name' => 'Initiative NachhaltigJetzt'],
            13 => ['name' => 'SchöpfungsHüter'],
            14 => ['name' => 'BrückenBauer für Gemeinwohl'],
            15 => ['name' => 'Wandelkraft in Bewegung'],
            16 => ['name' => 'Raum für Ressourcen'],
            17 => ['name' => 'Land und Leute e.V.'],
            18 => ['name' => 'LebendigeZukunft'],
            19 => ['name' => 'InnovationsForum Süd'],
            20 => ['name' => 'PerspektivenBündnis'],
            21 => ['name' => 'Wurzeln und Wege'],
            22 => ['name' => 'FairNetzwerk e.V.'],
            23 => ['name' => 'Zukunft im Dialog'],
            24 => ['name' => 'LebensWandel für Alle'],
            25 => ['name' => 'ProjektVerbund West'],
            26 => ['name' => 'RegionalGestalter'],
            27 => ['name' => 'VisionenVerein'],
            28 => ['name' => 'HeimatImpulse für die Zukunft'],
            29 => ['name' => 'NetzWerkstatt'],
            30 => ['name' => 'Dialogwerk Region'],
            31 => ['name' => 'GrünWert e.V.'],
            32 => ['name' => 'ErneuerungsForum'],
            33 => ['name' => 'GemeinsamGestalten'],
            34 => ['name' => 'LebensWelt für morgen'],
            35 => ['name' => 'Wegweiser der Natur'],
            36 => ['name' => 'KompetenzNetzwerk'],
            37 => ['name' => 'Partner für Wandel'],
            38 => ['name' => 'ZukunftsSchmiede'],
            39 => ['name' => 'LandSchafftZukunft'],
            40 => ['name' => 'Weitblick e.V.'],
            41 => ['name' => 'GemeinWertWerk'],
            42 => ['name' => 'NachbarschaftsNetzwerk'],
            43 => ['name' => 'NaturWandel Initiative'],
            44 => ['name' => 'ZukunftsWege in der Region'],
            45 => ['name' => 'RessourcenZukunft'],
            46 => ['name' => 'DialogInitiative West'],
            47 => ['name' => 'GemeinWandel e.V.'],
            48 => ['name' => 'LebensRaumSchaffer'],
            49 => ['name' => 'WissenWert Netzwerk'],
            50 => ['name' => 'Wege und Werte e.V.'],
            51 => ['name' => 'StadtGestalten für Alle'],
            52 => ['name' => 'Impulse für das Land'],
            53 => ['name' => 'WandelInitiative'],
            54 => ['name' => 'UmWeltPartner Ost'],
            55 => ['name' => 'HeimatRaum in Bewegung'],
            56 => ['name' => 'ZukunftsGestalter'],
            57 => ['name' => 'GemeinWert für die Region'],
            58 => ['name' => 'PerspektivenWerk Nord'],
            59 => ['name' => 'StadtWandel Ideen'],
            60 => ['name' => 'BrückenSchaffer e.V.'],
            61 => ['name' => 'Horizonte für alle'],
            62 => ['name' => 'Wandel und Wege'],
            63 => ['name' => 'Wegweiser Zukunft'],
            64 => ['name' => 'Partner für Land und Leute'],
            65 => ['name' => 'ZukunftsPioniere im Dialog'],
            66 => ['name' => 'RaumGestalter für Wandel'],
            67 => ['name' => 'ImpulsSchmiede in Bewegung'],
            68 => ['name' => 'LebensWerk für die Region'],
            69 => ['name' => 'NaturSchaffer e.V.'],
            70 => ['name' => 'Gemeinschaftswerk'],
            71 => ['name' => 'InnovationsForum Ost'],
            72 => ['name' => 'WandelWerk für heute'],
            73 => ['name' => 'GrünSchaffen'],
            74 => ['name' => 'ErneuerbareImpulse'],
            75 => ['name' => 'Perspektiven für Wandel'],
            76 => ['name' => 'LebensRaum in Aktion'],
            77 => ['name' => 'ZukunftsPfad'],
            78 => ['name' => 'Gemeinschaftswerte e.V.'],
            79 => ['name' => 'DenkRaum für Wandel'],
            80 => ['name' => 'WeitBlickPartner'],
            81 => ['name' => 'Wandel und Aufbruch'],
            82 => ['name' => 'RessourcenPartner Süd'],
            83 => ['name' => 'Heimat und Natur'],
            84 => ['name' => 'DialogWerk für Stadt und Land'],
            85 => ['name' => 'NaturVerbund für Zukunft'],
            86 => ['name' => 'ZukunftsVerantwortung e.V.'],
            87 => ['name' => 'WissenWandel West'],
            88 => ['name' => 'ImpulsZukunft'],
            89 => ['name' => 'KlimaKultur Nord'],
            90 => ['name' => 'Wegweiser für Generationen'],
            91 => ['name' => 'WandelWerk im Dialog'],
            92 => ['name' => 'Zukunftsgestalter für alle'],
            93 => ['name' => 'LebensWerte in Bewegung'],
            94 => ['name' => 'ImpulsRaum für Wandel'],
            95 => ['name' => 'GemeinWohlWerk'],
            96 => ['name' => 'Land und Leben e.V.'],
            97 => ['name' => 'Perspektiven in Bewegung'],
            98 => ['name' => 'RessourcenRaum in der Region'],
            99 => ['name' => 'Stadt und Natur'],
            100 => ['name' => 'Horizonte in Aktion'],
            101 => ['name' => 'NetzWerkPartner'],
            102 => ['name' => 'Wandelstifter e.V.'],
            103 => ['name' => 'ZukunftsErbe Nord'],
            104 => ['name' => 'Erneuerbare Visionen'],
            105 => ['name' => 'GemeinNutzWerk'],
            106 => ['name' => 'BrückenForum für Wandel'],
            107 => ['name' => 'UmWeltPioniere'],
            108 => ['name' => 'IdeenWerkstatt'],
            109 => ['name' => 'LandGestalter'],
            110 => ['name' => 'Wegbereiter e.V.'],
            111 => ['name' => 'ZukunftsVerbund'],
            112 => ['name' => 'Lebenspfade für alle'],
            113 => ['name' => 'UmWeltErbe'],
            114 => ['name' => 'ZukunftsRaum in Aktion'],
            115 => ['name' => 'VisionenWerkstatt für Wandel'],
            116 => ['name' => 'ZukunftsImpulse für Stadt und Land'],
            117 => ['name' => 'StadtVerantwortung'],
            118 => ['name' => 'NaturPartner e.V.'],
            119 => ['name' => 'RessourcenGestalter'],
            120 => ['name' => 'BürgerSchmiede im Wandel'],
            121 => ['name' => 'UmweltInitiative'],
            122 => ['name' => 'Perspektiven für die Region'],
            123 => ['name' => 'LebensWege e.V.'],
            124 => ['name' => 'ZukunftsRäume'],
            125 => ['name' => 'Nachhaltigkeit im Dialog'],
            126 => ['name' => 'Wandelpfade für Generationen'],
            127 => ['name' => 'Wurzelwerk e.V.'],
            128 => ['name' => 'Wegbegleiter für Zukunft'],
            129 => ['name' => 'Horizonte für Wandel'],
            130 => ['name' => 'WissenSchaffer e.V.'],
            131 => ['name' => 'GrünGestalten'],
            132 => ['name' => 'LebensRaum im Wandel'],
            133 => ['name' => 'ZukunftsWege für alle'],
            134 => ['name' => 'PerspektivenSchaffer'],
            135 => ['name' => 'WandelRaum für Stadt und Land'],
            136 => ['name' => 'IdeenErnte e.V.'],
            137 => ['name' => 'GemeinschaftsImpulse'],
            138 => ['name' => 'Klimaforum für die Zukunft'],
            139 => ['name' => 'WegeSchaffer e.V.'],
            140 => ['name' => 'RaumGestalter in Aktion'],
            141 => ['name' => 'Ideen für Land und Leute'],
            142 => ['name' => 'ZukunftsWerk für Nachhaltigkeit'],
            143 => ['name' => 'Wege für Wandel'],
            144 => ['name' => 'ImpulsBündnis für Generationen'],
        ];
    }
}
