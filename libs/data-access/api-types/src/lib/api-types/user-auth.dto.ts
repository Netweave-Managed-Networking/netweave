import { UserDTO } from './user.dto';

export type UserAuthDTO = {
  sub: number;
  user: UserDTO;
};
