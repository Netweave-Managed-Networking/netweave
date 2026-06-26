import { UserAuthDTO } from '@netweave/api-types';

declare global {
  namespace Express {
    interface Request {
      user?: UserAuthDTO;
    }
  }
}
