import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ApiAccessToken() {
  return applyDecorators(ApiBearerAuth('access-token'));
}
