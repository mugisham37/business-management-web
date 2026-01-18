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
          value: (poolStats.totalConnections || 0).toString(),
          unit: 'connections',
          withinThreshold: (poolStats.totalConnections || 0) < 100,
        },
        {
          name: 'active_connections',
          value: (poolStats.activeConnections || 0).toString(),
          unit: 'connections',
          withinThreshold: (poolStats.activeConnections || 0) < 80,
        },
        {
          name: 'idle_connections',
          value: (poolStats.idleConnections || 0).toString(),
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
    // Test a simple query performance
    try {
      await this.databaseService.query('SELECT 1 as test');
    } catch (error) {
      throw new Error(`Query performance test failed: ${error}`);
    }
  }

  private async testTransactionCapability(): Promise<void> {
    // Test transaction capability
    try {
      await this.databaseService.transaction(async (trx) => {
        await trx.raw('SELECT 1 as transaction_test');
        // Don't commit anything, just test the capability
      });
    } catch (error) {
      throw new Error(`Transaction capability test failed: ${error}`);
    }
  }

  private async getDatabaseSize(): Promise<string> {
    try {
      const result = await this.databaseService.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      return result[0]?.size || '0 MB';
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
      const poolStats = healthStatus.poolStats || {};
      
      return {
        total: poolStats.totalConnections || 0,
        active: poolStats.activeConnections || 0,
        idle: poolStats.idleConnections || 0,
        waiting: poolStats.waitingConnections || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool stats:', error);
      return { total: 0, active: 0, idle: 0, waiting: 0 };
    }
  }

  async testDatabaseConnectivity(): Promise<boolean> {
    try {
      await this.databaseService.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connectivity test failed:', error);
      return false;
    }
  }
}