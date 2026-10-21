import { EntityDTO } from '../entity/entity.dto.interface';
import { MemberDTO } from '../member/member.dto.interface';

export type MemberChangeItemDTO = Pick<EntityDTO, 'id'> &
  Pick<MemberDTO, 'name'>;

/**
 * members that joined or changed their data since the latest successful matching run; each member is listed in at
 * most one of both lists, a new member that also changed its data afterwards only counts as new
 */
export interface MemberChangesSinceMatchingDTO {
  since: Date | null; // start of the latest successful run; null if there was none yet, all members count as new then
  newMembers: MemberChangeItemDTO[];
  updatedMembers: MemberChangeItemDTO[];
}
