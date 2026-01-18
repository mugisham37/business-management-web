import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';
import { ExternalServiceConfigInput } from '../inputs/health.input';
import { firstValueFrom, timeout } from 'rxjs';

interface ExternalService {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout: number;
  expectedStatusCode: number;
  expectedResponsePattern?: RegExp;
  healthCheckPath?: string;
}

@Injectable()
export class ExternalServiceHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(ExternalServiceHealthIndicator.name);
  private externalServices = new Map<string, ExternalService>();

  constructor(private readonly httpService: HttpService) {
    super();
    this.initializeDefaultServices();
  }

  private initializeDefaultServices(): void {
    // Add default external services to monitor
    const defaultServices: ExternalService[] = [
      {
        name: 'GraphQL Endpoint',
        url: process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
        expectedStatusCode: 200,
        healthCheckPath: '/graphql',
      },
      {
        name: 'Database Health',
        url: process.env.DATABASE_HEALTH_URL || 'http://localhost:5432',
        method: 'GET',
        timeout: 3000,
        expectedStatusCode: 200,
      },
      {
        name: 'Redis Health',
        url: process.env.REDIS_HEALTH_URL || 'http://localhost:6379',
        method: 'GET',
        timeout: 3000,
        expectedStatusCode: 200,
      },
    ];

    defaultServices.forEach(service => {
      this.externalServices.set(service.name, service);
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const serviceName = key.replace('external_service_', '');
      const service = this.externalServices.get(serviceName);
      
      if (!service) {
        throw new Error(`External service not found: ${serviceName}`);
      }

      const isHealthy = await this.checkServiceHealth(service);
      
      const result = this.getStatus(key, isHealthy, {
        service: service.name,
        url: service.url,
        status: isHealthy ? 'up' : 'down',
      });

      if (isHealthy) {
        return result;
      }
      
      throw new HealthCheckError(`External service health check failed: ${service.name}`, result);
    } catch (error) {
      throw new HealthCheckError('External service health check failed', this.getStatus(key, false, {
        service: key,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(serviceName?: string): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      const servicesToCheck = serviceName 
        ? [this.externalServices.get(serviceName)].filter(Boolean)
        : Array.from(this.externalServices.values());

      if (servicesToCheck.length === 0) {
        throw new Error('No external services configured for health checks');
      }

      const serviceResults = await Promise.allSettled(
        servicesToCheck.map(async (service) => ({
          service,
          result: await this.checkServiceHealthDetailed(service!),
        }))
      );

      const responseTime = Date.now() - startTime;
      const metrics: HealthMetric[] = [];
      let healthyServices = 0;
      let totalServices = servicesToCheck.length;

      serviceResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { service, result: serviceResult } = result.value;
          healthyServices += serviceResult.isHealthy ? 1 : 0;

          metrics.push({
            name: `${service.name.toLowerCase().replace(/\s+/g, '_')}_status`,
            value: serviceResult.isHealthy ? 'healthy' : 'unhealthy',
            unit: 'status',
            withinThreshold: serviceResult.isHealthy,
          });

          metrics.push({
            name: `${service.name.toLowerCase().replace(/\s+/g, '_')}_response_time`,
            value: serviceResult.responseTime.toString(),
            unit: 'ms',
            threshold: service.timeout,
            withinThreshold: serviceResult.responseTime < service.timeout,
          });

          if (serviceResult.statusCode) {
            metrics.push({
              name: `${service.name.toLowerCase().replace(/\s+/g, '_')}_status_code`,
              value: serviceResult.statusCode.toString(),
              unit: 'code',
              threshold: service.expectedStatusCode,
              withinThreshold: serviceResult.statusCode === service.expectedStatusCode,
            });
          }
        } else {
          const service = servicesToCheck[index];
          metrics.push({
            name: `${service.name.toLowerCase().replace(/\s+/g, '_')}_status`,
            value: 'error',
            unit: 'status',
            withinThreshold: false,
          });
        }
      });

      // Overall service availability
      const availabilityPercentage = (healthyServices / totalServices) * 100;
      metrics.push({
        name: 'service_availability',
        value: availabilityPercentage.toFixed(2),
        unit: '%',
        threshold: 80,
        withinThreshold: availabilityPercentage >= 80,
      });

      const status = this.determineHealthStatus(metrics, healthyServices, totalServices);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY 
            ? `All ${totalServices} external services are healthy` 
            : `${healthyServices}/${totalServices} external services are healthy`,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('External service health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown external service error',
          message: 'External service health check failed',
        },
      };
    }
  }

  private async checkServiceHealth(service: ExternalService): Promise<boolean> {
    try {
      const result = await this.checkServiceHealthDetailed(service);
      return result.isHealthy;
    } catch (error) {
      this.logger.error(`Health check failed for ${service.name}:`, error);
      return false;
    }
  }

  private async checkServiceHealthDetailed(service: ExternalService): Promise<{
    isHealthy: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      let requestConfig: any = {
        method: service.method,
        url: service.url,
        headers: service.headers || {},
        timeout: service.timeout,
      };

      // For GraphQL health check, add a simple introspection query
      if (service.name === 'GraphQL Endpoint' && service.method === 'POST') {
        requestConfig.data = {
          query: '{ __schema { queryType { name } } }',
        };
      }

      const response = await firstValueFrom(
        this.httpService.request(requestConfig).pipe(
          timeout(service.timeout)
        )
      );

      const responseTime = Date.now() - startTime;
      const isStatusCodeValid = response.status === service.expectedStatusCode;
      
      let isResponseValid = true;
      if (service.expectedResponsePattern) {
        const responseText = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        isResponseValid = service.expectedResponsePattern.test(responseText);
      }

      return {
        isHealthy: isStatusCodeValid && isResponseValid,
        responseTime,
        statusCode: response.status,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async addExternalService(config: ExternalServiceConfigInput): Promise<void> {
    const service: ExternalService = {
      name: config.name,
      url: config.url,
      method: 'GET',
      timeout: (config.timeoutSeconds || 10) * 1000,
      expectedStatusCode: config.expectedStatusCode || 200,
      expectedResponsePattern: config.expectedResponsePattern 
        ? new RegExp(config.expectedResponsePattern) 
        : undefined,
      headers: this.parseHeaders(config.headers),
    };

    this.externalServices.set(config.name, service);
    this.logger.log(`External service added: ${config.name}`);
  }

  private parseHeaders(headers?: string[]): Record<string, string> {
    if (!headers) return {};
    
    const headerObj: Record<string, string> = {};
    headers.forEach(header => {
      const [key, value] = header.split(':').map(s => s.trim());
      if (key && value) {
        headerObj[key] = value;
      }
    });
    
    return headerObj;
  }

  async removeExternalService(serviceName: string): Promise<boolean> {
    const removed = this.externalServices.delete(serviceName);
    if (removed) {
      this.logger.log(`External service removed: ${serviceName}`);
    }
    return removed;
  }

  async getExternalServices(): Promise<ExternalService[]> {
    return Array.from(this.externalServices.values());
  }

  async testExternalService(serviceName: string): Promise<{
    isHealthy: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    const service = this.externalServices.get(serviceName);
    if (!service) {
      throw new Error(`External service not found: ${serviceName}`);
    }

    return this.checkServiceHealthDetailed(service);
  }

  private determineHealthStatus(
    metrics: HealthMetric[], 
    healthyServices: number, 
    totalServices: number
  ): HealthStatus {
    const availabilityPercentage = (healthyServices / totalServices) * 100;
    
    if (availabilityPercentage === 100) {
      return HealthStatus.HEALTHY;
    }
    
    if (availabilityPercentage >= 80) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.UNHEALTHY;
  }

  async getServiceStats(): Promise<{
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    averageResponseTime: number;
    availabilityPercentage: number;
  }> {
    try {
      const services = Array.from(this.externalServices.values());
      const results = await Promise.allSettled(
        services.map(service => this.checkServiceHealthDetailed(service))
      );

      let healthyCount = 0;
      let totalResponseTime = 0;
      let validResults = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.isHealthy) {
            healthyCount++;
          }
          totalResponseTime += result.value.responseTime;
          validResults++;
        }
      });

      return {
        totalServices: services.length,
        healthyServices: healthyCount,
        unhealthyServices: services.length - healthyCount,
        averageResponseTime: validResults > 0 ? totalResponseTime / validResults : 0,
        availabilityPercentage: services.length > 0 ? (healthyCount / services.length) * 100 : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get service stats:', error);
      return {
        totalServices: 0,
        healthyServices: 0,
        unhealthyServices: 0,
        averageResponseTime: 0,
        availabilityPercentage: 0,
      };
    }
  }

  async checkAllServices(): Promise<Array<{
    name: string;
    isHealthy: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }>> {
    const services = Array.from(this.externalServices.values());
    const results = await Promise.allSettled(
      services.map(async service => ({
        name: service.name,
        ...(await this.checkServiceHealthDetailed(service)),
      }))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: services[index].name,
          isHealthy: false,
          responseTime: 0,
          error: 'Health check failed',
        };
      }
    });
  }
}