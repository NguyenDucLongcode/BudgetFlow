import { Response } from 'express';
import { User } from 'generated/prisma/client';

export interface LoginParams {
  user: Omit<User, 'password'>;
  res: Response;
  deviceId: string;
  remember?: boolean;
  ipAddress?: string;
  userAgent?: string;
}
