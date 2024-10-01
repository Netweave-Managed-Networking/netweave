import { User } from './user.model';

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  error_message?: string | null;
  success_message?: string | null;
  auth: { user: User };
};
