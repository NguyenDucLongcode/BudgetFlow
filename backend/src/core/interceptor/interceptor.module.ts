import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from 'src/common/interceptors/audit-log.interceptor';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { AuditLogModule } from 'src/modules/audit/audit.module';

@Module({
  imports: [AuditLogModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class InterceptorModule {}
