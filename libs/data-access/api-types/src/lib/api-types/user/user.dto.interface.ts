import { EntityDTO } from '../entity/entity.dto.interface';
import { UserRole } from './user-role.type';

export interface UserDTO extends EntityDTO {
  email: string;
  role: UserRole;
}
