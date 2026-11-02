import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { VIEW_OF_NATURE_OPTIONS } from '@netweave/api-types';
import {
  viewOfEnvironmentSimilarity,
  viewOfNatureSimilarity,
} from './world-view-similarity';

describe('viewOfEnvironmentSimilarity', () => {
  it('scales 1 - difference / 4 to 0 - 100, as in the ticket examples', () => {
    expect(viewOfEnvironmentSimilarity(3, 3)).toBe(100);
    expect(viewOfEnvironmentSimilarity(3, 2)).toBe(75);
    expect(viewOfEnvironmentSimilarity(4, 0)).toBe(0);
  });

  it('is symmetric, as only the similarity counts, not who is more ecologically minded', () => {
    expect(viewOfEnvironmentSimilarity(0.5, 3.7)).toBeCloseTo(20, 10);
    expect(viewOfEnvironmentSimilarity(3.7, 0.5)).toBeCloseTo(20, 10);
  });
});

describe('viewOfNatureSimilarity', () => {
  it('is 100 for the same view of nature and 0 for any other', () => {
    for (const seeker of VIEW_OF_NATURE_OPTIONS) {
      for (const potentialMatch of VIEW_OF_NATURE_OPTIONS) {
        expect(viewOfNatureSimilarity(seeker, potentialMatch)).toBe(
          seeker === potentialMatch ? 100 : 0,
        );
      }
    }
  });
});
