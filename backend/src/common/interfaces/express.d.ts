/* eslint-disable @typescript-eslint/no-empty-object-type */

import { JwtPayload } from 'src/modules/auth/strategies/type';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

export {};
