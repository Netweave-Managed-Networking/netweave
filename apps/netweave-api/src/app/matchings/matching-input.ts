import { Member } from '../members/member.entity';

/** members that have not entered any resource or requirement cannot match anyone, nor can anyone match them */
export const hasAnswers = (member: Member): boolean =>
  member.resourcesRequirements?.some(
    ({ resources, requirements }) =>
      !!resources?.trim() || !!requirements?.trim(),
  ) ?? false;
