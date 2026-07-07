// common/modules/csrf/csrf.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from './guard/csrf.guard';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { CsrfController } from './csrf.controller';

@Module({
  imports: [ConfigModule],
  controllers: [CsrfController],
  providers: [
    CsrfService,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
  exports: [CsrfService],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
