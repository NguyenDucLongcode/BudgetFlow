import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/common/decorators/public.decorator';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Public()
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    // Check the health of the Prisma database connection
    return this.health.check([
      () => this.prismaHealth.pingCheck('prisma', this.prisma),
    ]);
  }
}
