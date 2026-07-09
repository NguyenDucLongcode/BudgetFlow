import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/common/configs/configuration';
import { BullModule } from '@nestjs/bullmq/dist/bull.module';
import { envValidationSchema } from 'src/common/configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: envValidationSchema,
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('app.redis.host'),
          port: config.get<number>('app.redis.port'),
          password: config.get<string>('app.redis.password'),
        },
      }),
    }),
  ],
})
export class AppConfigModule {}
