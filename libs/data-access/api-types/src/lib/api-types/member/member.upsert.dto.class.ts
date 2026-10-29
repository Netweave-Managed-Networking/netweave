import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import { CULTURE_ORIENTATIONS, CULTURE_TOPICS } from './culture.type';
import { MemberCultureWeightUpsertDTO } from './member-culture-weight.upsert.dto.class';
import { MemberResourceRequirementUpsertDTO } from './member-resource-requirement.upsert.dto.class';
import { MemberViewOfEnvironmentAnswerUpsertDTO } from './member-view-of-environment-answer.upsert.dto.class';
import { VIEW_OF_NATURE_OPTIONS, ViewOfNature } from './view-of-nature.type';

// weights are normalized by their topic's total, so a topic needs all of them and must not total 0
const hasCompleteOrientationsPerTopic = (items: unknown): boolean =>
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

  /** a different email than the stored one is only taken over once confirmed via the link mailed to it */
  @IsEmail()
  declare public email: string;

  @IsArray()
  // each category at most once, as it is stored as one row per category
  @ArrayUnique((item: MemberResourceRequirementUpsertDTO) => item.category)
  @ValidateNested({ each: true })
  @Type(() => MemberResourceRequirementUpsertDTO)
  declare public resourcesRequirements: MemberResourceRequirementUpsertDTO[];

  @IsArray()
  @ArrayUnique((item: MemberCultureWeightUpsertDTO) => item.itemId)
  @ValidateBy({
    name: 'hasCompleteOrientationsPerTopic',
    validator: {
      validate: hasCompleteOrientationsPerTopic,
      defaultMessage: () =>
        'each culture topic needs either no weights or all four, not all of them 0',
    },
  })
  @ValidateNested({ each: true })
  @Type(() => MemberCultureWeightUpsertDTO)
  declare public cultureWeights: MemberCultureWeightUpsertDTO[];

  /** answered questions only, unanswered ones keep their stored answer */
  @IsArray()
  @ArrayUnique((item: MemberViewOfEnvironmentAnswerUpsertDTO) => item.itemId)
  @ValidateNested({ each: true })
  @Type(() => MemberViewOfEnvironmentAnswerUpsertDTO)
  declare public viewOfEnvironmentAnswers: MemberViewOfEnvironmentAnswerUpsertDTO[];

  /** null while unanswered, which keeps the stored answer */
  @IsOptional()
  @IsIn(VIEW_OF_NATURE_OPTIONS)
  declare public viewOfNature: ViewOfNature | null;
}
