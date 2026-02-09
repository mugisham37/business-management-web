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

  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Enable validation globally with custom pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
