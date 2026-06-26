// Nạp biến môi trường từ file .env
import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Khởi tạo Prisma Adapter cho PostgreSQL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Khởi tạo Prisma Client
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // Mã hóa mật khẩu mặc định
  const hashedPassword = await bcrypt.hash('Longxem1234@', 10);

  // Tạo tài khoản Admin
  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@gmail.com',
    },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      verifiedAt: new Date(),
    },
  });

  // Tạo tài khoản User
  const user = await prisma.user.upsert({
    where: {
      email: 'user@gmail.com',
    },
    update: {},
    create: {
      email: 'user@gmail.com',
      password: hashedPassword,
      name: 'User',
      role: 'USER',
      isActive: true,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Seed thành công!');
  console.log({
    admin,
    user,
  });
}

// Chạy seed
main()
  .catch((error) => {
    console.error('❌ Seed thất bại:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Đóng kết nối database
    await prisma.$disconnect();
  });
