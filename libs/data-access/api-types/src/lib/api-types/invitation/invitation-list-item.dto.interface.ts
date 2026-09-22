import { EntityDTO } from '../entity/entity.dto.interface';
import { InvitationCreateDTO } from './invitation.create.dto.class';

export type InvitationDisplayStatus =
  | 'pending'
  | 'dispatched'
  | 'failed'
  | 'expired'
  | 'answered';

export interface InvitationListItemDTO
  extends Pick<EntityDTO, 'id' | 'createdAt'>,
    InvitationCreateDTO {
  status: InvitationDisplayStatus;
}
