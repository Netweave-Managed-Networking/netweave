import { IdName } from './id-name.model';
import { UserRole } from './user-role.model';

export interface User extends IdName {
  email: string;
  email_verified_at: string;
  role: UserRole;
}
