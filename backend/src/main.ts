import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { useHelmet } from './common/security/helmet/helmet.config';
import { setupSwagger, validationPipeConfig } from './common/configs';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { logger } from './common/middeware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Logging middleware
  app.use(logger);

  // Global prefix
  const apiPrefix = process.env.VERSION_API ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/'],
  });

  // CORS config
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  // Security middleware
  app.use(useHelmet()); // Helmet
  app.use(cookieParser()); // Cookie parser

  app.useGlobalFilters(new AllExceptionsFilter());

  // Validation pipes
  app.useGlobalPipes(validationPipeConfig);

  //  Swagger
  setupSwagger(app);

  // Bây giờ process.env.PORT sẽ có giá trị từ file .env nếu nó tồn tại
  await app.listen(process.env.PORT ?? 8080);
}

void bootstrap();
