import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  HealthStatus, 
  HealthCheck, 
  SystemHealth, 
  HealthCheckType,
  HealthSeverity,
  HealthDetails,
  HealthMetric
} from '../types/health.types';
import { HealthCheckInput, HealthFilterInput } from '../inputs/health.input';
import { DatabaseHealthIndicator } from '../indicators/database-health.indicator';
import { RedisHealthIndicator } from '../indicators/redis-health.indicator';
import { MemoryHealthIndicator } from '../indicators/memory-health.indicator';
import { DiskHealthIndicator } from '../indicators/disk-health.indicator';
import { QueueHealthIndicator } from '../indicators/queue-health.indicator';
import { ExternalServiceHealthIndicator } from '../indicators/external-service-health.indicator';
import { GraphQLHealthIndicator } from '../indicators/graphql-health.indicator';
import { HealthHistoryService } from './health-history.service';
import { HealthAlertService } from './health-alert.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private healthChecks = new Map<string, HealthCheck>();
  private systemStartTime = Date.now();
  private lastSystemCheck: Date = new Date();

  constructor(
    private readonly databaseIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
    private readonly diskIndicator: DiskHealthIndicator,
    private readonly queueIndicator: QueueHealthIndicator,
    private readonly externalServiceIndicator: ExternalServiceHealthIndicator,
    private readonly graphqlIndicator: GraphQLHealthIndicator,
    private readonly historyService: HealthHistoryService,
    private readonly alertService: HealthAlertService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks(): void {
    const defaultChecks: Partial<HealthCheckInput>[] = [
      {
        name: 'Database Connection',
        type: HealthCheckType.DATABASE,
        severity: HealthSeverity.CRITICAL,
        isRequired: true,
        intervalSeconds: 30,
      },
      {
        name: 'Redis Cache',
        type: HealthCheckType.REDIS,
        severity: HealthSeverity.HIGH,
        isRequired: true,
        intervalSeconds: 30,
      },
      {
        name: 'Memory Usage',
        type: HealthCheckType.MEMORY,
        severity: HealthSeverity.MEDIUM,
        isRequired: false,
        intervalSeconds: 60,
      },
      {
        name: 'Disk Space',
        type: HealthCheckType.DISK,
        severity: HealthSeverity.MEDIUM,
        isRequired: false,
        intervalSeconds: 120,
      },
      {
        name: 'Queue System',
        type: HealthCheckType.QUEUE,
        severity: HealthSeverity.HIGH,
        isRequired: true,
        intervalSeconds: 45,
      },
      {
        name: 'GraphQL Endpoint',
        type: HealthCheckType.EXTERNAL_SERVICE,
        severity: HealthSeverity.CRITICAL,
        isRequired: true,
        intervalSeconds: 30,
      },
    ];

    defaultChecks.forEach(check => {
      if (check.name && check.type && check.severity) {
        this.registerHealthCheck(check as HealthCheckInput);
      }
    });
  }

  async registerHealthCheck(input: HealthCheckInput): Promise<HealthCheck> {
    const id = this.generateCheckId(input.name, input.type);
    
    const healthCheck: HealthCheck = {
      id,
      name: input.name,
      type: input.type,
      status: HealthStatus.UNKNOWN,
      severity: input.severity,
      details: {
        metrics: [],
        timestamp: new Date(),
        responseTime: 0,
      },
      lastChecked: new Date(),
      consecutiveFailures: 0,
      isRequired: input.isRequired ?? true,
    };

    this.healthChecks.set(id, healthCheck);
    
    this.eventEmitter.emit('health.check.registered', { healthCheck });
    this.logger.log(`Health check registered: ${input.name} (${input.type})`);
    
    return healthCheck;
  }

  async performHealthCheck(checkId: string): Promise<HealthCheck> {
    const check = this.healthChecks.get(checkId);
    if (!check) {
      throw new Error(`Health check not found: ${checkId}`);
    }

    const startTime = Date.now();
    let status: HealthStatus;
    let details: HealthDetails;
    let error: string | undefined;

    try {
      const result = await this.executeHealthCheck(check);
      status = result.status;
      details = result.details;
    } catch (err) {
      status = HealthStatus.UNHEALTHY;
      error = err instanceof Error ? err.message : 'Unknown error';
      details = {
        metrics: [],
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        error,
      };
    }

    const responseTime = Date.now() - startTime;
    details.responseTime = responseTime;

    // Update consecutive failures
    if (status === HealthStatus.UNHEALTHY) {
      check.consecutiveFailures++;
    } else {
      check.consecutiveFailures = 0;
    }

    // Update check
    check.status = status;
    check.details = details;
    check.lastChecked = new Date();

    // Store in history
    await this.historyService.recordHealthCheck(check);

    // Check for alerts
    if (status === HealthStatus.UNHEALTHY || status === HealthStatus.DEGRADED) {
      await this.alertService.processHealthCheckResult(check);
    }

    // Emit event
    this.eventEmitter.emit('health.check.completed', { 
      check, 
      previousStatus: this.healthChecks.get(checkId)?.status 
    });

    this.healthChecks.set(checkId, check);
    return check;
  }

  private async executeHealthCheck(check: HealthCheck): Promise<{ status: HealthStatus; details: HealthDetails }> {
    switch (check.type) {
      case HealthCheckType.DATABASE:
        return await this.databaseIndicator.performCheck();
      case HealthCheckType.REDIS:
        return await this.redisIndicator.performCheck();
      case HealthCheckType.MEMORY:
        return await this.memoryIndicator.performCheck();
      case HealthCheckType.DISK:
        return await this.diskIndicator.performCheck();
      case HealthCheckType.QUEUE:
        return await this.queueIndicator.performCheck();
      case HealthCheckType.EXTERNAL_SERVICE:
        return await this.externalServiceIndicator.performCheck(check.name);
      default:
        return await this.graphqlIndicator.performCheck();
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const checks = Array.from(this.healthChecks.values());
    const healthyChecks = checks.filter(c => c.status === HealthStatus.HEALTHY).length;
    const unhealthyChecks = checks.filter(c => c.status === HealthStatus.UNHEALTHY).length;
    const degradedChecks = checks.filter(c => c.status === HealthStatus.DEGRADED).length;

    let overallStatus: HealthStatus;
    const criticalUnhealthy = checks.some(c => 
      c.severity === HealthSeverity.CRITICAL && 
      c.status === HealthStatus.UNHEALTHY && 
      c.isRequired
    );

    if (criticalUnhealthy) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (unhealthyChecks > 0 || degradedChecks > 0) {
      overallStatus = HealthStatus.DEGRADED;
    } else if (healthyChecks === checks.length && checks.length > 0) {
      overallStatus = HealthStatus.HEALTHY;
    } else {
      overallStatus = HealthStatus.UNKNOWN;
    }

    const uptime = (Date.now() - this.systemStartTime) / 1000;

    return {
      overallStatus,
      checks,
      timestamp: new Date(),
      totalChecks: checks.length,
      healthyChecks,
      unhealthyChecks,
      degradedChecks,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getHealthChecks(filter?: HealthFilterInput): Promise<HealthCheck[]> {
    let checks = Array.from(this.healthChecks.values());

    if (filter) {
      if (filter.statuses?.length) {
        checks = checks.filter(c => filter.statuses!.includes(c.status));
      }
      if (filter.types?.length) {
        checks = checks.filter(c => filter.types!.includes(c.type));
      }
      if (filter.severities?.length) {
        checks = checks.filter(c => filter.severities!.includes(c.severity));
      }
      if (filter.isRequired !== undefined) {
        checks = checks.filter(c => c.isRequired === filter.isRequired);
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        checks = checks.filter(c => 
          c.name.toLowerCase().includes(term) ||
          c.type.toLowerCase().includes(term)
        );
      }
    }

    return checks;
  }

  async getHealthCheck(checkId: string): Promise<HealthCheck | null> {
    return this.healthChecks.get(checkId) || null;
  }

  async removeHealthCheck(checkId: string): Promise<boolean> {
    const removed = this.healthChecks.delete(checkId);
    if (removed) {
      this.eventEmitter.emit('health.check.removed', { checkId });
      this.logger.log(`Health check removed: ${checkId}`);
    }
    return removed;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async performScheduledHealthChecks(): Promise<void> {
    const checks = Array.from(this.healthChecks.values());
    const now = Date.now();

    for (const check of checks) {
      const timeSinceLastCheck = now - check.lastChecked.getTime();
      const intervalMs = 30 * 1000; // Default 30 seconds

      if (timeSinceLastCheck >= intervalMs) {
        try {
          await this.performHealthCheck(check.id);
        } catch (error) {
          this.logger.error(`Failed to perform health check ${check.id}:`, error);
        }
      }
    }

    this.lastSystemCheck = new Date();
  }

  private generateCheckId(name: string, type: HealthCheckType): string {
    return `${type.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  async refreshAllHealthChecks(): Promise<SystemHealth> {
    const checks = Array.from(this.healthChecks.keys());
    
    await Promise.allSettled(
      checks.map(checkId => this.performHealthCheck(checkId))
    );

    return this.getSystemHealth();
  }

  getSystemUptime(): number {
    return (Date.now() - this.systemStartTime) / 1000;
  }

  getLastSystemCheck(): Date {
    return this.lastSystemCheck;
  }
}