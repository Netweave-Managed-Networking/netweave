import { IsEmailOrDomain } from '@netweave/utils';
import { IsNotEmpty } from 'class-validator';

export class UserEmailWhitelistCreateDTO {
  @IsNotEmpty()
  @IsEmailOrDomain()
  declare public emailOrDomain: string;
}
