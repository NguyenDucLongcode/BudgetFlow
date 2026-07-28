import { AuthProvider } from 'generated/prisma/enums';

export interface SocialUser {
  email: string;
  name: string;
  picture?: string;
  providerId: string;
  provider: AuthProvider;
  deviceId?: string;
}
