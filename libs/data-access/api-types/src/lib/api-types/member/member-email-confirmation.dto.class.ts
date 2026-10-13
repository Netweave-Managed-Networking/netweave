import { IsNotEmpty, IsString } from 'class-validator';

export class MemberEmailConfirmationDTO {
  @IsString()
  @IsNotEmpty()
  declare public token: string;
}
