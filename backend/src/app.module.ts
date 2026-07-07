import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthModule } from 'src/modules/health/health.module';
import { UsersModule } from 'src/modules/user/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from 'src/modules/auth/strategies/guards/jwt-Auth.guard';
import { RedisModule } from './modules/redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { BullModule } from '@nestjs/bullmq';
import { CleanupModule } from './jobs/cleanup/cleanup.module';
import { envValidationSchema } from './common/configs/env.validation';
import { configuration } from 'src/common/configs';
import { PoliciesGuard } from 'src/casl/policies/policies.guard';
import { CaslModule } from './casl/casl.module';
import { PrometheusModule } from 'src/modules/prometheus/prometheus.module';
import { CsrfGuard, CsrfModule } from './common/security/csrf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: envValidationSchema,
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('app.redis.host'),
          port: config.get<number>('app.redis.port'),
          password: config.get<string>('app.redis.password'),
        },
      }),
    }),

    PrismaModule, // Database
    PrometheusModule, // Prometheus metrics
    CleanupModule,
    CsrfModule, // CSRF protection
    HealthModule, // Health check
    EmailModule,
    CaslModule,
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
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
})
export class AppModule {}
