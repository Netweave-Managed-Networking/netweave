import { EntityDTO } from '../entity/entity.dto.interface';

export interface UserDTO extends EntityDTO {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}
