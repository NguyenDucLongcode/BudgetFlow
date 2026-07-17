import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { FilterModule } from './filters/filter.module';
import { SecurityModule } from './security/security.module';
import { GuardModule } from './guards/guard.module';
import { InterceptorModule } from './interceptor/interceptor.module';

@Module({
  imports: [
    AppConfigModule,
    FilterModule,
    SecurityModule,
    GuardModule,
    InterceptorModule,
  ],
})
export class CoreModule {}
