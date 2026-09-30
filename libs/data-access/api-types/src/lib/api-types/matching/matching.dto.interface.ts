import { EntityDTO } from '../entity/entity.dto.interface';
import { ResourceRequirementCategory } from '../member/resource-requirement-category.type';

/** how the score came about; will grow with the real matching algorithm */
export interface MatchingDetailsDTO {
  categories: { category: ResourceRequirementCategory; score: number }[];
}

/** unidirectional: how well the potential match fits the seeker (0-100) */
export interface MatchingDTO extends EntityDTO {
  matchingRunId: number;
  memberSeekerId: number;
  memberPotentialMatchId: number;
  score: number;
  details: MatchingDetailsDTO | null;
}
