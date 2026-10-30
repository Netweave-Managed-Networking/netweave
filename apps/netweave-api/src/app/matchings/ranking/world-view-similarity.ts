import { LIKERT_MAX, ViewOfNature } from '@netweave/api-types';

// both similarities range from 0 to 100, comparable with the matching results

/** only how close both scores are counts, not which one is higher: 100 when equal, 0 when one is 0 and the other 4 */
export const viewOfEnvironmentSimilarity = (
  seeker: number,
  potentialMatch: number,
): number => 100 * (1 - Math.abs(seeker - potentialMatch) / LIKERT_MAX);

/** the views of nature are nominal, without any order or distance between them, so they either match or not */
export const viewOfNatureSimilarity = (
  seeker: ViewOfNature,
  potentialMatch: ViewOfNature,
): number => (seeker === potentialMatch ? 100 : 0);
