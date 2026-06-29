import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthModule } from 'src/modules/health/health.module';
import { UsersModule } from 'src/modules/user/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from 'src/modules/auth/strategies/guards/jwt-Auth.guard';
import { RedisModule } from './modules/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // monitoring
    PrometheusModule.register({
      path: '/metrics', // Endpoint metrics
      defaultMetrics: {
        enabled: true, // Lấy các metrics mặc định: CPU, RAM, heap...
      },
    }),

    // Database
    PrismaModule,

    // Health check
    HealthModule,
    EmailModule,

    // Các module khác (Auth, Users, ...)
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
})
export class AppModule {}
