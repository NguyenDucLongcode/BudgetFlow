import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/user/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule, // Module for core chứ modal lõi như Config, Filter, Security, Guard

    InfrastructureModule, // Module for infrastructure chứ modal hạ tầng như Redis, Queue, Email, Prisma

    MonitoringModule, // Module for monitoring chứ modal giám sát như Health, Metrics

    // Các module khác (Auth, Users, ...)
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
