import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { VIEW_OF_ENVIRONMENT_ITEM_IDS } from '@netweave/api-types';
import { MemberCultureWeight } from '../../members/member-culture-weight.entity';
import { MemberViewOfEnvironmentAnswer } from '../../members/member-view-of-environment-answer.entity';
import { toMemberProfiles } from './member-profile';

const cultureWeights = [
  { itemId: 'Z1-G', weight: 1, topicTotal: 2 },
  { itemId: 'Z1-I', weight: 1, topicTotal: 2 },
] as MemberCultureWeight[];

// every question answered with 3, so the reversed ones count as 1: (5 * 3 + 5 * 1) / 10
const viewOfEnvironmentAnswers = VIEW_OF_ENVIRONMENT_ITEM_IDS.map((itemId) => ({
  itemId,
  answer: 3,
})) as MemberViewOfEnvironmentAnswer[];

describe('toMemberProfiles', () => {
  it('calculates the culture profile and the view of environment score of each member', () => {
    const profiles = toMemberProfiles([
      {
        id: 1,
        cultureWeights,
        viewOfEnvironmentAnswers,
        viewOfNature: 'fragile',
      },
    ]);

    expect(profiles.get(1)).toEqual({
      culture: { G: 50, I: 50, W: 0, S: 0 },
      viewOfEnvironmentScore: 2,
      viewOfNature: 'fragile',
    });
  });

  it('uses the current answers, as the score is not stored', () => {
    const changed = viewOfEnvironmentAnswers.map((answer) =>
      answer.itemId === 'UA1' ? { ...answer, answer: 4 } : answer,
    ) as MemberViewOfEnvironmentAnswer[];

    expect(
      toMemberProfiles([
        { id: 1, viewOfEnvironmentAnswers: changed, viewOfNature: null },
      ]).get(1)?.viewOfEnvironmentScore,
    ).toBe(2.1);
  });

  it('has null values for members whose answers were not loaded or are incomplete', () => {
    const profiles = toMemberProfiles([
      { id: 1, viewOfNature: null },
      {
        id: 2,
        viewOfEnvironmentAnswers: viewOfEnvironmentAnswers.slice(1),
        viewOfNature: null,
      },
    ]);

    expect(profiles.get(1)).toEqual({
      culture: null,
      viewOfEnvironmentScore: null,
      viewOfNature: null,
    });
    expect(profiles.get(2)?.viewOfEnvironmentScore).toBeNull();
  });
});
