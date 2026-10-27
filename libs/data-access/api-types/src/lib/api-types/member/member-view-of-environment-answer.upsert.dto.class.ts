import { IsIn } from 'class-validator';
import { LIKERT_ANSWERS, LikertAnswer } from './likert.type';
import {
  VIEW_OF_ENVIRONMENT_ITEM_IDS,
  ViewOfEnvironmentItemId,
} from './view-of-environment.type';

export class MemberViewOfEnvironmentAnswerUpsertDTO {
  @IsIn(VIEW_OF_ENVIRONMENT_ITEM_IDS)
  declare public itemId: ViewOfEnvironmentItemId;

  @IsIn(LIKERT_ANSWERS)
  declare public answer: LikertAnswer;
}
