import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { useHelmet } from './common/security/helmet/helmet.config';
import { setupSwagger, validationPipeConfig } from './common/configs';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Or read from env
    bufferLogs: true, // Buffer logs until app initializes
  });

  // 2. Get ConfigService for env variables (cleaner)
  const configService = app.get(ConfigService);

  // ============================================
  // API PREFIX & VERSIONING
  // ============================================

  // API PREFIX & VERSIONING
  const apiPrefix = configService.get<string>('API_PREFIX') ?? 'api';

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health', 'metrics', 'metrics/json'],
  });

  if (configService.get('API_VERSIONING_ENABLED', true)) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: configService.get('API_VERSION', '1'),
      prefix: 'v',
    });
  }

  // ============================================
  // CORS
  // ============================================
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: configService.get('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 6. Security middleware
  app.use(useHelmet());
  app.use(cookieParser());

  // 7. Global filters  & pipes
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(validationPipeConfig);

  // 8. Swagger - only in non-production or with auth
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // 9. Graceful shutdown
  app.enableShutdownHooks();

  // 10. Start server
  const port = configService.get<number>('PORT') ?? 8080;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen(port, host, () => {
    console.log(`🚀 Application running on: http://${host}:${port}`);
    console.log(`📚 Swagger: http://${host}:${port}/api/docs`);
  });
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to log to your error tracking service
});

void bootstrap();
