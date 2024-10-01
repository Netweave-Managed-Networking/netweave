export type UserRole = 'admin' | 'editor';

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
  error_message?: string | null;
  success_message?: string | null;
  auth: { user: User };
};
