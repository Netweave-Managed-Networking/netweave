import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import {
  LikertAnswer,
  VIEW_OF_ENVIRONMENT_ITEM_IDS,
  ViewOfEnvironmentItemId,
} from '@netweave/api-types';
import { toViewOfEnvironmentScore } from './view-of-environment-score';

const answersOf = (
  answerOf: (itemId: ViewOfEnvironmentItemId) => LikertAnswer,
) =>
  VIEW_OF_ENVIRONMENT_ITEM_IDS.map((itemId) => ({
    itemId,
    answer: answerOf(itemId),
  }));

describe('toViewOfEnvironmentScore', () => {
  it('reverses UA2, UA3, UA6, UA8 and UA9 as 4 - answer before averaging', () => {
    const given: Record<ViewOfEnvironmentItemId, LikertAnswer> = {
      UA1: 4,
      UA2: 0,
      UA3: 1,
      UA4: 3,
      UA5: 2,
      UA6: 0,
      UA7: 4,
      UA8: 1,
      UA9: 0,
      UA10: 3,
    };

    // UA' = 4, 4, 3, 3, 2, 4, 4, 3, 4, 3
    expect(toViewOfEnvironmentScore(answersOf((id) => given[id]))).toBe(3.4);
  });

  it('lies between 0 for the least and 4 for the most ecological answers', () => {
    const reversed = new Set(['UA2', 'UA3', 'UA6', 'UA8', 'UA9']);

    expect(
      toViewOfEnvironmentScore(answersOf((id) => (reversed.has(id) ? 0 : 4))),
    ).toBe(4);
    expect(
      toViewOfEnvironmentScore(answersOf((id) => (reversed.has(id) ? 4 : 0))),
    ).toBe(0);
  });

  it('is 2 when every question is answered with the middle', () => {
    expect(toViewOfEnvironmentScore(answersOf(() => 2))).toBe(2);
  });

  it('does not depend on the order of the answers', () => {
    const answers = answersOf((id) => (id === 'UA2' ? 1 : 3));

    expect(toViewOfEnvironmentScore([...answers].reverse())).toBe(
      toViewOfEnvironmentScore(answers),
    );
  });

  it('is null unless all ten questions are answered', () => {
    expect(toViewOfEnvironmentScore([])).toBeNull();
    expect(
      toViewOfEnvironmentScore(
        answersOf(() => 3).filter(({ itemId }) => itemId !== 'UA7'),
      ),
    ).toBeNull();
  });
});
