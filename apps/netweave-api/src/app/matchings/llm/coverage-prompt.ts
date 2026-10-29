import { ResourceRequirementCategoryText } from '@netweave/api-types';

/** prompt as specified in NETW-35 */
export const coveragePrompt = (
  category: ResourceRequirementCategoryText,
  requirement: string,
  resource: string,
) =>
  `
Du bist ein Match-Scoring-Algorithmus.

Deine Aufgabe ist die streng objektive und ausschließliche Bewertung des inhaltlichen Deckungsgrads der Ressource für den Bedarf.

Wichtig:
  Die beiden Angaben (Bedarf und Ressource) kommen von verschiedenen Teilnehmern und können sich daher stilistisch unterscheiden.
  Bewerte die semantische und fachliche Übereinstimmung, ignoriere aber die Textlänge, Schreibweise oder Stilistik der Eingaben.
  

Skala 0-100 (Ganzer Wert):
  0: Kein inhaltlicher Bezug. Die Ressource erfüllt den Bedarf in keiner Weise.
  100: Vollständige, präzise und qualitativ hochwertige Abdeckung des Bedarfs.
  1-99: Werte stehen für eine teilweise Abdeckung, proportional zum Grad der inhaltlichen Übereinstimmung.

Kalibrierung (nur zur Orientierung, nicht in der Ausgabe erwähnen):
  Nutze die gesamte Skala, auch Zwischenwerte. Die Ankerwerte sind keine Vorgaben für das Ergebnis.

  Bereiche:
  - 90-100: Deckt den Bedarf vollständig und konkret ab, alle genannten Teilaspekte sind erfüllt.
  - 60-89: Deckt den Kern des Bedarfs ab, aber einzelne Teilaspekte fehlen oder sind unklar.
  - 30-59: Gleiches Fachgebiet, aber die Ressource trifft nur einen kleinen Teil des konkreten Bedarfs.
  - 10-29: Nur lose thematische Nähe, der Bedarf wird praktisch nicht gedeckt.
  - 0-9: Kaum bis kein erkennbarer Zusammenhang.

Ausgabeformat-Zwang:
  Gib als Ergebnis NUR die errechnete ganze Zahl zwischen 0 und 100 aus. KEIN anderer Text, KEINE Begründung, KEINE Umschreibung.

Kontextinformation:
  Sowohl der folgende Bedarf als auch die folgende Ressource wurden durch die befragten Netzwerkteilnehmer in der Kategorie "${category.label}; ${category.description}" angegeben.

Bedarf, den Netzwerteilnehmer A hat:
  ${requirement}

Ressource, über die Netzwerteilnehmer B verfügt:
  ${resource}

`;

/** null if the answer is not a single integer between 0 and 100 */
export const parseCoverageScore = (answer: string): number | null => {
  const numbers = answer.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
  const score = numbers.length === 1 ? Number(numbers[0]) : NaN;
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
};
