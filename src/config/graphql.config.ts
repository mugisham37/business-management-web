import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { join } from 'path';

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

      // Enhanced error formatting
      formatError: (error: GraphQLError): GraphQLFormattedError => {
        // Log errors in development
        if (isDevelopment) {
          console.error('GraphQL Error:', {
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: error.extensions,
            stack: error.stack,
          });
        }

        // Don't expose internal errors in production
        if (isProduction && error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'Internal server error',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format validation errors
        if (error.extensions?.code === 'BAD_USER_INPUT') {
          return {
            message: error.message,
            extensions: {
              code: 'VALIDATION_ERROR',
              timestamp: new Date().toISOString(),
              validationErrors: error.extensions.validationErrors,
            },
          };
        }

        // Format authentication errors
        if (error.extensions?.code === 'UNAUTHENTICATED') {
          return {
            message: 'Authentication required',
            extensions: {
              code: 'UNAUTHENTICATED',
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Format authorization errors
        if (error.extensions?.code === 'FORBIDDEN') {
          return {
            message: 'Insufficient permissions',
            extensions: {
              code: 'FORBIDDEN',
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Default error formatting
        return {
          message: error.message,
          ...(error.locations && { locations: error.locations }),
          ...(error.path && { path: error.path }),
          extensions: {
            code: error.extensions?.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString(),
          },
        };
      },

      // Performance optimizations
      plugins: [
        // Query complexity analysis
        {
          requestDidStart() {
            return {
              didResolveOperation(requestContext: any) {
                const { request } = requestContext;
                
                // Log query in development
                if (isDevelopment && request.query) {
                  console.log('GraphQL Query:', request.query);
                  if (request.variables) {
                    console.log('Variables:', request.variables);
                  }
                }
              },
              
              willSendResponse(requestContext: any) {
                // Add performance headers
                const { response } = requestContext;
                if (response.http) {
                  response.http.headers.set('X-GraphQL-Execution-Time', Date.now().toString());
                }
              },
            };
          },
        },
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
            console.log('GraphQL WebSocket disconnected');
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