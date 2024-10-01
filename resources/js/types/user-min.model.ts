import { User } from './user.model';

export type UserMin = Pick<User, 'id' | 'name' | 'email'>;
