import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import {
  MatchingDetailsDTO,
  OverallMemberRecommendationsDTO,
  PerCategoryMemberRecommendationsDTO,
  RankingWeightsDTO,
} from '@netweave/api-types';
import { Logger } from '@nestjs/common';
import { MemberCultureWeight } from '../../members/member-culture-weight.entity';
import {
  CategorySeparationMatching,
  MaxCategoryMatching,
} from './category-matching';
import { CultureWeighting } from './culture-weighting';
import { createRankingStrategy } from './ranking-strategies';
import { ComposedRankingStrategy, RankingInput } from './ranking-strategy';

const WEIGHTS: RankingWeightsDTO = { matching: 80, culture: 20, nep: 0 };

/** culture profile focused on G only to the given percentage, so the stub below can tell members apart */
const culture = (g: number): MemberCultureWeight[] =>
  [
    { itemId: 'Z1-G', weight: g, topicTotal: 100 },
    { itemId: 'Z1-I', weight: 100 - g, topicTotal: 100 },
  ] as MemberCultureWeight[];

/** culture score = G share of the potential match, easy to follow in expectations */
const cultureWeighting: CultureWeighting = {
  score: (_seeker, potentialMatch) => potentialMatch.G,
};

type Categories = MatchingDetailsDTO['categories'];

const matching = (
  memberSeekerId: number,
  memberPotentialMatchId: number,
  categories: Categories | null,
): RankingInput['matchings'][number] => ({
  memberSeekerId,
  memberPotentialMatchId,
  details: categories && { categories },
});

const separation = (weights = WEIGHTS) =>
  new ComposedRankingStrategy(
    'category-separation',
    new CategorySeparationMatching(),
    cultureWeighting,
    weights,
  );

const maxCategory = (weights = WEIGHTS) =>
  new ComposedRankingStrategy(
    'max-category',
    new MaxCategoryMatching(),
    cultureWeighting,
    weights,
  );

