import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Get custom logger
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('app.corsOrigin'),
    credentials: configService.get('app.corsCredentials'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // API prefix
  const apiPrefix = configService.get('app.apiPrefix');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  // Swagger documentation
  if (configService.get('app.nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Business Management API')
      .setDescription('Business Management Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('GraphQL', 'GraphQL endpoint available at /graphql')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (_, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: configService.get('app.nodeEnv'),
    });
  });

  // Start server
  const port = configService.get('app.port');
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`, { context: 'Bootstrap' });
  logger.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`, { context: 'Bootstrap' });
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`, { context: 'Bootstrap' });
  logger.log(`❤️ Health Check: http://localhost:${port}/health`, { context: 'Bootstrap' });
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});