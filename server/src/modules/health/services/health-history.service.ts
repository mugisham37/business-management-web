import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  HealthHistory, 
  HealthCheck, 
  HealthStatus 
} from '../types/health.types';
import { HealthHistoryFilterInput } from '../inputs/health.input';

@Injectable()
export class HealthHistoryService {
  private readonly logger = new Logger(HealthHistoryService.name);
  private healthHistory = new Map<string, HealthHistory[]>();
  private readonly maxHistoryPerCheck = 1000;
  private readonly maxHistoryAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  async recordHealthCheck(check: HealthCheck): Promise<void> {
    const historyEntry: HealthHistory = {
      checkId: check.id,
      status: check.status,
      timestamp: check.lastChecked,
      responseTime: check.details.responseTime,
      error: check.details.error || '',
    };

    let history = this.healthHistory.get(check.id) || [];
    history.unshift(historyEntry);

    // Limit history size
    if (history.length > this.maxHistoryPerCheck) {
      history = history.slice(0, this.maxHistoryPerCheck);
    }

    this.healthHistory.set(check.id, history);
  }

  async getHealthHistory(filter: HealthHistoryFilterInput): Promise<HealthHistory[]> {
    let allHistory: HealthHistory[] = [];

    if (filter.checkId) {
      allHistory = this.healthHistory.get(filter.checkId) || [];
    } else {
      // Get history for all checks
      for (const history of this.healthHistory.values()) {
        allHistory.push(...history);
      }
      // Sort by timestamp descending
      allHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Apply filters
    if (filter.statuses?.length) {
      allHistory = allHistory.filter(h => filter.statuses!.includes(h.status));
    }

    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      allHistory = allHistory.filter(h => h.timestamp >= startDate);
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      allHistory = allHistory.filter(h => h.timestamp <= endDate);
    }

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      allHistory = allHistory.slice(0, filter.limit);
    }

