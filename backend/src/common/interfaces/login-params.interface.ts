import { Response } from 'express';
import { User } from 'generated/prisma/client';
import { LanguageCode } from 'generated/prisma/enums';

export interface LoginParams {
  user: Omit<User, 'password'> & {
    preferences?: {
      language?: LanguageCode | string;
    } | null;
  };
  res: Response;
  deviceId: string;
  remember?: boolean;
  ipAddress?: string;
  userAgent?: string;
}
