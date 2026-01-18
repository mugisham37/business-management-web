import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(MemoryHealthIndicator.name);

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const isHealthy = this.checkMemoryHealth(memoryUsage);
      
      const result = this.getStatus(key, isHealthy, {
        memory: 'nodejs',
        status: isHealthy ? 'healthy' : 'unhealthy',
        usage: memoryUsage,
      });

      if (isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('Memory health check failed', result);
    } catch (error) {
      throw new HealthCheckError('Memory health check failed', this.getStatus(key, false, {
        memory: 'nodejs',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const systemMemory = await this.getSystemMemoryInfo();
      
      // Convert bytes to MB for easier reading
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
      const rssMB = memoryUsage.rss / 1024 / 1024;
      const externalMB = memoryUsage.external / 1024 / 1024;
      
      const heapUsagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const systemMemoryUsagePercentage = systemMemory.usedPercentage;
      
      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'heap_used',
          value: heapUsedMB.toFixed(2),
          unit: 'MB',
          threshold: 512, // 512MB threshold
          withinThreshold: heapUsedMB < 512,
        },
        {
          name: 'heap_total',
          value: heapTotalMB.toFixed(2),
          unit: 'MB',
          threshold: 1024, // 1GB threshold
          withinThreshold: heapTotalMB < 1024,
        },
        {
          name: 'heap_usage_percentage',
          value: heapUsagePercentage.toFixed(2),
          unit: '%',
          threshold: 85,
          withinThreshold: heapUsagePercentage < 85,
        },
        {
          name: 'rss',
          value: rssMB.toFixed(2),
          unit: 'MB',
          threshold: 1024, // 1GB threshold
          withinThreshold: rssMB < 1024,
        },
        {
          name: 'external',
          value: externalMB.toFixed(2),
          unit: 'MB',
          threshold: 256, // 256MB threshold
          withinThreshold: externalMB < 256,
        },
        {
          name: 'system_memory_used',
          value: systemMemory.used.toFixed(2),
          unit: 'GB',
          withinThreshold: true,
        },
        {
          name: 'system_memory_total',
          value: systemMemory.total.toFixed(2),
          unit: 'GB',
          withinThreshold: true,
        },
        {
          name: 'system_memory_usage_percentage',
          value: systemMemoryUsagePercentage.toFixed(2),
          unit: '%',
          threshold: 90,
          withinThreshold: systemMemoryUsagePercentage < 90,
        },
        {
          name: 'gc_info',
          value: await this.getGCInfo(),
          unit: 'info',
          withinThreshold: true,
        },
      ];

      const status = this.determineHealthStatus(metrics);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'Memory usage is healthy' : 'Memory usage has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Memory health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown memory error',
          message: 'Memory health check failed',
        },
      };
    }
  }

  private checkMemoryHealth(memoryUsage: NodeJS.MemoryUsage): boolean {
    const heapUsagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    
    // Consider unhealthy if heap usage is over 90% or using more than 1GB
    return heapUsagePercentage < 90 && heapUsedMB < 1024;
  }

  private async getSystemMemoryInfo(): Promise<{
    total: number;
    used: number;
    free: number;
    usedPercentage: number;
  }> {
    try {
      const os = await import('os');
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      
      return {
        total: totalMemory / 1024 / 1024 / 1024, // Convert to GB
        used: usedMemory / 1024 / 1024 / 1024,   // Convert to GB
        free: freeMemory / 1024 / 1024 / 1024,   // Convert to GB
        usedPercentage: (usedMemory / totalMemory) * 100,
      };
    } catch (error) {
      this.logger.warn('Could not get system memory info:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usedPercentage: 0,
      };
    }
  }

  private async getGCInfo(): Promise<string> {
    try {
      // Check if performance hooks are available  
      // Note: measureUserAgentSpecificMemory may not be available in all environments
      const perfApi = performance as any;
      if (typeof perfApi !== 'undefined' && typeof perfApi.measureUserAgentSpecificMemory === 'function') {
        try {
          const gcInfo = await perfApi.measureUserAgentSpecificMemory();
          return JSON.stringify(gcInfo);
        } catch (error) {
          // If the method throws, fall through to fallbacks
        }
      }
      
      // Fallback to basic GC info if available
      if (global.gc) {
        return 'GC available';
      }
      
      return 'GC info not available';
    } catch (error) {
      return 'GC info error';
    }
  }

  private determineHealthStatus(metrics: HealthMetric[]): HealthStatus {
    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'heap_usage_percentage' || m.name === 'system_memory_usage_percentage')
    );

    const warningIssues = metrics.filter(m => !m.withinThreshold);

    if (criticalIssues.length > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (warningIssues.length > 1) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  async getMemoryStats(): Promise<{
    heapUsed: number;
    heapTotal: number;
    heapUsagePercentage: number;
    rss: number;
    external: number;
    systemTotal: number;
    systemUsed: number;
    systemUsagePercentage: number;
  }> {
    try {
      const memoryUsage = process.memoryUsage();
      const systemMemory = await this.getSystemMemoryInfo();
      
      return {
        heapUsed: memoryUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memoryUsage.heapTotal / 1024 / 1024, // MB
        heapUsagePercentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        rss: memoryUsage.rss / 1024 / 1024, // MB
        external: memoryUsage.external / 1024 / 1024, // MB
        systemTotal: systemMemory.total, // GB
        systemUsed: systemMemory.used, // GB
        systemUsagePercentage: systemMemory.usedPercentage,
      };
    } catch (error) {
      this.logger.error('Failed to get memory stats:', error);
      return {
        heapUsed: 0,
        heapTotal: 0,
        heapUsagePercentage: 0,
        rss: 0,
        external: 0,
        systemTotal: 0,
        systemUsed: 0,
        systemUsagePercentage: 0,
      };
    }
  }

  async forceGarbageCollection(): Promise<boolean> {
    try {
      if (global.gc) {
        global.gc();
        this.logger.log('Garbage collection forced');
        return true;
      } else {
        this.logger.warn('Garbage collection not available (run with --expose-gc)');
        return false;
      }
    } catch (error) {
      this.logger.error('Failed to force garbage collection:', error);
      return false;
    }
  }

  async getMemoryLeakDetection(): Promise<{
    suspiciousGrowth: boolean;
    heapGrowthRate: number;
    recommendations: string[];
  }> {
    // This is a simplified leak detection - in production you'd want more sophisticated monitoring
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    
    const recommendations: string[] = [];
    let suspiciousGrowth = false;
    let heapGrowthRate = 0;
    
    // Simple heuristics for memory leak detection
    if (heapUsedMB > 500) {
      suspiciousGrowth = true;
      recommendations.push('High heap usage detected - monitor for memory leaks');
    }
    
    const heapUsagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (heapUsagePercentage > 80) {
      suspiciousGrowth = true;
      recommendations.push('Heap usage over 80% - consider increasing heap size or optimizing memory usage');
    }
    
    if (memoryUsage.external > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High external memory usage - check for buffer leaks');
    }
    
    return {
      suspiciousGrowth,
      heapGrowthRate,
      recommendations,
    };
  }
}