    return allHistory;
  }

  async getHealthHistoryStats(checkId: string, hours: number = 24): Promise<{
    totalChecks: number;
    healthyChecks: number;
    unhealthyChecks: number;
    degradedChecks: number;
    unknownChecks: number;
    availabilityPercentage: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  }> {
    const history = this.healthHistory.get(checkId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);

    if (recentHistory.length === 0) {
      return {
        totalChecks: 0,
        healthyChecks: 0,
        unhealthyChecks: 0,
        degradedChecks: 0,
        unknownChecks: 0,
        availabilityPercentage: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
      };
    }

    const healthyChecks = recentHistory.filter(h => h.status === HealthStatus.HEALTHY).length;
    const unhealthyChecks = recentHistory.filter(h => h.status === HealthStatus.UNHEALTHY).length;
    const degradedChecks = recentHistory.filter(h => h.status === HealthStatus.DEGRADED).length;
    const unknownChecks = recentHistory.filter(h => h.status === HealthStatus.UNKNOWN).length;

    const responseTimes = recentHistory.map(h => h.responseTime);
    const totalResponseTime = responseTimes.reduce((sum, time) => sum + time, 0);

    return {
      totalChecks: recentHistory.length,
      healthyChecks,
      unhealthyChecks,
      degradedChecks,
      unknownChecks,
      availabilityPercentage: healthyChecks / recentHistory.length,
      averageResponseTime: totalResponseTime / recentHistory.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
    };
  }

  async getUptimePercentage(checkId: string, hours: number = 24): Promise<number> {
    const stats = await this.getHealthHistoryStats(checkId, hours);
    return stats.availabilityPercentage * 100;
  }

  async getDowntimeEvents(checkId: string, hours: number = 24): Promise<Array<{
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: HealthStatus;
  }>> {
    const history = this.healthHistory.get(checkId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history
      .filter(h => h.timestamp.getTime() >= cutoffTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort ascending for event detection

    const downtimeEvents: Array<{
      startTime: Date;
      endTime?: Date;
      duration?: number;
      status: HealthStatus;
    }> = [];

    let currentDowntime: {
      startTime: Date;
      endTime?: Date;
      duration?: number;
      status: HealthStatus;
    } | null = null;

    for (const entry of recentHistory) {
      if (entry.status === HealthStatus.UNHEALTHY || entry.status === HealthStatus.DEGRADED) {
        if (!currentDowntime) {
          currentDowntime = {
            startTime: entry.timestamp,
            status: entry.status,
          };
        }
      } else if (currentDowntime && entry.status === HealthStatus.HEALTHY) {
        currentDowntime.endTime = entry.timestamp;
        currentDowntime.duration = currentDowntime.endTime.getTime() - currentDowntime.startTime.getTime();
        downtimeEvents.push(currentDowntime);
        currentDowntime = null;
      }
    }

    // If there's an ongoing downtime
    if (currentDowntime) {
      currentDowntime.endTime = new Date();
      currentDowntime.duration = currentDowntime.endTime.getTime() - currentDowntime.startTime.getTime();
      downtimeEvents.push(currentDowntime);
    }

    return downtimeEvents;
  }

  async getResponseTimePercentiles(checkId: string, hours: number = 24): Promise<{
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  }> {
    const history = this.healthHistory.get(checkId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);

    if (recentHistory.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const responseTimes = recentHistory
      .map(h => h.responseTime)
      .sort((a, b) => a - b);

    const getPercentile = (percentile: number): number => {
      const index = Math.ceil((percentile / 100) * responseTimes.length) - 1;
      return responseTimes[Math.max(0, index)] || 0;
    };

    return {
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };
  }

  async getHealthHistoryTimeSeries(
    checkId: string, 
    hours: number = 24, 
    intervalMinutes: number = 5
  ): Promise<Array<{
    timestamp: Date;
    status: HealthStatus;
    responseTime: number;
    availability: number;
  }>> {
    const history = this.healthHistory.get(checkId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);

    if (recentHistory.length === 0) {
      return [];
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    const timeSeries: Array<{
      timestamp: Date;
      status: HealthStatus;
      responseTime: number;
      availability: number;
    }> = [];

    const startTime = Math.floor(cutoffTime / intervalMs) * intervalMs;
    const endTime = Date.now();

    for (let time = startTime; time <= endTime; time += intervalMs) {
      const intervalStart = time;
      const intervalEnd = time + intervalMs;
      
      const intervalData = recentHistory.filter(h => 
        h.timestamp?.getTime?.() >= intervalStart && 
        h.timestamp?.getTime?.() < intervalEnd
      );

      if (intervalData.length > 0) {
        const healthyCount = intervalData.filter(h => h.status === HealthStatus.HEALTHY).length;
        const avgResponseTime = intervalData.reduce((sum, h) => sum + h.responseTime, 0) / intervalData.length;
        const mostRecentStatus = intervalData?.[0]?.status; // Most recent in interval
        if (!mostRecentStatus) {
          continue;
        }

        timeSeries.push({
          timestamp: new Date(time),
          status: mostRecentStatus,
          responseTime: avgResponseTime,
          availability: healthyCount / intervalData.length,
        });
      }
    }

    return timeSeries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async exportHealthHistory(checkId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    let history: HealthHistory[];
    
    if (checkId) {
      history = this.healthHistory.get(checkId) || [];
    } else {
      history = [];
      for (const checkHistory of this.healthHistory.values()) {
        history.push(...checkHistory);
      }
      history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    if (format === 'csv') {
      const csvHeader = 'checkId,status,timestamp,responseTime,error\n';
      const csvRows = history.map(h => 
        `${h.checkId},${h.status},${h.timestamp.toISOString()},${h.responseTime},${h.error || ''}`
      ).join('\n');
      return csvHeader + csvRows;
    }

    return JSON.stringify(history, null, 2);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldHistory(): Promise<void> {
    const cutoffTime = Date.now() - this.maxHistoryAge;
    let totalCleaned = 0;

    for (const [checkId, history] of this.healthHistory.entries()) {
      const originalLength = history.length;
      const filteredHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);
      
      if (filteredHistory.length !== originalLength) {
        this.healthHistory.set(checkId, filteredHistory);
        totalCleaned += originalLength - filteredHistory.length;
      }

      // Remove empty histories
      if (filteredHistory.length === 0) {
        this.healthHistory.delete(checkId);
      }
    }

    if (totalCleaned > 0) {
      this.logger.log(`Cleaned up ${totalCleaned} old health history entries`);
    }
  }

  async getHistorySize(): Promise<{ totalEntries: number; totalChecks: number }> {
    let totalEntries = 0;
    const totalChecks = this.healthHistory.size;

    for (const history of this.healthHistory.values()) {
      totalEntries += history.length;
    }

    return { totalEntries, totalChecks };
  }

  async clearHistory(checkId?: string): Promise<void> {
    if (checkId) {
      this.healthHistory.delete(checkId);
      this.logger.log(`Cleared history for check: ${checkId}`);
    } else {
      this.healthHistory.clear();
      this.logger.log('Cleared all health history');
    }
  }
}