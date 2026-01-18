import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { HealthHistory } from '../types/health.types';
import { HealthHistoryFilterInput } from '../inputs/health.input';
import { HealthHistoryService } from '../services/health-history.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';

@Resolver(() => HealthHistory)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor)
export class HealthHistoryResolver {
  private readonly logger = new Logger(HealthHistoryResolver.name);

  constructor(private readonly historyService: HealthHistoryService) {}

  @Query(() => [HealthHistory], { description: 'Get health check history with filtering' })
  @RequirePermission('health:read')
  async healthHistory(
    @Args('filter') filter: HealthHistoryFilterInput
  ): Promise<HealthHistory[]> {
    return this.historyService.getHealthHistory(filter);
  }

  @Query(() => String, { description: 'Get uptime percentage for a health check' })
  @RequirePermission('health:read')
  async uptimePercentage(
    @Args('checkId') checkId: string,
    @Args('hours', { defaultValue: 24 }) hours: number
  ): Promise<number> {
    return this.historyService.getUptimePercentage(checkId, hours);
  }

  @Query(() => String, { description: 'Export health history as JSON or CSV' })
  @RequirePermission('health:export')
  async exportHealthHistory(
    @Args('checkId', { nullable: true }) checkId?: string,
    @Args('format', { defaultValue: 'json' }) format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    return this.historyService.exportHealthHistory(checkId, format);
  }
}