import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admins.controller';
import { SessionModule } from 'src/modules/session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [UsersController, AdminController],
  providers: [UserService, AdminService], // AdminService được cung cấp ở đây
  exports: [UserService, AdminService], // Export để dùng ở module khác (Auth)
})
export class UsersModule {}
