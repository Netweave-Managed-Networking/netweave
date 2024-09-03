import { User } from '.';

export interface RegistrationCode {
  id: number;
  code: string;
  editor_id: number | null;
  editor: Pick<User, 'id' | 'name' | 'email'> | null;
  admin_id: number;
  admin: Pick<User, 'id' | 'name' | 'email'>;
  created_at: string;
  updated_at: string;
}
