import type { UserPayload } from '../auth/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
