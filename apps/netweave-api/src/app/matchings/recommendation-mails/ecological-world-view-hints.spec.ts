import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import {
  ECOLOGICAL_WORLD_VIEW_HINTS,
  EcologicalWorldView,
  ecologicalWorldViewCase,
  ecologicalWorldViewDifference,
  ecologicalWorldViewHint,
} from './ecological-world-view-hints';

const view = (
  viewOfEnvironmentScore: number | null,
  viewOfNature: EcologicalWorldView['viewOfNature'] = 'fragile',
): EcologicalWorldView => ({ viewOfEnvironmentScore, viewOfNature });

describe('ecologicalWorldViewDifference', () => {
  it('is the view of environment score of the match minus the one of the recipient', () => {
    expect(ecologicalWorldViewDifference(view(2), view(3))).toBe(1);
    expect(ecologicalWorldViewDifference(view(3), view(2))).toBe(-1);
  });

  it('widens a positive difference by 0.5 for a different view of nature', () => {
    expect(
      ecologicalWorldViewDifference(view(2), view(2.4, 'robust')),
    ).toBeCloseTo(0.9);
  });

  it('widens a negative difference by 0.5 for a different view of nature', () => {
    expect(
      ecologicalWorldViewDifference(view(2.4), view(2, 'robust')),
    ).toBeCloseTo(-0.9);
  });

  it('stays 0 for an equal view of environment, even with a different view of nature', () => {
    expect(ecologicalWorldViewDifference(view(2), view(2, 'robust'))).toBe(0);
  });

  it('is null if one of both has not answered', () => {
    expect(ecologicalWorldViewDifference(view(null), view(2))).toBeNull();
    expect(ecologicalWorldViewDifference(view(2), view(null))).toBeNull();
    expect(ecologicalWorldViewDifference(view(2, null), view(2))).toBeNull();
    expect(ecologicalWorldViewDifference(view(2), view(2, null))).toBeNull();
  });

  it('counts a view of environment score of 0 as an answer', () => {
    expect(ecologicalWorldViewDifference(view(0), view(1))).toBe(1);
  });
});

describe('ecologicalWorldViewCase', () => {
  it.each([
    [0, 'similar'],
    [0.5, 'similar'],
    [-0.5, 'similar'],
    [0.75, 'match-slightly-more'],
    [1, 'match-slightly-more'],
    [1.25, 'match-clearly-more'],
    [-0.75, 'recipient-slightly-more'],
    [-1, 'recipient-slightly-more'],
    [-1.25, 'recipient-clearly-more'],
  ])('maps %d to %s', (difference, expected) => {
    expect(ecologicalWorldViewCase(difference)).toBe(expected);
  });
});

describe('ecologicalWorldViewHint', () => {
  it('picks the text by the direction from recipient to match', () => {
    expect(ecologicalWorldViewHint(view(1), view(3))).toBe(
      ECOLOGICAL_WORLD_VIEW_HINTS['match-clearly-more'],
    );
    expect(ecologicalWorldViewHint(view(3), view(1))).toBe(
      ECOLOGICAL_WORLD_VIEW_HINTS['recipient-clearly-more'],
    );
  });

  it('is null if one of both has not answered', () => {
    expect(ecologicalWorldViewHint(view(null), view(3))).toBeNull();
  });
});
