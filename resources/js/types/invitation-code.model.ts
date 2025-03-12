import { UserMin } from './user-min.model';
import { User } from './user.model';

export interface InvitationCode {
  id: number;
  code: string;
  editor_id: User['id'] | null;
  editor: UserMin | null;
  admin_id: User['id'];
  admin: UserMin;
  created_at: string;
  updated_at: string;
}
