import { Resolver, Query } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class HealthResolver {
  constructor(private readonly configService: ConfigService) {}

  @Query(() => String, { description: 'Health check endpoint' })
  health(): string {
    return `Server is running in ${this.configService.get('app.nodeEnv')} mode`;
  }

  @Query(() => String, { description: 'Server uptime' })
  uptime(): string {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}