import { Module } from '@nestjs/common';
import { PrometheusModule as BasePrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigService } from '@nestjs/config';
import { MetricsController } from './metrics.controller';

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
  controllers: [MetricsController], // Dùng controller của bạn
  exports: [BasePrometheusModule],
})
export class MetricsModule {}
