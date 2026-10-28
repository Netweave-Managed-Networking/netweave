import {
  LIKERT_MAX,
  LikertAnswer,
  VIEW_OF_ENVIRONMENT_ITEM_IDS,
  VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS,
  ViewOfEnvironmentItemId,
} from '@netweave/api-types';
import { MemberViewOfEnvironmentAnswer } from '../../members/member-view-of-environment-answer.entity';

/**
 * the mean of all ten answers, between 0 and LIKERT_MAX, higher means more ecologically minded.
 * null unless all ten questions are answered, as a partial mean is not comparable with the one of other members
 */
export const toViewOfEnvironmentScore = (
  answers: Pick<MemberViewOfEnvironmentAnswer, 'itemId' | 'answer'>[],
): number | null => {
  const answerOf = new Map(
    answers.map(({ itemId, answer }) => [itemId, answer]),
  );

  const isComplete = VIEW_OF_ENVIRONMENT_ITEM_IDS.every((itemId) =>
    answerOf.has(itemId),
  );
  if (!isComplete) return null;

  let total = 0;
  for (const [itemId, answer] of answerOf) {
    total += scoreOf(itemId, answer);
  }

  return total / VIEW_OF_ENVIRONMENT_ITEM_IDS.length;
};

const scoreOf = (itemId: ViewOfEnvironmentItemId, answer: LikertAnswer) =>
  VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS.has(itemId)
    ? LIKERT_MAX - answer
    : answer;
