import { EntityDTO } from '../entity/entity.dto.interface';
import { UserRole } from './user-role.type';

export interface UserDTO extends EntityDTO {
  email: string;
  role: UserRole;
  /**
   * the one account responsible for the instance. The owner always has the 'admin' role
   * and can neither be removed nor have their role changed by other users.
   */
  isOwner: boolean;
}
