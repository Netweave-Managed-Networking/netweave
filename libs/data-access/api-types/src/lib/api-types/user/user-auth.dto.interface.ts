import { UserDTO } from './user.dto.interface';

export interface UserAuthDTO {
  sub: number;
  user: UserDTO;
}
