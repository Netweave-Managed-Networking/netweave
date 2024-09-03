export type UserRole = 'admin' | 'editor';

export interface RegistrationCode {
  id: number;
  code: string;
  editor_id: number | null;
  admin_id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  role: UserRole;
}

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  auth: {
    user: User;
  };
};
