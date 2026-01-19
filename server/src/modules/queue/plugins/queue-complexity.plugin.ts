import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { CustomLoggerService } from '../../logger/logger.service';
import { Injectable } from '@nestjs/common';

interface ComplexityConfig {
  maximumComplexity: number;
  scalarCost: number;
  objectCost: number;
  listFactor: number;
  introspectionCost: number;
  depthCostFactor: number;
}

@Injectable()
@Plugin()
export class QueueComplexityPlugin implements ApolloServerPlugin {
  private readonly config: ComplexityConfig = {
    maximumComplexity: 1000,
    scalarCost: 1,
    objectCost: 2,
    listFactor: 10,
    introspectionCost: 1000,
    depthCostFactor: 2,
  };

  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('QueueComplexityPlugin');
  }

  requestDidStart(requestContext: any) {
    return Promise.resolve({
      didResolveOperation: async (opContext: any) => {
        const { request, document } = opContext;
        
        try {
          // Skip complexity analysis for introspection queries
          if (this.isIntrospectionQuery(request.query)) {
            const complexity = this.config.introspectionCost;
            
            if (complexity > this.config.maximumComplexity) {
              throw new GraphQLError(
                `Query complexity ${complexity} exceeds maximum allowed complexity ${this.config.maximumComplexity}`,
                {
                  extensions: {
                    code: 'QUERY_COMPLEXITY_TOO_HIGH',
                    complexity,
                    maximumComplexity: this.config.maximumComplexity,
                  },
                }
              );
            }
            return;
          }

          // Calculate query complexity
          const complexity = this.calculateComplexity(document, request.variables);
          
          // Log complexity for monitoring
          this.logger.debug('GraphQL query complexity calculated', {
            complexity,
            operationName: request.operationName,
            query: request.query?.substring(0, 200) + '...',
          });

          // Check if complexity exceeds limit
          if (complexity > this.config.maximumComplexity) {
            this.logger.warn('Query complexity limit exceeded', {
              complexity,
              maximumComplexity: this.config.maximumComplexity,
              operationName: request.operationName,
              userAgent: opContext.request.http?.headers.get('user-agent'),
              ip: opContext.request.http?.headers.get('x-forwarded-for') || 
                  opContext.request.http?.headers.get('x-real-ip'),
            });

            throw new GraphQLError(
              `Query complexity ${complexity} exceeds maximum allowed complexity ${this.config.maximumComplexity}`,
              {
                extensions: {
                  code: 'QUERY_COMPLEXITY_TOO_HIGH',
                  complexity,
                  maximumComplexity: this.config.maximumComplexity,
                  suggestions: [
                    'Reduce the depth of nested queries',
                    'Use pagination to limit list sizes',
                    'Remove unnecessary fields from the query',
                    'Consider splitting the query into multiple smaller queries',
                  ],
                },
              }
            );
          }

          // Add complexity to request context for monitoring
          if (opContext.contextValue) {
            opContext.contextValue.queryComplexity = complexity;
          }
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          this.logger.error('Failed to calculate query complexity', error instanceof Error ? error.stack : String(error), {
            operationName: request.operationName,
          });
          
          // Don't block the query if complexity calculation fails
        }
      },

      willSendResponse: async (sendContext: any) => {
        // Log performance metrics including complexity
        const complexity = sendContext.contextValue?.queryComplexity;
        
        if (complexity) {
          this.logger.log('GraphQL query completed', {
            complexity,
            operationName: sendContext.request.operationName,
            duration: Date.now() - (sendContext.contextValue?.startTime || Date.now()),
            errors: sendContext.errors?.length || 0,
          });
        }
      },
    });
  }

  private calculateComplexity(document: any, variables: any = {}): number {
    let totalComplexity = 0;

    // Simple complexity calculation based on query structure
    const visit = (node: any, depth: number = 0): void => {
      if (!node) return;

      switch (node.kind) {
        case 'Document':
          node.definitions?.forEach((def: any) => visit(def, depth));
          break;

        case 'OperationDefinition':
          // Base cost for operation
          totalComplexity += this.config.objectCost;
          node.selectionSet && visit(node.selectionSet, depth + 1);
          break;

        case 'SelectionSet':
          node.selections?.forEach((selection: any) => visit(selection, depth));
          break;

        case 'Field':
          // Calculate field complexity
          const fieldComplexity = this.calculateFieldComplexity(node, depth, variables);
          totalComplexity += fieldComplexity;
          
          // Visit nested selections
          node.selectionSet && visit(node.selectionSet, depth + 1);
          break;

        case 'InlineFragment':
        case 'FragmentSpread':
          node.selectionSet && visit(node.selectionSet, depth);
          break;

        default:
          // Handle other node types if needed
          break;
      }
    };

    visit(document);
    return totalComplexity;
  }

  private calculateFieldComplexity(fieldNode: any, depth: number, variables: any): number {
    const fieldName = fieldNode.name?.value;
    let complexity = this.config.scalarCost;

    // Apply depth cost factor
    complexity *= Math.pow(this.config.depthCostFactor, depth);

    // Special complexity rules for queue-specific fields
    if (this.isQueueField(fieldName)) {
      complexity = this.calculateQueueFieldComplexity(fieldName, fieldNode, variables);
    }

    // Check for list fields and apply list factor
    if (this.isListField(fieldName)) {
      const limit = this.extractLimitFromArgs(fieldNode.arguments, variables);
      complexity *= Math.min(limit || this.config.listFactor, this.config.listFactor);
    }

    // Apply complexity multipliers for expensive operations
    if (this.isExpensiveField(fieldName)) {
      complexity *= 5;
    }

    return Math.max(complexity, this.config.scalarCost);
  }

  private isQueueField(fieldName: string): boolean {
    const queueFields = [
      'getQueues',
      'getJobs',
      'getQueueAnalytics',
      'getQueueStats',
      'hourlyTrends',
      'analytics',
      'relatedJobs',
    ];
    return queueFields.includes(fieldName);
  }

  private calculateQueueFieldComplexity(fieldName: string, fieldNode: any, variables: any): number {
    switch (fieldName) {
      case 'getQueues':
      case 'getJobs':
        // Base complexity for paginated queries
        const limit = this.extractLimitFromArgs(fieldNode.arguments, variables);
        return this.config.objectCost * Math.min(limit || 20, 100);

      case 'getQueueAnalytics':
      case 'analytics':
        // Analytics queries are more expensive
        return this.config.objectCost * 10;

      case 'hourlyTrends':
        // Trends based on number of days
        const days = this.extractDaysFromArgs(fieldNode.arguments, variables);
        return this.config.objectCost * Math.min(days || 7, 30);

      case 'relatedJobs':
        // Related jobs can be expensive if there are many
        return this.config.objectCost * 5;

      case 'getQueueStats':
        // Stats are relatively cheap
        return this.config.objectCost * 2;

      default:
        return this.config.objectCost;
    }
  }

  private isListField(fieldName: string): boolean {
    const listFields = [
      'getQueues',
      'getJobs',
      'hourlyTrends',
      'relatedJobs',
      'attempts',
      'availableProcessors',
      'queueTypes',
    ];
    return listFields.includes(fieldName);
  }

  private isExpensiveField(fieldName: string): boolean {
    const expensiveFields = [
      'getQueueAnalytics',
      'analytics',
      'performanceInsights',
      'bulkJobOperation',
      'createBulkJobs',
    ];
    return expensiveFields.includes(fieldName);
  }

  private extractLimitFromArgs(args: any[], variables: any): number | null {
    if (!args) return null;

    for (const arg of args) {
      if (arg.name?.value === 'input') {
        // Look for pagination.limit in input
        const inputValue = this.resolveArgumentValue(arg.value, variables);
        return inputValue?.pagination?.limit || null;
      }
      
      if (arg.name?.value === 'limit') {
        return this.resolveArgumentValue(arg.value, variables);
      }
    }

    return null;
  }

  private extractDaysFromArgs(args: any[], variables: any): number | null {
    if (!args) return null;

    for (const arg of args) {
      if (arg.name?.value === 'days') {
        return this.resolveArgumentValue(arg.value, variables);
      }
      
      if (arg.name?.value === 'hours') {
        const hours = this.resolveArgumentValue(arg.value, variables);
        return hours ? Math.ceil(hours / 24) : null;
      }
    }

    return null;
  }

  private resolveArgumentValue(valueNode: any, variables: any): any {
    switch (valueNode.kind) {
      case 'IntValue':
        return parseInt(valueNode.value, 10);
      case 'FloatValue':
        return parseFloat(valueNode.value);
      case 'StringValue':
        return valueNode.value;
      case 'BooleanValue':
        return valueNode.value;
      case 'Variable':
        return variables[valueNode.name.value];
      case 'ObjectValue':
        const obj: any = {};
        valueNode.fields?.forEach((field: any) => {
          obj[field.name.value] = this.resolveArgumentValue(field.value, variables);
        });
        return obj;
      case 'ListValue':
        return valueNode.values?.map((value: any) => this.resolveArgumentValue(value, variables));
      default:
        return null;
    }
  }

  private isIntrospectionQuery(query?: string): boolean {
    if (!query) return false;
    
    const introspectionKeywords = [
      '__schema',
      '__type',
      '__typename',
      'IntrospectionQuery',
    ];
    
    return introspectionKeywords.some(keyword => query.includes(keyword));
  }
}