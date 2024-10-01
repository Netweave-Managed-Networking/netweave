import { UserRole } from './user-role.model';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  role: UserRole;
}
