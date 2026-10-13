import { CULTURE_ORIENTATIONS } from '@netweave/api-types';
import { CultureProfile } from './culture-profile';

export interface CultureWeighting {
  score(seeker: CultureProfile, potentialMatch: CultureProfile): number;
}

export class EuclideanMaxCultureWeighting implements CultureWeighting {
  // maps the distance (0 = identical, 250 = opposite) to a score from 100 down to 0, comparable with the
  // matching results. as the shares of a profile add up to 100, the distance never exceeds ~191 in practice
  public score(seeker: CultureProfile, potentialMatch: CultureProfile): number {
    return 100 - (2 / 5) * cultureDistance(seeker, potentialMatch);
  }
}

// D = sqrt(sum of the squared differences) + 1/2 * the largest difference, over the orientations G, I, W, S
export const cultureDistance = (
  seeker: CultureProfile,
  potentialMatch: CultureProfile,
): number => {
  const differences = CULTURE_ORIENTATIONS.map((orientation) =>
    Math.abs(seeker[orientation] - potentialMatch[orientation]),
  );

  const euclidean = Math.sqrt(
    differences.reduce((total, difference) => total + difference ** 2, 0),
  );
  const largestDifference = Math.max(...differences);

  return euclidean + largestDifference / 2;
};
