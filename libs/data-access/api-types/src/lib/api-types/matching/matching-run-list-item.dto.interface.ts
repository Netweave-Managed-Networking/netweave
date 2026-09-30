import { EntityDTO } from '../entity/entity.dto.interface';

/** one entry in the run history: just enough to show when a run happened */
export interface MatchingRunListItemDTO
  extends Pick<EntityDTO, 'id' | 'createdAt'> {
  finishedAt: Date | null;
}
