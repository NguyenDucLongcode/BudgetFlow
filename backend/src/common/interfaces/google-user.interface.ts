export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  providerId: string;
  provider: 'google';
  deviceId?: string;
}
