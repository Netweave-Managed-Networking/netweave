import { ResourceRequirementCategory } from '../member/resource-requirement-category.type';

export interface RankingWeightsDTO {
  matching: number;
  culture: number;
  nep: number;
}

/** all scores range from 0 to 100 */
export interface RankedMatchDTO {
  memberId: number;
  score: number;
  matchingScore: number;
  cultureScore: number | null; // null if one of both has no culture answers
}

export interface CategoryRankedMatchDTO extends RankedMatchDTO {
  category: ResourceRequirementCategory;
}

export interface PerCategoryMemberRecommendationsDTO {
  kind: 'per-category';
  seekerId: number;
  categories: {
    category: ResourceRequirementCategory;
    matches: RankedMatchDTO[];
  }[];
}

export interface OverallMemberRecommendationsDTO {
  kind: 'overall';
  seekerId: number;
  matches: CategoryRankedMatchDTO[];
}

export type MemberRecommendationsDTO =
  | PerCategoryMemberRecommendationsDTO
  | OverallMemberRecommendationsDTO;

export interface RecommendationsDTO {
  strategy: string;
  weights: RankingWeightsDTO;
  members: MemberRecommendationsDTO[];
}
