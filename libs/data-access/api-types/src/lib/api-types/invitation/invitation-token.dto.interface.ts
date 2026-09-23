import { MemberUpsertDTO } from '../member/member.upsert.dto.class';

export interface InvitationTokenDTO {
  email: string;
  member: MemberUpsertDTO | null;
}
