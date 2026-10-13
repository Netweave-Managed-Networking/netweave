import {
  CategoryRankedMatchDTO,
  MatchingDetailsDTO,
  MemberRecommendationsDTO,
  RankedMatchDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
} from '@netweave/api-types';

export const TOP_MATCHES_COUNT = 3;

type CategoryScore = MatchingDetailsDTO['categories'][number];

interface CategoryMatch {
  category: ResourceRequirementCategory;
  score: number;
}

export interface RankingCandidate {
  memberId: number;
  categories: CategoryScore[];
  cultureScore: number | null;
}

export type OverallScore = (
  matchingScore: number,
  cultureScore: number | null,
) => number;

export interface CategoryMatching {
  recommend(
    seekerId: number,
    candidates: RankingCandidate[],
    overallScore: OverallScore,
  ): MemberRecommendationsDTO;
}

export class CategorySeparationMatching implements CategoryMatching {
  public recommend(
    seekerId: number,
    candidates: RankingCandidate[],
    overallScore: OverallScore,
  ): MemberRecommendationsDTO {
    const matchesByCategory = new Map<
      ResourceRequirementCategory,
      RankedMatchDTO[]
    >();

    for (const candidate of candidates) {
      for (const { category, score } of matchedCategories(candidate)) {
        const matches = matchesByCategory.get(category) ?? [];
        matches.push(toRankedMatch(candidate, score, overallScore));
        matchesByCategory.set(category, matches);
      }
    }

    const categories = RESOURCE_REQUIREMENT_CATEGORIES.filter((category) =>
      matchesByCategory.has(category),
    ).map((category) => ({
      category,
      matches: topMatches(matchesByCategory.get(category) ?? []),
    }));

    return { kind: 'per-category', seekerId, categories };
  }
}

export class MaxCategoryMatching implements CategoryMatching {
  public recommend(
    seekerId: number,
    candidates: RankingCandidate[],
    overallScore: OverallScore,
  ): MemberRecommendationsDTO {
    const matches: CategoryRankedMatchDTO[] = [];

    for (const candidate of candidates) {
      const best = bestCategory(candidate);
      if (!best) continue;

      matches.push({
        ...toRankedMatch(candidate, best.score, overallScore),
        category: best.category,
      });
    }

    return { kind: 'overall', seekerId, matches: topMatches(matches) };
  }
}

// culture alone is no reason to connect, so only categories with an actual matching result count
const matchedCategories = ({ categories }: RankingCandidate): CategoryMatch[] =>
  categories.filter(
    (category): category is CategoryMatch =>
      category.score !== null && category.score > 0,
  );

// the sort is stable, so on a tie the first category wins
const bestCategory = (candidate: RankingCandidate): CategoryMatch | null => {
  const [best] = matchedCategories(candidate).sort((a, b) => b.score - a.score);
  return best ?? null;
};

const toRankedMatch = (
  { memberId, cultureScore }: RankingCandidate,
  matchingScore: number,
  overallScore: OverallScore,
): RankedMatchDTO => ({
  memberId,
  score: overallScore(matchingScore, cultureScore),
  matchingScore,
  cultureScore,
});

const topMatches = <T extends RankedMatchDTO>(matches: T[]): T[] =>
  [...matches]
    .sort((a, b) => b.score - a.score || a.memberId - b.memberId)
    .slice(0, TOP_MATCHES_COUNT);
