import { IsEmail, IsNotEmpty } from 'class-validator';

export class MailConfigTestDTO {
  @IsNotEmpty()
  @IsEmail()
  declare public to: string;
}
