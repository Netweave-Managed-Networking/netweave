import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import {
  LIKERT_MAX,
  MatchingDetailsDTO,
  OverallMemberRecommendationsDTO,
  PerCategoryMemberRecommendationsDTO,
  RankingWeightsDTO,
  VIEW_OF_ENVIRONMENT_ITEM_IDS,
  VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS,
  ViewOfNature,
} from '@netweave/api-types';
import { Logger } from '@nestjs/common';
import { MemberCultureWeight } from '../../members/member-culture-weight.entity';
import { MemberViewOfEnvironmentAnswer } from '../../members/member-view-of-environment-answer.entity';
import {
  CategorySeparationMatching,
  MaxCategoryMatching,
} from './category-matching';
import { CultureWeighting } from './culture-weighting';
import { createRankingStrategy } from './ranking-strategies';
import { ComposedRankingStrategy, RankingInput } from './ranking-strategy';

// the world view is left out here, so the culture is easy to follow; it has tests of its own below
const WEIGHTS: RankingWeightsDTO = {
  matching: 80,
  culture: 20,
  viewOfEnvironment: 0,
  viewOfNature: 0,
  nep: 0,
};

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
          { id: 1, cultureWeights: culture(50), viewOfNature: null },
          { id: 2, cultureWeights: culture(100), viewOfNature: null },
          { id: 3, cultureWeights: culture(0), viewOfNature: null },
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
              {
                memberId: 2,
                rankingScore: 92,
                matchingScore: 90,
                cultureScore: 100,
                viewOfEnvironmentScore: null,
                viewOfNatureScore: null,
              },
              {
                memberId: 3,
                rankingScore: 8,
                matchingScore: 10,
                cultureScore: 0,
                viewOfEnvironmentScore: null,
                viewOfNatureScore: null,
              },
            ],
          },
          {
            category: 'premises',
            matches: [
              {
                memberId: 2,
                rankingScore: 60,
                matchingScore: 50,
                cultureScore: 100,
                viewOfEnvironmentScore: null,
                viewOfNatureScore: null,
              },
              {
                memberId: 3,
                rankingScore: 56,
                matchingScore: 70,
                cultureScore: 0,
                viewOfEnvironmentScore: null,
                viewOfNatureScore: null,
              },
            ],
          },
        ],
      });
    });

    it('keeps the top 3 only, ties ordered by member id', () => {
      const members = [1, 2, 3, 4, 5].map((id) => ({
        id,
        cultureWeights: culture(50),
        viewOfNature: null,
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
          { id: 1, cultureWeights: culture(100), viewOfNature: null },
          { id: 2, cultureWeights: culture(100), viewOfNature: null },
          { id: 3, cultureWeights: culture(100), viewOfNature: null },
          { id: 4, cultureWeights: culture(100), viewOfNature: null },
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
          { id: 1, cultureWeights: culture(50), viewOfNature: null },
          { id: 2, cultureWeights: [], viewOfNature: null },
        ],
        matchings: [
          matching(1, 2, [{ category: 'land', score: 70 }]),
          matching(2, 1, [{ category: 'land', score: 30 }]),
        ],
      });

      const [first, second] =
        result.members as PerCategoryMemberRecommendationsDTO[];
      expect(first.categories[0].matches).toEqual([
        {
          memberId: 2,
          rankingScore: 70,
          matchingScore: 70,
          cultureScore: null,
          viewOfEnvironmentScore: null,
          viewOfNatureScore: null,
        },
      ]);
      expect(second.categories[0].matches).toEqual([
        {
          memberId: 1,
          rankingScore: 30,
          matchingScore: 30,
          cultureScore: null,
          viewOfEnvironmentScore: null,
          viewOfNatureScore: null,
        },
      ]);
    });

    it('ranks by matching result only with a 100 | 0 | 0 weighting', () => {
      const result = separation({
        ...WEIGHTS,
        matching: 100,
        culture: 0,
      }).rank({
        members: [
          { id: 1, cultureWeights: culture(50), viewOfNature: null },
          { id: 2, cultureWeights: culture(0), viewOfNature: null },
        ],
        matchings: [matching(1, 2, [{ category: 'land', score: 70 }])],
      });

      const [seeker] = result.members as PerCategoryMemberRecommendationsDTO[];
      expect(seeker.categories[0].matches[0].rankingScore).toBe(70);
    });

    it('gives every member an entry, also without any matching', () => {
      const result = separation().rank({
        members: [{ id: 7, cultureWeights: [], viewOfNature: null }],
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
          { id: 1, cultureWeights: culture(50), viewOfNature: null },
          { id: 2, cultureWeights: culture(0), viewOfNature: null },
          { id: 3, cultureWeights: culture(100), viewOfNature: null },
          { id: 4, cultureWeights: culture(50), viewOfNature: null },
          { id: 5, cultureWeights: culture(50), viewOfNature: null },
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
            rankingScore: 84,
            matchingScore: 80,
            cultureScore: 100,
            viewOfEnvironmentScore: null,
            viewOfNatureScore: null,
          },
          {
            memberId: 2,
            category: 'competencies',
            rankingScore: 72,
            matchingScore: 90,
            cultureScore: 0,
            viewOfEnvironmentScore: null,
            viewOfNatureScore: null,
          },
          {
            memberId: 4,
            category: 'networks',
            rankingScore: 26,
            matchingScore: 20,
            cultureScore: 50,
            viewOfEnvironmentScore: null,
            viewOfNatureScore: null,
          },
        ],
      });
    });

    it('keeps the top 3 only', () => {
      const result = maxCategory().rank({
        members: [1, 2, 3, 4, 5].map((id) => ({
          id,
          cultureWeights: culture(50),
          viewOfNature: null,
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

/** answers giving exactly the given view of environment score, the reversed questions answered inversely */
const viewOfEnvironment = (score: number): MemberViewOfEnvironmentAnswer[] =>
  VIEW_OF_ENVIRONMENT_ITEM_IDS.map((itemId) => ({
    itemId,
    answer: VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS.has(itemId)
      ? LIKERT_MAX - score
      : score,
  })) as MemberViewOfEnvironmentAnswer[];

describe('ComposedRankingStrategy with the ecological world view', () => {
  const worldViewWeights: RankingWeightsDTO = {
    matching: 80,
    culture: 10,
    viewOfEnvironment: 5,
    viewOfNature: 5,
    nep: 0,
  };
  const strategy = separation(worldViewWeights);

  const member = (
    id: number,
    g: number,
    viewOfEnvironmentScore: number,
    viewOfNature: ViewOfNature | null,
  ) => ({
    id,
    cultureWeights: culture(g),
    viewOfEnvironmentAnswers: viewOfEnvironment(viewOfEnvironmentScore),
    viewOfNature,
  });

  const matchesOf = (members: ReturnType<typeof member>[], score = 50) => {
    const result = strategy.rank({
      members,
      matchings: members
        .slice(1)
        .map(({ id }) => matching(1, id, [{ category: 'land', score }])),
    });

    const [seeker] = result.members as PerCategoryMemberRecommendationsDTO[];
    return seeker.categories[0].matches;
  };

  it('weights 80% matching, 10% culture, 5% view of environment and 5% view of nature', () => {
    const [match] = matchesOf([
      member(1, 50, 3, 'fragile'),
      member(2, 100, 2, 'fragile'),
    ]);

    expect(match).toEqual({
      memberId: 2,
      // 0.8 * 50 + 0.1 * 100 + 0.05 * 75 + 0.05 * 100
      rankingScore: 58.75,
      matchingScore: 50,
      cultureScore: 100,
      viewOfEnvironmentScore: 75,
      viewOfNatureScore: 100,
    });
  });

  it('lets a different world view lower the score by 10 points at most, without excluding the match', () => {
    const [match] = matchesOf(
      [member(1, 50, 4, 'robust'), member(2, 100, 0, 'unpredictable')],
      100,
    );

    expect(match).toMatchObject({
      rankingScore: 90,
      viewOfEnvironmentScore: 0,
      viewOfNatureScore: 0,
    });
  });

  it('prefers the potential match with the same world view on an equal matching result', () => {
    const matches = matchesOf([
      member(1, 50, 3, 'fragile'),
      member(2, 50, 1, 'robust'),
      member(3, 50, 3, 'fragile'),
    ]);

    expect(matches.map(({ memberId }) => memberId)).toEqual([3, 2]);
  });

  it('leaves the view of nature out of the score if one of both has not chosen one', () => {
    const [match] = matchesOf([
      member(1, 50, 3, null),
      member(2, 100, 2, 'fragile'),
    ]);

    expect(match.viewOfNatureScore).toBeNull();
    expect(match.rankingScore).toBeCloseTo(
      (80 * 50 + 10 * 100 + 5 * 75) / 95,
      10,
    );
  });

  it('leaves the view of environment out of the score if one of both has not answered all questions', () => {
    const [match] = matchesOf([
      member(1, 50, 3, 'fragile'),
      { ...member(2, 100, 2, 'fragile'), viewOfEnvironmentAnswers: [] },
    ]);

    expect(match.viewOfEnvironmentScore).toBeNull();
    expect(match.rankingScore).toBeCloseTo(
      (80 * 50 + 10 * 100 + 5 * 100) / 95,
      10,
    );
  });

  it('compares a view of environment score of 0 instead of treating it as missing', () => {
    const [match] = matchesOf([
      member(1, 50, 0, 'fragile'),
      member(2, 100, 0, 'fragile'),
    ]);

    expect(match.viewOfEnvironmentScore).toBe(100);
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

  it.each(['category-separation', 'max-category'])(
    'weights %s by 80% matching, 10% culture and 10% world view, split equally',
    (RANKING_STRATEGY) => {
      const result = createRankingStrategy({ RANKING_STRATEGY }).rank({
        members: [],
        matchings: [],
      });

      expect(result.weights).toEqual({
        matching: 80,
        culture: 10,
        viewOfEnvironment: 5,
        viewOfNature: 5,
        nep: 0,
      });
    },
  );

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
