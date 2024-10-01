import { UserMin } from './user-min.model';

export interface InvitationCode {
  id: number;
  code: string;
  editor_id: number | null;
  editor: UserMin | null;
  admin_id: number;
  admin: UserMin;
  created_at: string;
  updated_at: string;
}
