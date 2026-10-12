import { IsNotEmpty, IsString } from 'class-validator';

export class EmailVerificationDTO {
  @IsString()
  @IsNotEmpty()
  declare public token: string;
}
