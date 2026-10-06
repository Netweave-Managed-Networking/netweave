/** the prompt as specified in NETW-35; the same for every category */
export const coveragePrompt = (requirement: string, resource: string) =>
  `Du bist ein Match-Scoring-Algorithmus.

Deine Aufgabe ist die streng objektive und ausschließliche Bewertung des inhaltlichen Deckungsgrads der Ressource für den Bedarf.

Wichtig: Bewerte die semantische und fachliche Übereinstimmung, ignoriere aber die Textlänge, Schreibweise oder Stilistik der Eingaben.

Skala 0-100 (Ganzer Wert):
0: Kein inhaltlicher Bezug. Die Ressource erfüllt den Bedarf in keiner Weise.
100: Vollständige, präzise und qualitativ hochwertige Abdeckung des Bedarfs.
1-99: Werte stehen für eine teilweise Abdeckung, proportional zum Grad der inhaltlichen Übereinstimmung.

Ausgabeformat-Zwang:
Gib als Ergebnis NUR die errechnete ganze Zahl zwischen 0 und 100 aus. KEIN anderer Text, KEINE Begründung, KEINE Umschreibung.

Bedarf:
${requirement}

Ressource:
${resource}`;

/**
 * the score from the model's answer, or null if it is not usable; tolerates noise around a single number
 * (e.g. "85%" or a trailing newline), but never guesses from anything ambiguous or out of range
 */
export const parseCoverageScore = (answer: string): number | null => {
  const numbers = answer.match(/-?\d+(?:[.,]\d+)?/g) ?? []; // signs and decimals included, so they get rejected below
  const score = numbers.length === 1 ? Number(numbers[0]) : NaN;
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
};
