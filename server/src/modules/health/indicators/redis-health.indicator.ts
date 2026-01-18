import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { SimpleRedisService } from '../../cache/simple-redis.service';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private readonly redisService: SimpleRedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const redisInfo = await this.redisService.getInfo();
      
      const result = this.getStatus(key, redisInfo.isHealthy, {
        redis: 'redis',
        status: redisInfo.isHealthy ? 'up' : 'down',
        connections: redisInfo.connections,
        memory: redisInfo.memory,
      });

      if (redisInfo.isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('Redis health check failed', result);
    } catch (error) {
      throw new HealthCheckError('Redis health check failed', this.getStatus(key, false, {
        redis: 'redis',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const redisInfo = await this.redisService.getInfo();
      
      // Test read/write operations
      const readWriteStartTime = Date.now();
      await this.testReadWriteOperations();
      const readWriteTime = Date.now() - readWriteStartTime;
      
      // Test pub/sub functionality
      const pubSubStartTime = Date.now();
      await this.testPubSubFunctionality();
      const pubSubTime = Date.now() - pubSubStartTime;
      
      // Get Redis server info
      const serverInfo = await this.getRedisServerInfo();
      
      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'connected_clients',
          value: (redisInfo.connections || 0).toString(),
          unit: 'connections',
          threshold: 1000,
          withinThreshold: (redisInfo.connections || 0) < 1000,
        },
        {
          name: 'used_memory',
          value: (this.parseMemoryValue(redisInfo, 'used') || 0).toString(),
          unit: 'bytes',
          threshold: 1024 * 1024 * 1024, // 1GB
          withinThreshold: (this.parseMemoryValue(redisInfo, 'used') || 0) < 1024 * 1024 * 1024,
        },
        {
          name: 'memory_fragmentation_ratio',
          value: (this.parseMemoryValue(redisInfo, 'fragmentationRatio') || 1).toString(),
          unit: 'ratio',
          threshold: 1.5,
          withinThreshold: (this.parseMemoryValue(redisInfo, 'fragmentationRatio') || 1) < 1.5,
        },
        {
          name: 'read_write_response_time',
          value: readWriteTime.toString(),
          unit: 'ms',
          threshold: 100,
          withinThreshold: readWriteTime < 100,
        },
        {
          name: 'pubsub_response_time',
          value: pubSubTime.toString(),
          unit: 'ms',
          threshold: 200,
          withinThreshold: pubSubTime < 200,
        },
        {
          name: 'keyspace_hits',
          value: (serverInfo.keyspaceHits || 0).toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'keyspace_misses',
          value: (serverInfo.keyspaceMisses || 0).toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'hit_ratio',
          value: this.calculateHitRatio(serverInfo.keyspaceHits, serverInfo.keyspaceMisses).toString(),
          unit: 'percentage',
          threshold: 0.8,
          withinThreshold: this.calculateHitRatio(serverInfo.keyspaceHits, serverInfo.keyspaceMisses) > 0.8,
        },
      ];

      const status = this.determineHealthStatus(metrics, redisInfo.isHealthy);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'Redis is healthy' : 'Redis has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Redis health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown Redis error',
          message: 'Redis health check failed',
        },
      };
    }
  }

  private async testReadWriteOperations(): Promise<void> {
    const testKey = `health_check_${Date.now()}`;
    const testValue = 'health_check_value';
    
    try {
      // Test write - use a generic approach that works with various Redis clients
      await ((this.redisService as any).set?.(testKey, testValue, 60) ||
              (this.redisService as any).executeCommand?.('set', testKey, testValue, 'EX', '60'));
      
      // Test read
      const retrievedValue = await ((this.redisService as any).get?.(testKey) ||
                                   (this.redisService as any).executeCommand?.('get', testKey));
      
      if (retrievedValue !== testValue) {
        throw new Error('Read/write test failed: values do not match');
      }
      
      // Cleanup
      await ((this.redisService as any).del?.(testKey) ||
             (this.redisService as any).executeCommand?.('del', testKey));
    } catch (error) {
      throw new Error(`Redis read/write test failed: ${error}`);
    }
  }

  private async testPubSubFunctionality(): Promise<void> {
    const testChannel = `health_check_channel_${Date.now()}`;
    const testMessage = 'health_check_message';
    
    try {
      // Test publish - use generic method call if publish doesn't exist
      await ((this.redisService as any).publish?.(testChannel, testMessage) ||
              (this.redisService as any).executeCommand?.('publish', testChannel, testMessage));
    } catch (error) {
      throw new Error(`Redis pub/sub test failed: ${error}`);
    }
  }

  private async getRedisServerInfo(): Promise<{
    keyspaceHits?: number;
    keyspaceMisses?: number;
    totalCommandsProcessed?: number;
    uptimeInSeconds?: number;
  }> {
    try {
      const info = await ((this.redisService as any).info?.('stats') ||
                         (this.redisService as any).executeCommand?.('info', 'stats') ||
                         '');
      
      // Parse Redis INFO response
      const lines = typeof info === 'string' ? info.split('\r\n') : [];
      const stats: any = {};
      
      lines.forEach((line: string) => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (key && value !== undefined) {
            stats[key.trim()] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      });
      
      return {
        keyspaceHits: stats.keyspace_hits,
        keyspaceMisses: stats.keyspace_misses,
        totalCommandsProcessed: stats.total_commands_processed,
        uptimeInSeconds: stats.uptime_in_seconds,
      };
    } catch (error) {
      this.logger.warn('Could not get Redis server info:', error);
      return {};
    }
  }

  private calculateHitRatio(hits?: number, misses?: number): number {
    if (!hits && !misses) return 1;
    if (!hits) return 0;
    if (!misses) return 1;
    
    const total = hits + misses;
    return total > 0 ? hits / total : 0;
  }

  private determineHealthStatus(metrics: HealthMetric[], isConnected: boolean): HealthStatus {
    if (!isConnected) {
      return HealthStatus.UNHEALTHY;
    }

    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'read_write_response_time' || m.name === 'used_memory')
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

  async getRedisStats(): Promise<{
    connectedClients: number;
    usedMemory: number;
    totalMemory: number;
    hitRatio: number;
    uptime: number;
  }> {
    try {
      const redisInfo = await this.redisService.getInfo();
      const serverInfo = await this.getRedisServerInfo();
      
      return {
        connectedClients: (redisInfo as any).connections || 0,
        usedMemory: this.parseMemoryValue(redisInfo, 'used') || 0,
        totalMemory: this.parseMemoryValue(redisInfo, 'total') || 0,
        hitRatio: this.calculateHitRatio(serverInfo.keyspaceHits, serverInfo.keyspaceMisses),
        uptime: serverInfo.uptimeInSeconds || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get Redis stats:', error);
      return {
        connectedClients: 0,
        usedMemory: 0,
        totalMemory: 0,
        hitRatio: 0,
        uptime: 0,
      };
    }
  }

  async testRedisConnectivity(): Promise<boolean> {
    try {
      // Try to execute a simple command via a generic call
      const result = await (this.redisService as any).executeCommand?.('ping') || 
                     await (this.redisService as any).ping?.() ||
                     await (this.redisService as any).get('health_check_test');
      return true;
    } catch (error) {
      this.logger.error('Redis connectivity test failed:', error);
      return false;
    }
  }

  private parseMemoryValue(info: any, key: string): number {
    if (typeof info === 'object' && info !== null && info.memory && typeof info.memory === 'object') {
      return info.memory[key] || 0;
    }
    return 0;
  }
}