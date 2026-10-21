import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class MailConfigUpdateDTO {
  @IsNotEmpty()
  @IsString()
  declare public host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  declare public port: number;

  @IsBoolean()
  declare public secure: boolean;

  @IsOptional()
  @IsString()
  declare public authUser?: string;

  // omitted/undefined keeps the currently stored password, '' clears it
  @IsOptional()
  @IsString()
  declare public authPass?: string;

  @IsNotEmpty()
  @IsString()
  declare public fromName: string;

  @IsNotEmpty()
  @IsEmail()
  declare public fromAddress: string;
}
