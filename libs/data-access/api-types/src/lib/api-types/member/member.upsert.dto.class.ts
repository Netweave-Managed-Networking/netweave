import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import { CULTURE_ORIENTATIONS, CULTURE_TOPICS } from './culture.type';
import { MemberCultureWeightUpsertDTO } from './member-culture-weight.upsert.dto.class';
import { MemberResourceRequirementUpsertDTO } from './member-resource-requirement.upsert.dto.class';

// weights are normalized by their topic's total, so a topic needs all of them and must not total 0
const hasCompleteCultureTopics = (items: unknown): boolean =>
  Array.isArray(items) &&
  CULTURE_TOPICS.every((topic) => {
    const weights = items
      .filter((item) => String(item?.itemId).startsWith(`${topic}-`))
      .map((item) => Number(item.weight));
    const total = weights.reduce((sum, weight) => sum + weight, 0);

    const unanswered = weights.length === 0;
    const complete = weights.length === CULTURE_ORIENTATIONS.length;
    return unanswered || (complete && total > 0);
  });

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

  @IsArray()
  @ArrayUnique((item: MemberCultureWeightUpsertDTO) => item.itemId)
  @ValidateBy({
    name: 'hasCompleteCultureTopics',
    validator: {
      validate: hasCompleteCultureTopics,
      defaultMessage: () =>
        'each culture topic needs either no weights or all four, not all of them 0',
    },
  })
  @ValidateNested({ each: true })
  @Type(() => MemberCultureWeightUpsertDTO)
  declare public cultureWeights: MemberCultureWeightUpsertDTO[];
}
