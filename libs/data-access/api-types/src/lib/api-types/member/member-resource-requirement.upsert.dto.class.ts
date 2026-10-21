import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
} from './resource-requirement-category.type';

export class MemberResourceRequirementUpsertDTO {
  @IsIn(RESOURCE_REQUIREMENT_CATEGORIES)
  declare public category: ResourceRequirementCategory;

  @IsOptional()
  @IsString()
  declare public resources: string | null;

  @IsOptional()
  @IsString()
  declare public requirements: string | null;
}
