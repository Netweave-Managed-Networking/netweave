import { Member } from '../../members/member.entity';
import { CultureProfile, toCultureProfile } from './culture-profile';
import { toViewOfEnvironmentScore } from './view-of-environment-score';

/** what the ranking compares of a member, calculated from its current answers on every run */
export interface MemberProfile {
  culture: CultureProfile | null;
  // not weighted in the ranking score until NETW-57
  viewOfEnvironmentScore: number | null;
}

export const toMemberProfiles = (
  members: Pick<Member, 'id' | 'cultureWeights' | 'viewOfEnvironmentAnswers'>[],
): Map<number, MemberProfile> =>
  new Map(
    members.map(({ id, cultureWeights, viewOfEnvironmentAnswers }) => [
      id,
      {
        culture: toCultureProfile(cultureWeights ?? []),
        viewOfEnvironmentScore: toViewOfEnvironmentScore(
          viewOfEnvironmentAnswers ?? [],
        ),
      },
    ]),
  );
