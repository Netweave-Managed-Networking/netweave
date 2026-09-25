import { EntityDTO } from '../entity/entity.dto.interface';

/** summary of a run; the matchings themselves can be too many to send at once */
export interface MatchingRunDTO extends EntityDTO {
  matchingCount: number;
}
