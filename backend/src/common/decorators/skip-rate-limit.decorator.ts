import { SetMetadata } from '@nestjs/common';

export const SKIP_RATE_LIMIT_KEY = 'skip_rate_limit';

export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);
