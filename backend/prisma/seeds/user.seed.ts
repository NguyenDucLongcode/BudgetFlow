import * as bcrypt from 'bcrypt';

import { USERS } from './constants/user.constant';
import { SeedContext } from './context';

export async function seedUsers(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding users...');

  const prisma = context.prisma;

  const hashedPassword = await bcrypt.hash(USERS.ADMIN.password, 10);

  const admin = await prisma.user.upsert({
    where: {
      email: USERS.ADMIN.email,
    },
    update: {},
    create: {
      email: USERS.ADMIN.email,
      password: hashedPassword,
      name: USERS.ADMIN.name,
      role: USERS.ADMIN.role,
      verifiedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: USERS.USER.email,
    },
    update: {},
    create: {
      email: USERS.USER.email,
      password: hashedPassword,
      name: USERS.USER.name,
      role: USERS.USER.role,
      verifiedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  // Lưu vào context để các seed khác dùng
  context.users.admin = admin;
  context.users.user = user;

  console.log('✅ Users seeded');
}
