import { Role } from 'generated/prisma/enums';

export const USERS = {
  ADMIN: {
    email: 'admin@gmail.com',
    password: 'Longxem1234@',
    name: 'Admin',
    role: Role.ADMIN,
  },

  USER: {
    email: 'user@gmail.com',
    password: 'Longxem1234@',
    name: 'User',
    role: Role.USER,
  },
} as const;
