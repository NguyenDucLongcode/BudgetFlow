import { Module } from '@nestjs/common';
import { CaslModule } from 'src/core/security/casl/casl.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CsrfGuard, CsrfModule } from '../security/csrf';
import { RateLimitModule } from '../security/rate-limit/rate-limit.module';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from 'src/modules/auth/strategies/guards/jwt-Auth.guard';
import { PoliciesGuard } from 'src/core/security/casl/policies/policies.guard';
import { RateLimitGuard } from 'src/common/guard/rate-limit.guard';

@Module({
  imports: [AuthModule, CaslModule, CsrfModule, RateLimitModule],
  providers: [
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
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class GuardModule {}
