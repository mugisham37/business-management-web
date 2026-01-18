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
          value: (redisInfo.memory?.used || 0).toString(),
          unit: 'bytes',
          threshold: 1024 * 1024 * 1024, // 1GB
          withinThreshold: (redisInfo.memory?.used || 0) < 1024 * 1024 * 1024,
        },
        {
          name: 'memory_fragmentation_ratio',
          value: (redisInfo.memory?.fragmentationRatio || 1).toString(),
          unit: 'ratio',
          threshold: 1.5,
          withinThreshold: (redisInfo.memory?.fragmentationRatio || 1) < 1.5,
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
      // Test write
      await this.redisService.set(testKey, testValue, 60); // 60 seconds TTL
      
      // Test read
      const retrievedValue = await this.redisService.get(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('Read/write test failed: values do not match');
      }
      
      // Cleanup
      await this.redisService.del(testKey);
    } catch (error) {
      throw new Error(`Redis read/write test failed: ${error}`);
    }
  }

  private async testPubSubFunctionality(): Promise<void> {
    const testChannel = `health_check_channel_${Date.now()}`;
    const testMessage = 'health_check_message';
    
    try {
      // Test publish (we can't easily test subscribe in a health check)
      await this.redisService.publish(testChannel, testMessage);
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
      const info = await this.redisService.info('stats');
      
      // Parse Redis INFO response
      const lines = info.split('\r\n');
      const stats: any = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = isNaN(Number(value)) ? value : Number(value);
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
        connectedClients: redisInfo.connections || 0,
        usedMemory: redisInfo.memory?.used || 0,
        totalMemory: redisInfo.memory?.total || 0,
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
      await this.redisService.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis connectivity test failed:', error);
      return false;
    }
  }
}