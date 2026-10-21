import { IsEmail } from 'class-validator';

export class EmailVerificationResendDTO {
  @IsEmail()
  declare public email: string;
}
