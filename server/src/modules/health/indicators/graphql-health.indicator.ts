import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';

@Injectable()
export class GraphQLHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(GraphQLHealthIndicator.name);
  private queryMetrics = new Map<string, { count: number; totalTime: number; errors: number }>();

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const graphqlHealth = await this.checkGraphQLHealth();
      
      const result = this.getStatus(key, graphqlHealth.isHealthy, {
        graphql: 'endpoint',
        status: graphqlHealth.isHealthy ? 'healthy' : 'unhealthy',
        metrics: graphqlHealth.metrics,
      });

      if (graphqlHealth.isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('GraphQL health check failed', result);
    } catch (error) {
      throw new HealthCheckError('GraphQL health check failed', this.getStatus(key, false, {
        graphql: 'endpoint',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      // Test GraphQL introspection
      const introspectionStartTime = Date.now();
      await this.testIntrospection();
      const introspectionTime = Date.now() - introspectionStartTime;

      // Test basic query execution
      const queryStartTime = Date.now();
      await this.testBasicQuery();
      const queryTime = Date.now() - queryStartTime;

      // Test mutation execution
      const mutationStartTime = Date.now();
      await this.testBasicMutation();
      const mutationTime = Date.now() - mutationStartTime;

      // Test subscription capability
      const subscriptionStartTime = Date.now();
      await this.testSubscriptionCapability();
      const subscriptionTime = Date.now() - subscriptionStartTime;

      // Get GraphQL performance metrics
      const performanceMetrics = this.getPerformanceMetrics();
      
      // Get schema complexity metrics
      const schemaMetrics = await this.getSchemaMetrics();

      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'introspection_response_time',
          value: introspectionTime.toString(),
          unit: 'ms',
          threshold: 1000,
          withinThreshold: introspectionTime < 1000,
        },
        {
          name: 'query_response_time',
          value: queryTime.toString(),
          unit: 'ms',
          threshold: 2000,
          withinThreshold: queryTime < 2000,
        },
        {
          name: 'mutation_response_time',
          value: mutationTime.toString(),
          unit: 'ms',
          threshold: 3000,
          withinThreshold: mutationTime < 3000,
        },
        {
          name: 'subscription_response_time',
          value: subscriptionTime.toString(),
          unit: 'ms',
          threshold: 1000,
          withinThreshold: subscriptionTime < 1000,
        },
        {
          name: 'total_queries_executed',
          value: performanceMetrics.totalQueries.toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'average_query_time',
          value: performanceMetrics.averageQueryTime.toFixed(2),
          unit: 'ms',
          threshold: 1000,
          withinThreshold: performanceMetrics.averageQueryTime < 1000,
        },
        {
          name: 'query_error_rate',
          value: performanceMetrics.errorRate.toFixed(2),
          unit: '%',
          threshold: 5,
          withinThreshold: performanceMetrics.errorRate < 5,
        },
        {
          name: 'schema_types_count',
          value: schemaMetrics.typesCount.toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'schema_fields_count',
          value: schemaMetrics.fieldsCount.toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'schema_complexity_score',
          value: schemaMetrics.complexityScore.toString(),
          unit: 'score',
          threshold: 1000,
          withinThreshold: schemaMetrics.complexityScore < 1000,
        },
      ];

      const status = this.determineHealthStatus(metrics);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'GraphQL endpoint is healthy' : 'GraphQL endpoint has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('GraphQL health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown GraphQL error',
          message: 'GraphQL health check failed',
        },
      };
    }
  }

  private async checkGraphQLHealth(): Promise<{
    isHealthy: boolean;
    metrics: any;
  }> {
    try {
      // Basic health checks
      await this.testIntrospection();
      await this.testBasicQuery();
      
      const performanceMetrics = this.getPerformanceMetrics();
      
      const isHealthy = performanceMetrics.errorRate < 10 && 
                       performanceMetrics.averageQueryTime < 2000;
      
      return {
        isHealthy,
        metrics: performanceMetrics,
      };
    } catch (error) {
      return {
        isHealthy: false,
        metrics: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async testIntrospection(): Promise<void> {
    try {
      // Simulate GraphQL introspection query
      // In a real implementation, you would execute an actual introspection query
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
          }
        }
      `;
      
      // Simulate query execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      // Record metrics
      this.recordQueryMetric('introspection', 100, false);
    } catch (error) {
      this.recordQueryMetric('introspection', 0, true);
      throw new Error(`GraphQL introspection failed: ${error}`);
    }
  }

  private async testBasicQuery(): Promise<void> {
    try {
      // Simulate a basic GraphQL query
      const basicQuery = `
        query HealthCheck {
          __typename
        }
      `;
      
      // Simulate query execution time
      const executionTime = Math.random() * 200;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Record metrics
      this.recordQueryMetric('basic_query', executionTime, false);
    } catch (error) {
      this.recordQueryMetric('basic_query', 0, true);
      throw new Error(`GraphQL basic query failed: ${error}`);
    }
  }

  private async testBasicMutation(): Promise<void> {
    try {
      // Simulate a basic GraphQL mutation (health check mutation)
      const basicMutation = `
        mutation HealthCheckMutation {
          __typename
        }
      `;
      
      // Simulate mutation execution time
      const executionTime = Math.random() * 300;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Record metrics
      this.recordQueryMetric('basic_mutation', executionTime, false);
    } catch (error) {
      this.recordQueryMetric('basic_mutation', 0, true);
      throw new Error(`GraphQL basic mutation failed: ${error}`);
    }
  }

  private async testSubscriptionCapability(): Promise<void> {
    try {
      // Test if subscription capability is available
      // In a real implementation, you would test actual subscription setup
      
      // Simulate subscription setup time
      const setupTime = Math.random() * 150;
      await new Promise(resolve => setTimeout(resolve, setupTime));
      
      // Record metrics
      this.recordQueryMetric('subscription_test', setupTime, false);
    } catch (error) {
      this.recordQueryMetric('subscription_test', 0, true);
      throw new Error(`GraphQL subscription test failed: ${error}`);
    }
  }

  private recordQueryMetric(queryType: string, executionTime: number, hasError: boolean): void {
    const existing = this.queryMetrics.get(queryType) || { count: 0, totalTime: 0, errors: 0 };
    
    existing.count++;
    existing.totalTime += executionTime;
    if (hasError) {
      existing.errors++;
    }
    
    this.queryMetrics.set(queryType, existing);
  }

  private getPerformanceMetrics(): {
    totalQueries: number;
    averageQueryTime: number;
    errorRate: number;
  } {
    let totalQueries = 0;
    let totalTime = 0;
    let totalErrors = 0;

    for (const metrics of this.queryMetrics.values()) {
      totalQueries += metrics.count;
      totalTime += metrics.totalTime;
      totalErrors += metrics.errors;
    }

    return {
      totalQueries,
      averageQueryTime: totalQueries > 0 ? totalTime / totalQueries : 0,
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
    };
  }

  private async getSchemaMetrics(): Promise<{
    typesCount: number;
    fieldsCount: number;
    complexityScore: number;
  }> {
    try {
      // In a real implementation, you would analyze the actual GraphQL schema
      // This is a simulation of schema analysis
      
      return {
        typesCount: 50, // Simulated number of types
        fieldsCount: 200, // Simulated number of fields
        complexityScore: 300, // Simulated complexity score
      };
    } catch (error) {
      this.logger.warn('Could not get schema metrics:', error);
      return {
        typesCount: 0,
        fieldsCount: 0,
        complexityScore: 0,
      };
    }
  }

  private determineHealthStatus(metrics: HealthMetric[]): HealthStatus {
    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'introspection_response_time' || m.name === 'query_error_rate')
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

  async getGraphQLStats(): Promise<{
    totalQueries: number;
    averageQueryTime: number;
    errorRate: number;
    schemaComplexity: number;
    introspectionAvailable: boolean;
  }> {
    try {
      const performanceMetrics = this.getPerformanceMetrics();
      const schemaMetrics = await this.getSchemaMetrics();
      
      // Test if introspection is available
      let introspectionAvailable = true;
      try {
        await this.testIntrospection();
      } catch (error) {
        introspectionAvailable = false;
      }

      return {
        totalQueries: performanceMetrics.totalQueries,
        averageQueryTime: performanceMetrics.averageQueryTime,
        errorRate: performanceMetrics.errorRate,
        schemaComplexity: schemaMetrics.complexityScore,
        introspectionAvailable,
      };
    } catch (error) {
      this.logger.error('Failed to get GraphQL stats:', error);
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        errorRate: 0,
        schemaComplexity: 0,
        introspectionAvailable: false,
      };
    }
  }

  async clearMetrics(): Promise<void> {
    this.queryMetrics.clear();
    this.logger.log('GraphQL metrics cleared');
  }

  async getQueryMetrics(): Promise<Array<{
    queryType: string;
    count: number;
    averageTime: number;
    errorRate: number;
  }>> {
    const results: Array<{
      queryType: string;
      count: number;
      averageTime: number;
      errorRate: number;
    }> = [];

    for (const [queryType, metrics] of this.queryMetrics.entries()) {
      results.push({
        queryType,
        count: metrics.count,
        averageTime: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        errorRate: metrics.count > 0 ? (metrics.errors / metrics.count) * 100 : 0,
      });
    }

    return results;
  }

  async testGraphQLEndpoint(query: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // In a real implementation, you would execute the actual GraphQL query
      // This is a simulation
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      
      const responseTime = Date.now() - startTime;
      
      // Record the test query
      this.recordQueryMetric('test_query', responseTime, false);
      
      return {
        success: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record the failed test query
      this.recordQueryMetric('test_query', responseTime, true);
      
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}