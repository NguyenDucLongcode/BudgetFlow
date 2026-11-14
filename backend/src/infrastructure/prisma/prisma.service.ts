import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Tạo Pool với cấu hình chi tiết
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,

      // Cấu hình connection pool
      max: parseInt(process.env.DATABASE_POOL_MAX || '10'), // Số kết nối tối đa
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'), // Số kết nối tối thiểu
      idleTimeoutMillis: parseInt(process.env.DATABASE_TIMEOUT || '30000'), // 30s
      connectionTimeoutMillis: parseInt(
        process.env.DATABASE_CONNECTION_TIMEOUT || '5000',
      ), // 5s

      // Optional: thêm cho production
      maxUses: 7500, // Số lần sử dụng tối đa cho mỗi kết nối
      keepAlive: true,

      // SSL cho production (nếu cần)
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });

    // Truyền pool đã tạo vào adapter
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to database');

    try {
      await this.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'UserPreference' AND column_name = 'language'
          ) THEN
            UPDATE "UserPreference" SET "language" = 'EN' WHERE "language"::text IN ('en', 'EN');
            UPDATE "UserPreference" SET "language" = 'VI' WHERE "language"::text IN ('vi', 'VI');
          END IF;
        END $$;
      `);
    } catch {
      // Ignored if table or enum doesn't exist yet
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔴 Prisma disconnected from database');
  }
}
