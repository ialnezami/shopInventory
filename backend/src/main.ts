import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global error handling
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ErrorHandlerInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Shop Inventory Management System')
    .setDescription('Comprehensive API for managing shop inventory, sales, and invoicing')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('sales', 'Sales and POS endpoints')
    .addTag('inventory', 'Inventory management endpoints')
    .addTag('customers', 'Customer management endpoints')
    .addTag('reports', 'Reporting and analytics endpoints')
    .addTag('upload', 'File upload endpoints')
    .addTag('seed', 'Database seeding endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
