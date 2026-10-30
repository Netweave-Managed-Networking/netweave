import { ViewOfNature } from '@netweave/api-types';
import { Member } from '../../members/member.entity';
import { CultureProfile, toCultureProfile } from './culture-profile';
import { toViewOfEnvironmentScore } from './view-of-environment-score';

/** what the ranking compares of a member, calculated from its current answers on every run */
export interface MemberProfile {
  culture: CultureProfile | null;
  viewOfEnvironmentScore: number | null;
  viewOfNature: ViewOfNature | null;
}

export const toMemberProfiles = (
  members: Pick<
    Member,
    'id' | 'cultureWeights' | 'viewOfEnvironmentAnswers' | 'viewOfNature'
  >[],
): Map<number, MemberProfile> =>
  new Map(
    members.map(
      ({ id, cultureWeights, viewOfEnvironmentAnswers, viewOfNature }) => [
        id,
        {
          culture: toCultureProfile(cultureWeights ?? []),
          viewOfEnvironmentScore: toViewOfEnvironmentScore(
            viewOfEnvironmentAnswers ?? [],
          ),
          viewOfNature,
        },
      ],
    ),
  );
