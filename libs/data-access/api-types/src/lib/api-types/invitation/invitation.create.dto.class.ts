import { IsEmail, IsNotEmpty } from 'class-validator';

export class InvitationCreateDTO {
  @IsNotEmpty()
  @IsEmail()
  declare public email: string;
}
