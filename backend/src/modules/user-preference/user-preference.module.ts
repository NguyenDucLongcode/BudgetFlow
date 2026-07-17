import { Module } from '@nestjs/common';
import { UserPreferenceController } from './user-preference.controller';
import { UserPreferenceService } from './user-preference.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService],
  exports: [UserPreferenceService],
})
export class UserPreferenceModule {}