describe('ComposedRankingStrategy', () => {
  describe('with category separation', () => {
    it('ranks each category of the seeker separately, by 80% matching and 20% culture', () => {
      const result = separation().rank({
        members: [
          { id: 1, cultureWeights: culture(50) },
          { id: 2, cultureWeights: culture(100) },
          { id: 3, cultureWeights: culture(0) },
        ],
        matchings: [
          matching(1, 2, [
            { category: 'premises', score: 50 },
            { category: 'competencies', score: 90 },
          ]),
          matching(1, 3, [
            { category: 'premises', score: 70 },
            { category: 'competencies', score: 10 },
          ]),
        ],
      });

      expect(result.strategy).toBe('category-separation');
      expect(result.weights).toEqual(WEIGHTS);
      expect(result.members[0]).toEqual({
        kind: 'per-category',
        seekerId: 1,
        categories: [
          {
            category: 'competencies', // ordered like RESOURCE_REQUIREMENT_CATEGORIES
            matches: [
              { memberId: 2, score: 92, matchingScore: 90, cultureScore: 100 },
              { memberId: 3, score: 8, matchingScore: 10, cultureScore: 0 },
            ],
          },
          {
            category: 'premises',
            matches: [
              { memberId: 2, score: 60, matchingScore: 50, cultureScore: 100 },
              { memberId: 3, score: 56, matchingScore: 70, cultureScore: 0 },
            ],
          },
        ],
      });
    });

    it('keeps the top 3 only, ties ordered by member id', () => {
      const members = [1, 2, 3, 4, 5].map((id) => ({
        id,
        cultureWeights: culture(50),
      }));
      const result = separation().rank({
        members,
        matchings: [
          matching(1, 5, [{ category: 'land', score: 40 }]),
          matching(1, 4, [{ category: 'land', score: 40 }]),
          matching(1, 3, [{ category: 'land', score: 10 }]),
          matching(1, 2, [{ category: 'land', score: 90 }]),
        ],
      });

      const [seeker] = result.members as PerCategoryMemberRecommendationsDTO[];
      expect(seeker.categories[0].matches.map((m) => m.memberId)).toEqual([
        2, 4, 5,
      ]);
    });

    it('never recommends a match without a positive matching result, whatever the culture', () => {
      const result = separation().rank({
        members: [
          { id: 1, cultureWeights: culture(100) },
          { id: 2, cultureWeights: culture(100) },
          { id: 3, cultureWeights: culture(100) },
          { id: 4, cultureWeights: culture(100) },
        ],
        matchings: [
          matching(1, 2, [{ category: 'land', score: 0 }]),
          matching(1, 3, [{ category: 'land', score: null }]),
          matching(1, 4, null),
        ],
      });

      expect(result.members[0]).toEqual({
        kind: 'per-category',
        seekerId: 1,
        categories: [],
      });
    });

    it('leaves the culture out of the score if one of both has no culture answers', () => {
      const result = separation().rank({
        members: [
          { id: 1, cultureWeights: culture(50) },
          { id: 2, cultureWeights: [] },
        ],
        matchings: [
          matching(1, 2, [{ category: 'land', score: 70 }]),
          matching(2, 1, [{ category: 'land', score: 30 }]),
        ],
      });

      const [first, second] =
        result.members as PerCategoryMemberRecommendationsDTO[];
      expect(first.categories[0].matches).toEqual([
        { memberId: 2, score: 70, matchingScore: 70, cultureScore: null },
      ]);
      expect(second.categories[0].matches).toEqual([
        { memberId: 1, score: 30, matchingScore: 30, cultureScore: null },
      ]);
    });

    it('ranks by matching result only with a 100 | 0 | 0 weighting', () => {
      const result = separation({ matching: 100, culture: 0, nep: 0 }).rank({
        members: [
          { id: 1, cultureWeights: culture(50) },
          { id: 2, cultureWeights: culture(0) },
        ],
        matchings: [matching(1, 2, [{ category: 'land', score: 70 }])],
      });

      const [seeker] = result.members as PerCategoryMemberRecommendationsDTO[];
      expect(seeker.categories[0].matches[0].score).toBe(70);
    });

    it('gives every member an entry, also without any matching', () => {
      const result = separation().rank({
        members: [{ id: 7, cultureWeights: [] }],
        matchings: [],
      });

      expect(result.members).toEqual([
        { kind: 'per-category', seekerId: 7, categories: [] },
      ]);
    });
  });

  describe('with max category', () => {
    it('ranks each potential match by its best category, in one list', () => {
      const result = maxCategory().rank({
        members: [
          { id: 1, cultureWeights: culture(50) },
          { id: 2, cultureWeights: culture(0) },
          { id: 3, cultureWeights: culture(100) },
          { id: 4, cultureWeights: culture(50) },
          { id: 5, cultureWeights: culture(50) },
        ],
        matchings: [
          matching(1, 2, [
            { category: 'premises', score: 60 },
            { category: 'competencies', score: 90 },
          ]),
          matching(1, 3, [
            { category: 'premises', score: 80 },
            { category: 'land', score: null },
          ]),
          matching(1, 4, [{ category: 'networks', score: 20 }]),
          matching(1, 5, [{ category: 'networks', score: 0 }]),
        ],
      });

      expect(result.strategy).toBe('max-category');
      expect(result.members[0]).toEqual({
        kind: 'overall',
        seekerId: 1,
        matches: [
          {
            memberId: 3,
            category: 'premises',
            score: 84,
            matchingScore: 80,
            cultureScore: 100,
          },
          {
            memberId: 2,
            category: 'competencies',
            score: 72,
            matchingScore: 90,
            cultureScore: 0,
          },
          {
            memberId: 4,
            category: 'networks',
            score: 26,
            matchingScore: 20,
            cultureScore: 50,
          },
        ],
      });
    });

    it('keeps the top 3 only', () => {
      const result = maxCategory().rank({
        members: [1, 2, 3, 4, 5].map((id) => ({
          id,
          cultureWeights: culture(50),
        })),
        matchings: [2, 3, 4, 5].map((id) =>
          matching(1, id, [{ category: 'land', score: id * 10 }]),
        ),
      });

      const [seeker] = result.members as OverallMemberRecommendationsDTO[];
      expect(seeker.matches.map((m) => m.memberId)).toEqual([5, 4, 3]);
    });
  });
});

describe('createRankingStrategy', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses category separation by default', () => {
    expect(createRankingStrategy({}).name).toBe('category-separation');
  });

  it('uses the strategy named in RANKING_STRATEGY', () => {
    expect(
      createRankingStrategy({ RANKING_STRATEGY: 'max-category' }).name,
    ).toBe('max-category');
  });

  it('falls back to the default for an unknown strategy', () => {
    expect(createRankingStrategy({ RANKING_STRATEGY: 'nope' }).name).toBe(
      'category-separation',
    );
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });
});
