import { createHash } from 'crypto';
import { Member } from '../members/member.entity';

/** members that have not entered any resource or requirement cannot match anyone, nor can anyone match them */
export const hasAnswers = (member: Member): boolean =>
  member.resourcesRequirements?.some(
    ({ resources, requirements }) =>
      !!resources?.trim() || !!requirements?.trim(),
  ) ?? false;

/**
 * fingerprint of everything the matching depends on; a run with the same hash as the previous one would produce the same matchings.
 * must be extended when the matching strategy starts using further member data.
 */
export const hashMatchingInput = (members: Member[]): string => {
  const input = [...members]
    .sort((a, b) => a.id - b.id)
    .map((member) => [
      member.id,
      (member.resourcesRequirements ?? [])
        .map((rr) => [rr.category, rr.resources, rr.requirements])
        .sort(([a], [b]) => String(a).localeCompare(String(b))),
    ]);
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
};
