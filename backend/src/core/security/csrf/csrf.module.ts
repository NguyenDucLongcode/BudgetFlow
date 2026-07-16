import { ConfigModule } from '@nestjs/config';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from 'src/core/security/csrf/guard/csrf.guard';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CsrfMiddleware } from './middleware/csrf.middleware';

@Module({
  imports: [ConfigModule],
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard],
  exports: [CsrfService, CsrfGuard],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
