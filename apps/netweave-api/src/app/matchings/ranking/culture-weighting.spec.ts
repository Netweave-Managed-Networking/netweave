import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { CultureProfile, toCultureProfile } from './culture-profile';
import {
  cultureDistance,
  EuclideanMaxCultureWeighting,
} from './culture-weighting';

describe('toCultureProfile', () => {
  it('normalizes the weights of a topic to percent', () => {
    expect(
      toCultureProfile([
        { itemId: 'Z1-G', weight: 2, topicTotal: 10 },
        { itemId: 'Z1-I', weight: 3, topicTotal: 10 },
        { itemId: 'Z1-W', weight: 1, topicTotal: 10 },
        { itemId: 'Z1-S', weight: 4, topicTotal: 10 },
      ]),
    ).toEqual({ G: 20, I: 30, W: 10, S: 40 });
  });

  it('averages over the answered topics only', () => {
    const profile = toCultureProfile([
      { itemId: 'Z1-G', weight: 1, topicTotal: 1 },
      { itemId: 'Z1-I', weight: 0, topicTotal: 1 },
      { itemId: 'Z3-G', weight: 0, topicTotal: 4 },
      { itemId: 'Z3-I', weight: 4, topicTotal: 4 },
    ]);

    expect(profile).toEqual({ G: 50, I: 50, W: 0, S: 0 });
  });

  it('is null without any culture answers', () => {
    expect(toCultureProfile([])).toBeNull();
  });
});

describe('EuclideanMaxCultureWeighting', () => {
  const weighting = new EuclideanMaxCultureWeighting();
  const seeker: CultureProfile = { G: 20, W: 30, I: 10, S: 40 };
  const potentialMatch: CultureProfile = { G: 20, W: 40, I: 20, S: 20 };

  it('calculates the distance of the ticket example exactly, without rounding the root', () => {
    // sqrt(0 + 100 + 100 + 400) + 1/2 * 20; the ticket rounds the root to 24, which gives 34
    expect(cultureDistance(seeker, potentialMatch)).toBeCloseTo(
      Math.sqrt(600) + 10,
      10,
    );
  });

  it('maps the distance to a score of 100 - 2/5 * D', () => {
    expect(weighting.score(seeker, potentialMatch)).toBeCloseTo(
      100 - 0.4 * (Math.sqrt(600) + 10),
      10,
    );
  });

  it('is symmetric', () => {
    expect(weighting.score(potentialMatch, seeker)).toBe(
      weighting.score(seeker, potentialMatch),
    );
  });

  it('gives 100 for identical profiles', () => {
    expect(weighting.score(seeker, { ...seeker })).toBe(100);
  });

  it('gives the lowest possible score for profiles fully focused on different orientations', () => {
    const score = weighting.score(
      { G: 100, I: 0, W: 0, S: 0 },
      { G: 0, I: 100, W: 0, S: 0 },
    );

    expect(score).toBeCloseTo(100 - 0.4 * (Math.sqrt(20_000) + 50), 10);
  });
});
