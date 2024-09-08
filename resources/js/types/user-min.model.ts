import { User } from '.';

export type UserMin = Pick<User, 'id' | 'name' | 'email'>;
