import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BudgetFlow API')
    .setDescription('API quản lý thu chi cá nhân')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập Access Token',
      },
      'access-token',
    )

    // Add CSRF token header for Swagger UI
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-xsrf-token',
        description: 'CSRF Token',
      },
      'csrf-token',
    )

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
}
