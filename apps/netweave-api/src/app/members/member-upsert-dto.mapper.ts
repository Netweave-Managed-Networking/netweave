import { InvitationTokenDTO, MemberUpsertDTO } from '@netweave/api-types';
import { Invitation } from '../invitations/invitation.entity';
import { Member } from './member.entity';

export const toMemberUpsertDTO = (member: Member): MemberUpsertDTO => ({
  name: member.name,
  contact: member.contact,
  email: member.email ?? '',
  resourcesRequirements: (member.resourcesRequirements ?? []).map(
    ({ category, resources, requirements }) => ({
      category,
      resources,
      requirements,
    }),
  ),
  cultureWeights: (member.cultureWeights ?? []).map(({ itemId, weight }) => ({
    itemId,
    weight,
  })),
  viewOfEnvironmentAnswers: (member.viewOfEnvironmentAnswers ?? []).map(
    ({ itemId, answer }) => ({ itemId, answer }),
  ),
});

/** what the questionnaire of an invitation shows: the member's emails and answers, if already saved */
export const toInvitationTokenDTO = (
  invitation: Pick<Invitation, 'email'>,
  member: Member | null | undefined,
): InvitationTokenDTO => ({
  email: member?.email ?? invitation.email,
  pendingEmail: member?.pendingEmail ?? null,
  member: member ? toMemberUpsertDTO(member) : null,
});
