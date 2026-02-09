import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes';
import { HttpExceptionFilter } from './common/filters';
import { LoggerService } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Get logger service from DI container (resolve is required for transient-scoped providers)
  const logger = await app.resolve(LoggerService);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id', 'X-Device-Fingerprint', 'X-Geo-Location', 'X-Refresh-Token'],
  });

  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Enable validation globally with custom pipe
  app.useGlobalPipes(new ValidationPipe());

  // Set global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
