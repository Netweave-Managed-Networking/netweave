import { IsEmailOrDomain } from '@netweave/utils';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { USER_ROLES, UserRole } from '../user/user-role.type';

export class UserEmailWhitelistCreateDTO {
  @IsNotEmpty()
  @IsEmailOrDomain()
  declare public emailOrDomain: string;

  /** role a user receives when registering via this entry; defaults to 'viewer' */
  @IsOptional()
  @IsIn(USER_ROLES)
  declare public role?: UserRole;
}
