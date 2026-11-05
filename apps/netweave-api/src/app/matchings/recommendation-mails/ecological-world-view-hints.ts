import { ViewOfNature } from '@netweave/api-types';

/** what of the ecological world view of a member the hint compares; null where not (completely) answered */
export interface EcologicalWorldView {
  viewOfEnvironmentScore: number | null;
  viewOfNature: ViewOfNature | null;
}

export type EcologicalWorldViewCase =
  | 'similar'
  | 'match-slightly-more'
  | 'match-clearly-more'
  | 'seeker-slightly-more'
  | 'seeker-clearly-more';

/**
 * from the perspective of the seeker A, the recommended member is B. differences are no reason
 * against a cooperation, so none of the texts is phrased negatively
 */
export const ECOLOGICAL_WORLD_VIEW_HINTS: Record<
  EcologicalWorldViewCase,
  string
> = {
  similar:
    'Ihre Organisationen haben ähnliche grundlegende Sichtweisen auf Natur- und Umweltthemen. Das kann die Zusammenarbeit erleichtern, weil entsprechende Einschätzungen voraussichtlich gut miteinander vereinbar sind.',
  'match-slightly-more':
    'Die empfohlene Organisation gewichtet Natur- und Umweltschutz tendenziell stärker als Ihre Organisation. Das muss einer Zusammenarbeit nicht im Weg stehen, kann aber dazu führen, dass Umweltfolgen oder Schutzinteressen unterschiedlich bewertet werden. Ein früher Austausch über gemeinsame Ziele und Prioritäten kann hier hilfreich sein.',
  'match-clearly-more':
    'Die empfohlene Organisation gewichtet Natur- und Umweltschutz deutlich stärker als Ihre Organisation. Dadurch können bei Entscheidungen unterschiedliche Einschätzungen dazu entstehen, wie stark ökologische Belange berücksichtigt werden sollten. Es kann hilfreich sein, Erwartungen und gemeinsame Ziele früh offen abzustimmen.',
  'seeker-slightly-more':
    'Ihre Organisation gewichtet Natur- und Umweltschutz tendenziell stärker als die empfohlene Organisation. Das muss einer Zusammenarbeit nicht im Weg stehen, kann aber dazu führen, dass Umweltfolgen oder Schutzinteressen unterschiedlich bewertet werden. Ein früher Austausch über gemeinsame Ziele und Prioritäten kann hier hilfreich sein.',
  'seeker-clearly-more':
    'Ihre Organisation gewichtet Natur- und Umweltschutz deutlich stärker als die empfohlene Organisation. Dadurch können bei Entscheidungen unterschiedliche Einschätzungen dazu entstehen, wie stark ökologische Belange berücksichtigt werden sollten. Es kann hilfreich sein, Erwartungen und gemeinsame Ziele früh offen abzustimmen.',
};

/** added to the view of environment difference when both have chosen a different view of nature */
const VIEW_OF_NATURE_DIFFERENCE = 0.5;

/**
 * how much more ecologically minded the recommended member is than the seeker, positive when it is more.
 * the view of nature has no direction, so a difference in it only widens the difference in the view of environment.
 * null if one of both has not answered
 */
export const ecologicalWorldViewDifference = (
  seeker: EcologicalWorldView,
  match: EcologicalWorldView,
): number | null => {
  if (
    seeker.viewOfEnvironmentScore == null ||
    match.viewOfEnvironmentScore == null ||
    seeker.viewOfNature == null ||
    match.viewOfNature == null
  ) {
    return null;
  }

  const environment =
    match.viewOfEnvironmentScore - seeker.viewOfEnvironmentScore;
  const nature =
    seeker.viewOfNature === match.viewOfNature
      ? 0
      : VIEW_OF_NATURE_DIFFERENCE;

  return Math.sign(environment) * (Math.abs(environment) + nature);
};

/** up to ±0.5 similar, up to ±1.0 slightly, beyond that clearly */
export const ecologicalWorldViewCase = (
  difference: number,
): EcologicalWorldViewCase => {
  if (difference > 1) return 'match-clearly-more';
  if (difference > 0.5) return 'match-slightly-more';
  if (difference < -1) return 'seeker-clearly-more';
  if (difference < -0.5) return 'seeker-slightly-more';

  return 'similar';
};

/** null if one of both has not answered */
export const ecologicalWorldViewHint = (
  seeker: EcologicalWorldView,
  match: EcologicalWorldView,
): string | null => {
  const difference = ecologicalWorldViewDifference(seeker, match);

  return difference == null
    ? null
    : ECOLOGICAL_WORLD_VIEW_HINTS[ecologicalWorldViewCase(difference)];
};
