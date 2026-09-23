import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MemberUpsertDTO {
  @IsNotEmpty()
  @IsString()
  declare public name: string;

  @IsOptional()
  @IsString()
  declare public contact: string | null;
}
