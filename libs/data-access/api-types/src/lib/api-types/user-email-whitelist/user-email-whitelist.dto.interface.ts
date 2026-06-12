import { EntityDTO } from '../entity/entity.dto.interface';
import { UserDTO } from '../user/user.dto.interface';
import { UserEmailWhitelistCreateDTO } from './user-email-whitelist.create.dto.class';

export interface UserEmailWhitelistDTO
  extends EntityDTO,
    UserEmailWhitelistCreateDTO {
  createdBy: UserDTO;
}
