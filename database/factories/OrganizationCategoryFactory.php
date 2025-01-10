<?php

namespace Database\Factories;

use App\Models\OrganizationCategory;

class OrganizationCategoryFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrganizationCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return $this->getUniqueMockOrGenerateNew(uniqueField: 'name');
    }

    protected function generateRandomModel(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'description' => fake()->optional()->realTextBetween(minNbChars: 10, maxNbChars: 250),
        ];
    }

    protected function getMockEntries(): array
    {
        return [
            1 => ['name' => 'Behörde', 'description' => 'Eine staatliche oder kommunale Institution, die für die Umsetzung von Gesetzen, Vorschriften und Verwaltungsaufgaben zuständig ist.'],
            2 => ['name' => 'Stiftung', 'description' => 'Eine Organisation, die gemeinnützige Zwecke verfolgt und durch Vermögenswerte langfristige Projekte finanziert.'],
            3 => ['name' => 'Gemeinde/Stadt', 'description' => 'Eine lokale Gebietskörperschaft mit Verantwortung für öffentliche Dienste und die Verwaltung einer bestimmten Region.'],
            4 => ['name' => 'Naturschutzverein', 'description' => 'Eine Organisation, die sich für den Schutz und die Erhaltung der Natur und ihrer Ressourcen einsetzt.'],
            5 => ['name' => 'Jagdverein', 'description' => 'Ein Zusammenschluss von Jägern zur Förderung nachhaltiger Jagdpraktiken und des Wildtiermanagements.'],
            6 => ['name' => 'Unterhaltungsverband', 'description' => 'Eine Organisation, die sich mit der Pflege und dem Erhalt von Gewässern und Wasserläufen beschäftigt.'],
            7 => ['name' => 'Fischereiverein', 'description' => 'Ein Verein, der die Interessen von Anglern und die Pflege von Gewässern für nachhaltige Fischerei vertritt.'],
            8 => ['name' => 'Landwirtschaftsorganisation', 'description' => 'Ein Verband, der Landwirte bei der Förderung nachhaltiger Landwirtschaft und des Wissensaustauschs unterstützt.'],
            9 => ['name' => 'Waldwirtschaftsverband', 'description' => 'Eine Organisation, die sich mit der nachhaltigen Bewirtschaftung und dem Schutz von Wäldern befasst.'],
            10 => ['name' => 'Imkerverein', 'description' => 'Ein Verein, der Imker bei der Pflege und dem Schutz von Bienen und der Imkerei unterstützt.'],
            11 => ['name' => 'Tourismusverband', 'description' => 'Eine Organisation, die die Förderung des Tourismus in einer Region durch Marketing und Infrastrukturentwicklung unterstützt.'],
            12 => ['name' => 'Universität Osnabrück', 'description' => 'Eine wissenschaftliche Institution in Osnabrück mit einem breiten Angebot an Forschung und Lehre.'],
            13 => ['name' => 'Hochschule Osnabrück', 'description' => 'Eine praxisorientierte Hochschule in Osnabrück, die Forschung und berufliche Bildung vereint.'],
            14 => ['name' => 'Unternehmen', 'description' => 'Ein wirtschaftlich tätiges Gebilde, das Produkte oder Dienstleistungen anbietet.'],
            15 => ['name' => 'Heimatverein', 'description' => 'Ein Verein, der sich für die Pflege lokaler Traditionen und die Erhaltung kultureller Werte einsetzt.'],
            16 => ['name' => 'Umweltbildungszentrum', 'description' => 'Eine Einrichtung, die Umweltbildung durch Workshops, Seminare und Bildungsprogramme fördert.'],
            17 => ['name' => 'Klimaschutzinitiative', 'description' => 'Eine Organisation, die Projekte zur Reduktion von Treibhausgasen und zum Schutz des Klimas unterstützt.'],
            18 => ['name' => 'Wasserverband', 'description' => 'Eine Institution, die sich mit der Bewirtschaftung und dem Schutz von Wasserressourcen befasst.'],
            19 => ['name' => 'Abfallentsorgungsverband', 'description' => 'Ein Verband, der für die Organisation und Umsetzung von Abfallmanagementsystemen verantwortlich ist.'],
            20 => ['name' => 'Energiegenossenschaft', 'description' => 'Ein Zusammenschluss von Bürgern zur Förderung und Nutzung erneuerbarer Energien.'],
            21 => ['name' => 'Bürgerinitiative', 'description' => 'Eine Gruppe von Bürgern, die sich für ein gemeinsames Ziel oder Anliegen einsetzt.'],
            22 => ['name' => 'Sportverein', 'description' => 'Ein Verein, der sportliche Aktivitäten und die Teilnahme an Wettkämpfen fördert.'],
            23 => ['name' => 'Kulturverein', 'description' => 'Eine Organisation zur Förderung von kulturellen Aktivitäten und Veranstaltungen.'],
            24 => ['name' => 'Jugendorganisation', 'description' => 'Eine Gruppe, die Aktivitäten und Programme für Jugendliche anbietet und organisiert.'],
            25 => ['name' => 'Sozialer Dienstleister', 'description' => 'Eine Organisation, die Dienstleistungen im sozialen Bereich, wie Betreuung oder Beratung, anbietet.'],
            26 => ['name' => 'Krankenversicherungsunternehmen', 'description' => 'Ein Unternehmen, das Krankenversicherungsleistungen für Einzelpersonen und Gruppen bereitstellt.'],
            27 => ['name' => 'Arbeitgeberverband', 'description' => 'Ein Verband, der die Interessen von Arbeitgebern in Verhandlungen und rechtlichen Angelegenheiten vertritt.'],
            28 => ['name' => 'Gewerkschaft', 'description' => 'Eine Organisation, die die Interessen von Arbeitnehmern schützt und vertritt.'],
            29 => ['name' => 'Forschungsinstitut', 'description' => 'Eine Einrichtung, die wissenschaftliche Forschung in einem oder mehreren Fachbereichen betreibt.'],
            30 => ['name' => 'Technische Hochschule', 'description' => 'Eine Hochschule mit Fokus auf technische Studiengänge und praxisorientierte Forschung.'],
            31 => ['name' => 'Karitative Organisation', 'description' => 'Eine Organisation, die soziale, humanitäre oder wohltätige Ziele verfolgt.'],
            32 => ['name' => 'Bildungswerk', 'description' => 'Eine Organisation, die Bildungsprogramme und Weiterbildungen für verschiedene Zielgruppen anbietet.'],
            33 => ['name' => 'Kulturstiftung', 'description' => 'Eine Stiftung zur Förderung von kulturellen Projekten und Initiativen.'],
            34 => ['name' => 'Krankenhausverband', 'description' => 'Ein Zusammenschluss von Krankenhäusern zur Vertretung gemeinsamer Interessen und Verbesserung der Gesundheitsversorgung.'],
            35 => ['name' => 'Feuerwehrverein', 'description' => 'Ein Verein, der die Arbeit und Gemeinschaft der Feuerwehrmitglieder fördert.'],
            36 => ['name' => 'Katastrophenschutzorganisation', 'description' => 'Eine Organisation, die Maßnahmen zur Vorbereitung, Prävention und Bewältigung von Katastrophen umsetzt.'],
            37 => ['name' => 'Genossenschaftsbank', 'description' => 'Eine Bank, die genossenschaftlich organisiert ist und ihren Mitgliedern gehört.'],
            38 => ['name' => 'Handwerkskammer', 'description' => 'Eine Organisation, die die Interessen des Handwerks und der Handwerksbetriebe vertritt.'],
            39 => ['name' => 'Industrie- und Handelskammer', 'description' => 'Eine Institution zur Förderung der regionalen Wirtschaft und Unterstützung von Unternehmen.'],
            40 => ['name' => 'Handelsverband', 'description' => 'Ein Verband, der die Interessen des Handels und von Einzelhändlern vertritt.'],
            41 => ['name' => 'Naturschutzstiftung', 'description' => 'Eine Stiftung, die sich für den Schutz und Erhalt von Naturräumen einsetzt.'],
            42 => ['name' => 'Verkehrsunternehmen', 'description' => 'Ein Unternehmen, das Dienstleistungen im Bereich des öffentlichen oder privaten Transports anbietet.'],
            43 => ['name' => 'Sozialverband', 'description' => 'Ein Verband, der soziale Gerechtigkeit und Unterstützung für benachteiligte Gruppen fördert.'],
            44 => ['name' => 'Schützenverein', 'description' => 'Ein Verein, der das Schützenwesen und die Tradition des Schießsports pflegt.'],
            45 => ['name' => 'Musikverein', 'description' => 'Eine Organisation, die musikalische Aktivitäten, Aufführungen und Gemeinschaft fördert.'],
            46 => ['name' => 'Wissenschaftlicher Beirat', 'description' => 'Ein Gremium, das wissenschaftliche Expertise und Beratung für Projekte oder Institutionen bereitstellt.'],
            47 => ['name' => 'Tierschutzverein', 'description' => 'Ein Verein, der sich für den Schutz von Tieren und deren Wohlbefinden einsetzt.'],
            48 => ['name' => 'Kunstverein', 'description' => 'Ein Verein zur Förderung von Kunst und Künstlern sowie zur Organisation von Ausstellungen.'],
            49 => ['name' => 'Wassersportclub', 'description' => 'Ein Club, der sportliche Aktivitäten auf oder im Wasser fördert.'],
            50 => ['name' => 'Seniorenvereinigung', 'description' => 'Eine Vereinigung, die Aktivitäten und Unterstützung für ältere Menschen anbietet.'],
            51 => [
                'name' => 'Kategorie mit Namenslängen von 64 Zeichen für Validierungstests.',
                'description' => 'Diese Kategorie wurde erstellt, um die maximale Länge von 256 Zeichen für Beschreibungen in der Datenbank zu testen. Sie enthält eine vollständige Beschreibung, genau 256 Zeichen umfasst, um sicherzustellen, dass solche Einträge korrekt gespeichert werden.',
            ],
        ];
    }
}
