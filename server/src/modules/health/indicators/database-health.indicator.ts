import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DatabaseService } from '../../database/database.service';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);

  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const healthStatus = await this.databaseService.getHealthStatus();
      
      const result = this.getStatus(key, healthStatus.isHealthy, {
        database: 'postgresql',
        status: healthStatus.isHealthy ? 'up' : 'down',
        poolStats: healthStatus.poolStats,
      });

      if (healthStatus.isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('Database health check failed', result);
    } catch (error) {
      throw new HealthCheckError('Database health check failed', this.getStatus(key, false, {
        database: 'postgresql',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const healthStatus = await this.databaseService.getHealthStatus();
      
      // Test query performance
      const queryStartTime = Date.now();
      await this.testQueryPerformance();
      const queryTime = Date.now() - queryStartTime;
      
      // Get connection pool stats
      const poolStats = healthStatus.poolStats || {};
      
      // Test transaction capability
      const transactionStartTime = Date.now();
      await this.testTransactionCapability();
      const transactionTime = Date.now() - transactionStartTime;
      
      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'connection_pool_size',
          value: (poolStats.summary?.totalConnections || 0).toString(),
          unit: 'connections',
          withinThreshold: (poolStats.summary?.totalConnections || 0) < 100,
        },
        {
          name: 'active_connections',
          value: (poolStats.primary?.totalCount || 0).toString(),
          unit: 'connections',
          withinThreshold: (poolStats.primary?.totalCount || 0) < 80,
        },
        {
          name: 'idle_connections',
          value: (poolStats.primary?.idleCount || 0).toString(),
          unit: 'connections',
          withinThreshold: true,
        },
        {
          name: 'query_response_time',
          value: queryTime.toString(),
          unit: 'ms',
          threshold: 1000,
          withinThreshold: queryTime < 1000,
        },
        {
          name: 'transaction_response_time',
          value: transactionTime.toString(),
          unit: 'ms',
          threshold: 2000,
          withinThreshold: transactionTime < 2000,
        },
        {
          name: 'database_size',
          value: await this.getDatabaseSize(),
          unit: 'MB',
          withinThreshold: true,
        },
      ];

      const status = this.determineHealthStatus(metrics, healthStatus.isHealthy);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'Database is healthy' : 'Database has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Database health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown database error',
          message: 'Database health check failed',
        },
      };
    }
  }

  private async testQueryPerformance(): Promise<void> {
    // Test a simple query performance using generic method call
    try {
      const queryMethod = (this.databaseService as any).query || 
                         (this.databaseService as any).executeQuery || 
                         (this.databaseService as any).executeRaw;
      if (queryMethod) {
        await queryMethod.call(this.databaseService, 'SELECT 1 as test');
      } else {
        // Try to use any generic execute method
        const executeMethod = Object.getOwnPropertyNames(this.databaseService)
          .find(name => name.includes('execute') || name.includes('query'));
        if (executeMethod && typeof (this.databaseService as any)[executeMethod] === 'function') {
          await (this.databaseService as any)[executeMethod]('SELECT 1 as test');
        }
      }
    } catch (error) {
      throw new Error(`Query performance test failed: ${error}`);
    }
  }

  private async testTransactionCapability(): Promise<void> {
    // Test transaction capability
    try {
      const transactionMethod = (this.databaseService as any).transaction;
      if (transactionMethod) {
        await transactionMethod.call(this.databaseService, async (trx: any) => {
          const rawMethod = trx.raw || trx.query;
          if (rawMethod) {
            await rawMethod.call(trx, 'SELECT 1 as transaction_test');
          }
          // Don't commit anything, just test the capability
        });
      }
    } catch (error) {
      throw new Error(`Transaction capability test failed: ${error}`);
    }
  }

  private async getDatabaseSize(): Promise<string> {
    try {
      const queryMethod = (this.databaseService as any).query || 
                         (this.databaseService as any).executeQuery || 
                         (this.databaseService as any).executeRaw;
      if (queryMethod) {
        const result = await queryMethod.call(this.databaseService, 
          'SELECT pg_size_pretty(pg_database_size(current_database())) as size');
        return (result && result[0]?.size) || '0 MB';
      }
      return 'Unknown';
    } catch (error) {
      this.logger.warn('Could not get database size:', error);
      return 'Unknown';
    }
  }

  private determineHealthStatus(metrics: HealthMetric[], isConnected: boolean): HealthStatus {
    if (!isConnected) {
      return HealthStatus.UNHEALTHY;
    }

    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'query_response_time' || m.name === 'active_connections')
    );

    const warningIssues = metrics.filter(m => !m.withinThreshold);

    if (criticalIssues.length > 0) {
      return HealthStatus.DEGRADED;
    }

    if (warningIssues.length > 2) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  async getConnectionPoolStats(): Promise<{
    total: number;
    active: number;
    idle: number;
    waiting: number;
  }> {
    try {
      const healthStatus = await this.databaseService.getHealthStatus();
      const poolStats = healthStatus.poolStats || { summary: { totalConnections: 0, totalIdle: 0, totalWaiting: 0, readReplicaCount: 0 }, primary: { totalCount: 0, idleCount: 0, waitingCount: 0 }, readReplicas: [] };
      
      return {
        total: poolStats.summary?.totalConnections || 0,
        active: (poolStats.summary?.totalConnections || 0) - (poolStats.summary?.totalIdle || 0),
        idle: poolStats.summary?.totalIdle || 0,
        waiting: poolStats.summary?.totalWaiting || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool stats:', error);
      return { total: 0, active: 0, idle: 0, waiting: 0 };
    }
  }

  async testDatabaseConnectivity(): Promise<boolean> {
    try {
      const queryMethod = (this.databaseService as any).query || 
                         (this.databaseService as any).executeQuery || 
                         (this.databaseService as any).executeRaw ||
                         (this.databaseService as any).execute;
      if (queryMethod) {
        await queryMethod.call(this.databaseService, 'SELECT 1');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Database connectivity test failed:', error);
      return false;
    }
  }
}