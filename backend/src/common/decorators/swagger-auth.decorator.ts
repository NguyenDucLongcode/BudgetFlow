import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';

export function ApiAuthSwaggerUI() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiSecurity('csrf-token', []),
  );
}
