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
 * against a cooperation, so none of the texts is phrased negatively. placeholders until the final texts are delivered
 */
export const ECOLOGICAL_WORLD_VIEW_HINTS: Record<
  EcologicalWorldViewCase,
  string
> = {
  similar:
    'Eure ökologische Weltanschauung ist ähnlich – eine gute Grundlage für ein gemeinsames Verständnis.',
  'match-slightly-more':
    'Die Organisation ist tendenziell etwas stärker ökologisch ausgerichtet als ihr – vielleicht findet ihr hier neue Impulse.',
  'match-clearly-more':
    'Die Organisation ist deutlich stärker ökologisch ausgerichtet als ihr – ein Austausch darüber kann für beide Seiten bereichernd sein.',
  'seeker-slightly-more':
    'Ihr seid tendenziell etwas stärker ökologisch ausgerichtet als die Organisation – vielleicht könnt ihr hier eigene Impulse einbringen.',
  'seeker-clearly-more':
    'Ihr seid deutlich stärker ökologisch ausgerichtet als die Organisation – sprecht eure Erwartungen daran am besten frühzeitig an.',
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
