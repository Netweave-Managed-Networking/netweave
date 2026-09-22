import { EntityDTO } from '../entity/entity.dto.interface';
import { UserDTO } from '../user/user.dto.interface';
import { InvitationCreateDTO } from './invitation.create.dto.class';

export type InvitationStatus = 'pending' | 'dispatched' | 'revoked' | 'failed';

export interface InvitationDTO extends EntityDTO, InvitationCreateDTO {
  invitedBy: UserDTO;
  expireDate: Date;
  answeredDate: Date | null;
  status: InvitationStatus;
}
