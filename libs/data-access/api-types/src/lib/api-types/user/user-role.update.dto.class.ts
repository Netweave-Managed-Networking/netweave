import { IsIn } from 'class-validator';
import { USER_ROLES, UserRole } from './user-role.type';

export class UserRoleUpdateDTO {
  @IsIn(USER_ROLES)
  declare public role: UserRole;
}
