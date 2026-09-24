import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MemberResourceRequirementUpsertDTO } from './member-resource-requirement.upsert.dto.class';

export class MemberUpsertDTO {
  @IsNotEmpty()
  @IsString()
  declare public name: string;

  @IsOptional()
  @IsString()
  declare public contact: string | null;

  @IsArray()
  // each category at most once, as it is stored as one row per category
  @ArrayUnique((item: MemberResourceRequirementUpsertDTO) => item.category)
  @ValidateNested({ each: true })
  @Type(() => MemberResourceRequirementUpsertDTO)
  declare public resourcesRequirements: MemberResourceRequirementUpsertDTO[];
}
