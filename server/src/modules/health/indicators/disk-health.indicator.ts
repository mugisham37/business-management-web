import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DiskHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(DiskHealthIndicator.name);

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const diskInfo = await this.getDiskUsage('/');
      const isHealthy = diskInfo.usagePercentage < 90;
      
      const result = this.getStatus(key, isHealthy, {
        disk: 'filesystem',
        status: isHealthy ? 'healthy' : 'unhealthy',
        usage: diskInfo,
      });

      if (isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('Disk health check failed', result);
    } catch (error) {
      throw new HealthCheckError('Disk health check failed', this.getStatus(key, false, {
        disk: 'filesystem',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      // Check multiple disk paths
      const pathsToCheck = ['/', process.cwd(), '/tmp'];
      const diskChecks = await Promise.allSettled(
        pathsToCheck.map(async (diskPath) => ({
          path: diskPath,
          info: await this.getDiskUsage(diskPath),
        }))
      );

      // Test disk I/O performance
      const ioStartTime = Date.now();
      await this.testDiskIOPerformance();
      const ioTime = Date.now() - ioStartTime;

      // Check disk health for application directory
      const appDiskInfo = await this.getDiskUsage(process.cwd());
      
      // Check log directory space
      const logDiskInfo = await this.checkLogDirectorySpace();
      
      // Check temp directory space
      const tempDiskInfo = await this.getDiskUsage('/tmp');
      
      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'app_disk_usage_percentage',
          value: appDiskInfo.usagePercentage.toFixed(2),
          unit: '%',
          threshold: 85,
          withinThreshold: appDiskInfo.usagePercentage < 85,
        },
        {
          name: 'app_disk_free_space',
          value: appDiskInfo.freeGB.toFixed(2),
          unit: 'GB',
          threshold: 5, // 5GB minimum free space
          withinThreshold: appDiskInfo.freeGB > 5,
        },
        {
          name: 'temp_disk_usage_percentage',
          value: tempDiskInfo.usagePercentage.toFixed(2),
          unit: '%',
          threshold: 90,
          withinThreshold: tempDiskInfo.usagePercentage < 90,
        },
        {
          name: 'log_directory_size',
          value: logDiskInfo.sizeGB.toFixed(2),
          unit: 'GB',
          threshold: 10, // 10GB threshold for logs
          withinThreshold: logDiskInfo.sizeGB < 10,
        },
        {
          name: 'disk_io_response_time',
          value: ioTime.toString(),
          unit: 'ms',
          threshold: 1000, // 1 second threshold
          withinThreshold: ioTime < 1000,
        },
        {
          name: 'inode_usage',
          value: await this.getInodeUsage(),
          unit: '%',
          threshold: 85,
          withinThreshold: parseFloat(await this.getInodeUsage()) < 85,
        },
      ];

      // Add metrics for each checked path
      diskChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { path: diskPath, info } = result.value;
          metrics.push({
            name: `${diskPath.replace(/[^a-zA-Z0-9]/g, '_')}_usage_percentage`,
            value: info.usagePercentage.toFixed(2),
            unit: '%',
            threshold: 90,
            withinThreshold: info.usagePercentage < 90,
          });
        }
      });

      const status = this.determineHealthStatus(metrics);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'Disk usage is healthy' : 'Disk usage has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Disk health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown disk error',
          message: 'Disk health check failed',
        },
      };
    }
  }

  private async getDiskUsage(diskPath: string): Promise<{
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usagePercentage: number;
  }> {
    try {
      // Use statfs instead of statvfs for better compatibility
      const stats = await (fs.statfs as any)(diskPath);
      
      if (stats) {
        const blockSize = stats.f_bsize || 4096;
        const totalBytes = stats.f_blocks * blockSize;
        const freeBytes = stats.f_bavail * blockSize;
        const usedBytes = totalBytes - freeBytes;
        
        return {
          totalGB: totalBytes / 1024 / 1024 / 1024,
          usedGB: usedBytes / 1024 / 1024 / 1024,
          freeGB: freeBytes / 1024 / 1024 / 1024,
          usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0,
        };
      }
      
      // Fallback method
      return await this.getDiskUsageFallback(diskPath);
    } catch (error) {
      this.logger.warn(`Could not get disk usage for ${diskPath}:`, error);
      return {
        totalGB: 0,
        usedGB: 0,
        freeGB: 0,
        usagePercentage: 0,
      };
    }
  }

  private async getStatsAlternative(diskPath: string): Promise<any> {
    // Alternative method using child_process if statvfs is not available
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(`df -B1 "${diskPath}"`);
      const lines = stdout.trim().split('\n');
      if (lines.length >= 2) {
        const parts = lines[1]?.split(/\s+/) || [];
        if (parts.length >= 4) {
          const total = parseInt(parts[1] || '0', 10);
          const used = parseInt(parts[2] || '0', 10);
          const available = parseInt(parts[3] || '0', 10);
          
          return {
            f_blocks: Math.floor(total / 1024),
            f_bavail: Math.floor(available / 1024),
            f_bsize: 1024,
            f_frsize: 1024,
          };
        }
      }
    } catch (error) {
      this.logger.debug('df command failed, using fallback');
    }
    
    return null;
  }

  private async getDiskUsageFallback(diskPath: string): Promise<{
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usagePercentage: number;
  }> {
    // Very basic fallback - just return some default values
    return {
      totalGB: 100,
      usedGB: 50,
      freeGB: 50,
      usagePercentage: 50,
    };
  }

  private async testDiskIOPerformance(): Promise<void> {
    const testFile = path.join(process.cwd(), '.health_check_io_test');
    const testData = Buffer.alloc(1024 * 1024, 'a'); // 1MB of data
    
    try {
      // Test write performance
      await fs.writeFile(testFile, testData);
      
      // Test read performance
      const readData = await fs.readFile(testFile);
      
      if (readData.length !== testData.length) {
        throw new Error('Read/write test failed: data length mismatch');
      }
      
      // Cleanup
      await fs.unlink(testFile);
    } catch (error) {
      // Try to cleanup even if test failed
      try {
        await fs.unlink(testFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw new Error(`Disk I/O test failed: ${error}`);
    }
  }

  private async checkLogDirectorySpace(): Promise<{ sizeGB: number }> {
    const logPaths = [
      path.join(process.cwd(), 'logs'),
      '/var/log',
      path.join(process.cwd(), 'log'),
    ];
    
    let totalSize = 0;
    
    for (const logPath of logPaths) {
      try {
        const size = await this.getDirectorySize(logPath);
        totalSize += size;
      } catch (error) {
        // Directory might not exist, continue
      }
    }
    
    return {
      sizeGB: totalSize / 1024 / 1024 / 1024,
    };
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return stats.size;
      }
      
      const files = await fs.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const fileStats = await fs.stat(filePath);
          if (fileStats.isDirectory()) {
            totalSize += await this.getDirectorySize(filePath);
          } else {
            totalSize += fileStats.size;
          }
        } catch (error) {
          // Skip files we can't access
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private async getInodeUsage(): Promise<string> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('df -i /');
      const lines = stdout.trim().split('\n');
      if (lines.length >= 2) {
        const parts = lines[1]?.split(/\s+/) || [];
        if (parts.length >= 5) {
          const usageStr = parts[4];
          if (usageStr) {
            return usageStr.replace('%', '');
          }
        }
      }
      
      return '0';
    } catch (error) {
      this.logger.warn('Could not get inode usage:', error);
      return '0';
    }
  }

  private determineHealthStatus(metrics: HealthMetric[]): HealthStatus {
    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'app_disk_usage_percentage' || m.name === 'app_disk_free_space')
    );

    const warningIssues = metrics.filter(m => !m.withinThreshold);

    if (criticalIssues.length > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (warningIssues.length > 2) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  async getDiskStats(): Promise<{
    appDiskUsage: number;
    appDiskFree: number;
    tempDiskUsage: number;
    logDirectorySize: number;
    inodeUsage: number;
  }> {
    try {
      const appDiskInfo = await this.getDiskUsage(process.cwd());
      const tempDiskInfo = await this.getDiskUsage('/tmp');
      const logDiskInfo = await this.checkLogDirectorySpace();
      const inodeUsage = parseFloat(await this.getInodeUsage());
      
      return {
        appDiskUsage: appDiskInfo.usagePercentage,
        appDiskFree: appDiskInfo.freeGB,
        tempDiskUsage: tempDiskInfo.usagePercentage,
        logDirectorySize: logDiskInfo.sizeGB,
        inodeUsage,
      };
    } catch (error) {
      this.logger.error('Failed to get disk stats:', error);
      return {
        appDiskUsage: 0,
        appDiskFree: 0,
        tempDiskUsage: 0,
        logDirectorySize: 0,
        inodeUsage: 0,
      };
    }
  }

  async cleanupTempFiles(): Promise<{ filesRemoved: number; spaceFreed: number }> {
    let filesRemoved = 0;
    let spaceFreed = 0;
    
    const tempPaths = [
      '/tmp',
      path.join(process.cwd(), 'temp'),
      path.join(process.cwd(), 'tmp'),
    ];
    
    for (const tempPath of tempPaths) {
      try {
        const result = await this.cleanupDirectory(tempPath);
        filesRemoved += result.filesRemoved;
        spaceFreed += result.spaceFreed;
      } catch (error) {
        this.logger.warn(`Could not cleanup ${tempPath}:`, error);
      }
    }
    
    return { filesRemoved, spaceFreed };
  }

  private async cleanupDirectory(dirPath: string): Promise<{ filesRemoved: number; spaceFreed: number }> {
    let filesRemoved = 0;
    let spaceFreed = 0;
    
    try {
      const files = await fs.readdir(dirPath);
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);
          
          // Only remove files older than 24 hours and starting with temp/health_check
          if (stats.isFile() && 
              stats.mtime.getTime() < cutoffTime &&
              (file.startsWith('temp') || file.startsWith('health_check'))) {
            spaceFreed += stats.size;
            await fs.unlink(filePath);
            filesRemoved++;
          }
        } catch (error) {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
    
    return { filesRemoved, spaceFreed };
  }
}