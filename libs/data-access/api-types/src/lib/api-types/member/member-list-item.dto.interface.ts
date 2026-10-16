import { EntityDTO } from '../entity/entity.dto.interface';
import { MemberDTO } from './member.dto.interface';

/** a member as listed in the member overview; meant to grow by further general data later */
export interface MemberListItemDTO
  extends Pick<EntityDTO, 'id'>,
    Pick<MemberDTO, 'name'> {
  email: string | null; // null only for members whose invitation was deleted before emails were stored
}
