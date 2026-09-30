import { EntityDTO } from '../entity/entity.dto.interface';

/** one entry in the run history: just enough to show when a run happened and how many matchings it produced */
export interface MatchingRunListItemDTO
  extends Pick<EntityDTO, 'id' | 'createdAt'> {
  finishedAt: Date | null;
  failedAt: Date | null;
  matchingCount: number;
}
