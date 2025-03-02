<?php

namespace Database\Factories;

use App\Models\ResourceCategory;

/**
 * @extends PreferMocksFactory<ResourceCategory>
 */
class ResourceCategoryFactory extends PreferMocksFactory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ResourceCategory::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return $this->getUniqueMockOrGenerateNew(uniqueField: 'title');
    }

    protected function generateRandomModel(): array
    {
        return [
            'title' => $this->faker->unique()->sentence(nbWords: 3),
            'definition' => $this->faker->optional()->paragraph(),
        ];
    }

    protected function getMockEntries(): array
    {
        return [
            1 => ['title' => 'Bildung/Lehre', 'definition' => 'Ressourcen zur Vermittlung von Wissen, einschließlich Schulungsunterlagen, Lehrpläne und Bildungskompetenzen.'],
            2 => ['title' => 'Biologisches Fachwissen Agrar', 'definition' => 'Expertise im Bereich der landwirtschaftlichen Ökosysteme, einschließlich Anbau, Bodennutzung und Erntemanagement.'],
            3 => ['title' => 'Biologisches Fachwissen Allgemein', 'definition' => 'Allgemeines Wissen über biologische Prozesse und Prinzipien in verschiedenen Ökosystemen.'],
            4 => ['title' => 'Biologisches Fachwissen Amphibien & Reptilien', 'definition' => 'Fachkenntnisse über Amphibien und Reptilien, einschließlich ihrer Lebensräume, Verhalten und Schutzmaßnahmen.'],
            5 => ['title' => 'Biologisches Fachwissen Boden', 'definition' => 'Kenntnisse über Bodentypen, Bodenökologie und nachhaltige Nutzung von Bodenressourcen.'],
            6 => ['title' => 'Biologisches Fachwissen Fische', 'definition' => 'Wissen über Fischarten, ihre Lebensräume, Zucht und Schutzstrategien in aquatischen Ökosystemen.'],
            7 => ['title' => 'Biologisches Fachwissen Gewässer', 'definition' => 'Kompetenzen im Bereich der Süß- und Salzwassersysteme, einschließlich Wasserqualität und Gewässermanagement.'],
            8 => ['title' => 'Biologisches Fachwissen Grünland/Wiesen', 'definition' => 'Expertise in der Pflege und Erhaltung von Wiesen- und Weideökosystemen.'],
            9 => ['title' => 'Biologisches Fachwissen Mikroorganismen', 'definition' => 'Wissen über Mikroorganismen, ihre Funktionen in Ökosystemen und ihre praktische Nutzung.'],
            10 => ['title' => 'Biologisches Fachwissen Moor', 'definition' => 'Fachwissen über Moorlandschaften, ihre Biodiversität und ihre Rolle im Klimaschutz.'],
            11 => ['title' => 'Biologisches Fachwissen Pflanzen', 'definition' => 'Kompetenzen in Botanik, einschließlich Pflanzenbestimmung, Anbau und Schutz.'],
            12 => ['title' => 'Biologisches Fachwissen Säugetiere', 'definition' => 'Kenntnisse über Säugetiere, ihre Lebensräume, Verhaltensweisen und Schutzstrategien.'],
            13 => ['title' => 'Biologisches Fachwissen Urbane Ökosysteme', 'definition' => 'Expertise in städtischen Ökosystemen, einschließlich Begrünung und Biodiversität in urbanen Räumen.'],
            14 => ['title' => 'Biologisches Fachwissen Vögel', 'definition' => 'Wissen über Vogelarten, ihre Migration, Brutverhalten und Schutzmaßnahmen.'],
            15 => ['title' => 'Biologisches Fachwissen Wald', 'definition' => 'Fachwissen zu Waldökosystemen, nachhaltiger Forstwirtschaft und Waldschutz.'],
            16 => ['title' => 'Biologisches Fachwissen Wirbellose', 'definition' => 'Kompetenzen im Bereich der wirbellosen Tiere, einschließlich ihrer Rolle in Ökosystemen.'],
            17 => ['title' => 'Bürokratische/juristische Kompetenzen', 'definition' => 'Fachwissen im Umgang mit rechtlichen, behördlichen und bürokratischen Anforderungen.'],
            18 => ['title' => 'Einfluss', 'definition' => 'Netzwerke, Autorität und Positionen, die es ermöglichen, Entscheidungen oder Prozesse zu beeinflussen.'],
            19 => ['title' => 'Finanzielle Mittel', 'definition' => 'Geldressourcen zur Finanzierung von Projekten oder Vorhaben.'],
            20 => ['title' => 'Flächen', 'definition' => 'Grundstücke oder Landflächen für verschiedene Zwecke, wie Naturschutz oder Landwirtschaft.'],
            21 => ['title' => 'Human Resources', 'definition' => 'Verfügbarkeit von Arbeitskräften, Fachkräften oder ehrenamtlicher Unterstützung.'],
            22 => ['title' => 'Kontakte', 'definition' => 'Netzwerke und Beziehungen, die den Zugang zu weiteren Ressourcen oder Wissen ermöglichen.'],
            23 => ['title' => 'Maschinen/Geräte', 'definition' => 'Technische Ausrüstung und Werkzeuge für die Durchführung von Projekten.'],
            24 => ['title' => 'Öffentlichkeitsarbeit', 'definition' => 'Ressourcen zur Kommunikation mit der Öffentlichkeit, einschließlich Medienarbeit und Marketing.'],
            25 => ['title' => 'Räumlichkeiten', 'definition' => 'Gebäude oder Räume, die für Meetings, Veranstaltungen oder Arbeitszwecke genutzt werden können.'],
            26 => ['title' => 'Sonstige Kompetenzen', 'definition' => 'Fachkenntnisse und Fähigkeiten, die nicht in anderen Kategorien enthalten sind.'],
            27 => ['title' => 'Vermittlung', 'definition' => 'Ressourcen oder Fähigkeiten zur Moderation oder Vermittlung zwischen verschiedenen Akteuren.'],
            28 => ['title' => 'Weitere Ressourcen', 'definition' => 'Zusätzliche Ressourcen, die nicht spezifisch kategorisiert sind.'],
            29 => ['title' => 'Technologische Innovation', 'definition' => 'Expertise und Ausrüstung im Bereich neuer Technologien und Digitalisierung.'],
            30 => ['title' => 'Kulturelles Wissen', 'definition' => 'Kenntnisse über kulturelle Werte, Traditionen und die Integration dieser in Projekte.'],
            31 => [
                'title' => 'Langbeschreibungskategorie zur Prüfung maximaler Zeichenlängen für den Titel von genau 256 Zeichen. Diese Kategorie dient dazu, eine vollständige Nutzung der maximal möglichen Zeichenanzahl zu gewährleisten und die Funktionalität des Systems zu validieren.',
                'definition' => 'Diese Kategorie wurde speziell entwickelt, um die maximale Zeichenanzahl in Beschreibungen zu überprüfen und sicherzustellen, dass diese korrekt verarbeitet und gespeichert wird. Sie enthält einen längeren Text von exakt 1024 Zeichen, der dazu dient, die Funktionsweise von Datenbanken, Formularen oder Frontend-Komponenten zu testen. Die Beschreibung könnte Details zu beliebigen Themen enthalten, wie z. B. den Einsatz von Systemen in verschiedenen Anwendungsbereichen, deren potenzielle Vorteile und die Herausforderungen, die bei der Implementierung auftreten können. Durch diese Kategorie kann zudem die Auswirkung langer Texte auf das Layout von Benutzeroberflächen überprüft werden, einschließlich ihrer Lesbarkeit und Benutzerfreundlichkeit. Solche Tests sind besonders wichtig für Projekt, bei denen mit variierenden Datenlängen gearbeitet wird, um sicherzustellen, dass die Software in allen Szenarien stabil und effektiv bleibt. Und noch ein paar Zeichen mehr. Und noch paar Zeichen mehr. Und noch so ein Zeichen.',
            ],
        ];
    }
}
