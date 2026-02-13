import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check(@Res() res: Response) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown', message: '' },
        redis: { status: 'unknown', message: '' },
      },
    };

    let isHealthy = true;

    // Check database connectivity
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database.status = 'healthy';
      health.services.database.message = 'Database connection successful';
    } catch (error) {
      health.services.database.status = 'unhealthy';
      health.services.database.message =
        error instanceof Error ? error.message : 'Database connection failed';
      isHealthy = false;
    }

    // Check Redis connectivity
    try {
      const redisAvailable = this.redis.isAvailable();
      if (redisAvailable) {
        health.services.redis.status = 'healthy';
        health.services.redis.message = 'Redis connection successful';
      } else {
        health.services.redis.status = 'unhealthy';
        health.services.redis.message = 'Redis connection unavailable';
        isHealthy = false;
      }
    } catch (error) {
      health.services.redis.status = 'unhealthy';
      health.services.redis.message =
        error instanceof Error ? error.message : 'Redis connection failed';
      isHealthy = false;
    }

    // Set overall status
    health.status = isHealthy ? 'healthy' : 'unhealthy';

    // Return HTTP 200 if healthy, HTTP 503 if unhealthy
    const statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(health);
  }
}
