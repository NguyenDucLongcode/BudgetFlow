// prometheus/prometheus.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule as BasePrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigService } from '@nestjs/config';
import { PrometheusController } from './prometheus.controller';

@Module({
  imports: [
    BasePrometheusModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        path: '', // Để trống để không tạo route
        defaultMetrics: {
          enabled:
            config.get<boolean>('app.prometheus.defaultMetrics.enabled') ??
            true,
        },
      }),
    }),
  ],
  controllers: [PrometheusController], // Dùng controller của bạn
  exports: [BasePrometheusModule],
})
export class PrometheusModule {}
