import { Module } from '@nestjs/common';
import { RateLimitModule } from 'src/core/security/rate-limit/rate-limit.module';
import { CsrfModule } from './csrf';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [CsrfModule, RateLimitModule, CaslModule],
})
export class SecurityModule {}
