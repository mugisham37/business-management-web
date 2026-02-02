import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { join } from 'path';
import { QueryComplexityPlugin } from '../common/graphql/query-complexity.plugin';
import { PerformanceMonitoringPlugin } from '../common/graphql/performance-monitoring.plugin';
import { GraphQLErrorHandler } from '../common/graphql/error-handler.util';
import { GraphQLErrorCode } from '../common/graphql/error-codes.enum';

@Injectable()
export class GraphQLConfigService implements GqlOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createGqlOptions(): ApolloDriverConfig {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    return {
      // Schema configuration
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      
      // Development features
      introspection: !isProduction,
      
      // Query complexity and depth limits
      validationRules: [],
      
      // Context setup for authentication and DataLoader
      context: ({ req, res, connection }: { req: any; res: any; connection?: any }) => {
        if (connection) {
          // WebSocket connection context
          return {
            req: connection.context,
            user: connection.context.user,
            tenantId: connection.context.tenantId,
          };
        }
        
        // HTTP request context
        return {
          req,
          res,
          user: req.user,
          tenantId: req.user?.tenantId,
        };
      },

      // Enhanced error formatting with comprehensive error codes
      formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
        const originalError = error as GraphQLError;
        
        // Log errors in development
        if (isDevelopment) {
          console.error('GraphQL Error:', {
            message: originalError.message,
            locations: originalError.locations,
            path: originalError.path,
            extensions: originalError.extensions,
            stack: originalError.stack,
          });
        }

        // Don't expose internal errors in production
        if (isProduction && originalError.extensions?.code === GraphQLErrorCode.INTERNAL_SERVER_ERROR) {
          return {
            message: 'Internal server error',
            extensions: {
              code: GraphQLErrorCode.INTERNAL_SERVER_ERROR,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format validation errors
        if (originalError.extensions?.code === 'BAD_USER_INPUT' || originalError.extensions?.code === GraphQLErrorCode.VALIDATION_ERROR) {
          return {
            message: originalError.message,
            extensions: {
              code: GraphQLErrorCode.VALIDATION_ERROR,
              timestamp: new Date().toISOString(),
              validationErrors: originalError.extensions.validationErrors,
            },
          };
        }

        // Format authentication errors
        if (originalError.extensions?.code === GraphQLErrorCode.UNAUTHENTICATED) {
          return {
            message: 'Authentication required',
            extensions: {
              code: GraphQLErrorCode.UNAUTHENTICATED,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format authorization errors
        if (originalError.extensions?.code === GraphQLErrorCode.FORBIDDEN) {
          return {
            message: 'Insufficient permissions',
            extensions: {
              code: GraphQLErrorCode.FORBIDDEN,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format query complexity errors
        if (originalError.extensions?.code === GraphQLErrorCode.QUERY_TOO_COMPLEX) {
          return {
            message: originalError.message,
            extensions: {
              code: GraphQLErrorCode.QUERY_TOO_COMPLEX,
              complexity: originalError.extensions.complexity,
              maxComplexity: originalError.extensions.maxComplexity,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format query depth errors
        if (originalError.extensions?.code === GraphQLErrorCode.QUERY_TOO_DEEP) {
          return {
            message: originalError.message,
            extensions: {
              code: GraphQLErrorCode.QUERY_TOO_DEEP,
              depth: originalError.extensions.depth,
              maxDepth: originalError.extensions.maxDepth,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format tenant isolation errors
        if (originalError.extensions?.code === GraphQLErrorCode.CROSS_TENANT_ACCESS) {
          return {
            message: 'Access denied: Cross-tenant access not allowed',
            extensions: {
              code: GraphQLErrorCode.CROSS_TENANT_ACCESS,
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Default error formatting with timestamp
        return {
          message: originalError.message,
          ...(originalError.locations && { locations: originalError.locations }),
          ...(originalError.path && { path: originalError.path }),
          extensions: {
            code: originalError.extensions?.code || GraphQLErrorCode.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            ...originalError.extensions,
          },
        };
      },

      // Performance optimizations and monitoring plugins
      plugins: [
        new QueryComplexityPlugin(1000, 10), // Max complexity: 1000, Max depth: 10
        new PerformanceMonitoringPlugin(1000), // Slow query threshold: 1000ms
      ],

      // Subscription configuration for real-time features
      subscriptions: {
        'graphql-ws': {
          onConnect: (connectionParams: any) => {
            // Authenticate WebSocket connections
            const token = connectionParams.authorization || connectionParams.Authorization;
            if (!token) {
              throw new Error('Missing authentication token');
            }
            
            // Return context for the connection
            return {
              token,
              // Additional context will be added by authentication middleware
            };
          },
          onDisconnect: () => {
            if (isDevelopment) {
              console.log('GraphQL WebSocket disconnected');
            }
          },
        },
      },

      // Include stack traces in development
      debug: isDevelopment,
      
      // Built-in scalars
      resolvers: {
        DateTime: {
          serialize: (date: Date) => date.toISOString(),
          parseValue: (value: string) => new Date(value),
          parseLiteral: (ast: any) => new Date(ast.value),
        },
      },
    };
  }
}