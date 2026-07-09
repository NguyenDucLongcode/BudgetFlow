import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { UserRepository } from './repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, SessionRepository],
  exports: [PrismaService, UserRepository, SessionRepository],
})
export class PrismaModule {}
