import { MemberUpsertDTO } from '../member/member.upsert.dto.class';

export interface InvitationTokenDTO {
  /** the member's confirmed email, or the invitation's while unanswered */
  email: string;
  /** requested new email, waiting for confirmation via the link mailed to it */
  pendingEmail: string | null;
  member: MemberUpsertDTO | null;
}
