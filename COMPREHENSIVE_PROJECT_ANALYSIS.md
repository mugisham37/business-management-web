# COMPREHENSIVE ENTERPRISE BUSINESS MANAGEMENT SYSTEM ANALYSIS

## 🏢 EXECUTIVE SUMMARY

This is an **Enterprise-Level Unified Business Management Platform** designed to serve as a comprehensive solution for managing all aspects of business operations across multiple industries including Manufacturing, Retail, Wholesale, and Service-based businesses. The system is architected to handle mid-size to enterprise organizations with complex operational requirements.

### System Scale & Complexity
- **24 Distinct Modules** providing comprehensive business functionality
- **GraphQL-Only API** with over 500+ operations across all modules
- **Multi-Tenant Architecture** supporting unlimited organizations
- **Real-Time Capabilities** with WebSocket subscriptions
- **Enterprise Security** with MFA, RBAC, and comprehensive audit trails
- **Horizontal Scalability** with read replicas and distributed caching

---

## 1️⃣ HIGH-LEVEL SYSTEM OVERVIEW

### Purpose of the System
The Unified Business Management Platform serves as a single source of truth for all business operations, providing:

1. **Operational Excellence**: Streamlined workflows across all business functions
2. **Data Centralization**: Single database with multi-tenant isolation
3. **Real-Time Insights**: Live dashboards and analytics
4. **Scalable Architecture**: Supports growth from small teams to enterprise scale
5. **Industry Flexibility**: Configurable for different business models
6. **Compliance Ready**: Built-in audit trails and security controls

### Target Users and Business Types

#### Primary Users:
- **C-Level Executives**: Strategic dashboards and KPI monitoring
- **Operations Managers**: Day-to-day operational oversight
- **Department Heads**: Functional area management (Finance, HR, Sales, etc.)
- **End Users**: Employees across all departments
- **System Administrators**: Platform configuration and maintenance
- **API Consumers**: Third-party integrations and mobile applications

#### Business Types Supported:
1. **Manufacturing Companies**
   - Production planning and scheduling
   - Inventory management with batch/lot tracking
   - Quality control and compliance
   - Supply chain optimization

2. **Retail Operations**
   - Multi-location inventory management
   - Point-of-sale integration
   - Customer loyalty programs
   - E-commerce synchronization

3. **Wholesale Distribution**
   - B2B order management
   - Bulk pricing and contracts
   - Territory management
   - Supplier relationship management

4. **Service-Based Businesses**
   - Project management
   - Time tracking and billing
   - Customer relationship management
   - Resource allocation

5. **Mid-Size to Enterprise Organizations**
   - Multi-department coordination
   - Complex approval workflows
   - Advanced reporting and analytics
   - Compliance and audit requirements

### Core Problems Solved

1. **Data Silos**: Eliminates disconnected systems by providing unified data model
2. **Manual Processes**: Automates repetitive tasks and workflows
3. **Lack of Visibility**: Real-time dashboards and reporting across all functions
4. **Scalability Issues**: Modular architecture grows with business needs
5. **Integration Complexity**: Built-in connectors for popular business tools
6. **Compliance Burden**: Automated audit trails and compliance reporting
7. **Multi-Location Challenges**: Centralized management with location-specific controls

### Why GraphQL Over REST

#### Technical Advantages:
1. **Single Endpoint**: Reduces API surface area and simplifies client development
2. **Flexible Queries**: Clients request exactly the data they need
3. **Strong Type System**: Auto-generated documentation and validation
4. **Real-Time Subscriptions**: Built-in WebSocket support for live updates
5. **Introspection**: Self-documenting API with schema exploration
6. **Batch Operations**: Efficient data fetching with DataLoader pattern

#### Business Advantages:
1. **Faster Development**: Reduced backend changes for frontend requirements
2. **Better Performance**: Eliminates over-fetching and under-fetching
3. **Mobile Optimization**: Efficient data transfer for mobile applications
4. **Third-Party Integration**: Easier for partners to integrate with flexible queries
5. **Future-Proof**: Schema evolution without versioning complexity

### Why NestJS for Enterprise Scale

#### Framework Benefits:
1. **TypeScript First**: Type safety across the entire application
2. **Modular Architecture**: Clean separation of concerns with dependency injection
3. **Decorator Pattern**: Elegant handling of cross-cutting concerns
4. **Enterprise Patterns**: Built-in support for guards, interceptors, and pipes
5. **Scalability**: Microservices-ready architecture
6. **Testing**: Comprehensive testing utilities and patterns

#### Production Readiness:
1. **Performance**: Optimized for high-throughput applications
2. **Security**: Built-in security features and best practices
3. **Monitoring**: Integrated health checks and metrics
4. **Documentation**: Auto-generated API documentation
5. **Community**: Large ecosystem and enterprise adoption

### Architecture Decision: Modular Monolith

#### Why Not Microservices:
1. **Complexity**: Microservices add operational overhead for most organizations
2. **Data Consistency**: Business operations require ACID transactions
3. **Development Speed**: Faster iteration with single deployment unit
4. **Debugging**: Easier troubleshooting with centralized logging
5. **Cost**: Lower infrastructure costs for most use cases

#### Why Not Traditional Monolith:
1. **Maintainability**: Clear module boundaries prevent tight coupling
2. **Team Scalability**: Different teams can own different modules
3. **Deployment**: Can evolve to microservices if needed
4. **Testing**: Isolated testing of individual modules

#### Modular Monolith Benefits:
1. **Best of Both Worlds**: Monolith simplicity with microservice organization
2. **Evolution Path**: Can extract modules to services when needed
3. **Shared Infrastructure**: Common concerns handled centrally
4. **Performance**: No network overhead between modules
5. **Consistency**: Unified error handling and logging

---

## 2️⃣ BACKEND ARCHITECTURE

### Overall Architecture Pattern: Layered + Hexagonal

The system implements a hybrid architecture combining:

#### Layered Architecture (Vertical):
```
┌─────────────────────────────────────┐
│           GraphQL Layer             │
│  (Resolvers, Subscriptions, Types)  │
├─────────────────────────────────────┤
│          Application Layer          │
│     (Services, Use Cases, DTOs)     │
├─────────────────────────────────────┤
│           Domain Layer              │
│    (Entities, Value Objects,        │
│     Domain Services, Events)        │
├─────────────────────────────────────┤
│        Infrastructure Layer         │
│  (Repositories, External Services,  │
│      Database, Message Queues)      │
└─────────────────────────────────────┘
```

#### Hexagonal Architecture (Horizontal):
```
        ┌─────────────────┐
        │   GraphQL API   │
        │   (Primary)     │
        └─────────┬───────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐    ┌───▼───┐
│ Auth  │    │ Business│    │ Queue │
│ Guard │    │  Logic  │    │ Jobs  │
└───────┘    │ (Core)  │    └───────┘
             └────┬────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐    ┌───▼───┐
│Database│   │  Cache  │    │ Events│
│(Drizzle│   │ (Redis) │    │(Emitter│
└───────┘    └─────────┘    └───────┘
```

### Module Boundaries and Responsibilities

#### Core Infrastructure Modules:
1. **Database Module**: Data persistence and connection management
2. **Cache Module**: Performance optimization and session storage
3. **Queue Module**: Asynchronous job processing
4. **Logger Module**: Comprehensive logging and audit trails
5. **Health Module**: System monitoring and health checks
6. **Realtime Module**: WebSocket connections and subscriptions

#### Security & Identity Modules:
7. **Auth Module**: Authentication, authorization, and MFA
8. **Security Module**: Encryption, threat detection, and compliance
9. **Tenant Module**: Multi-tenancy and feature management

#### Business Domain Modules:
10. **CRM Module**: Customer relationship management
11. **Financial Module**: Accounting and financial operations
12. **Employee Module**: Human resources and payroll
13. **Supplier Module**: Vendor and procurement management
14. **Inventory Module**: Product and stock management
15. **Warehouse Module**: Warehouse operations and logistics
16. **POS Module**: Point of sale and retail operations
17. **Location Module**: Multi-location and franchise management

#### Integration & Communication Modules:
18. **Integration Module**: Third-party system connections
19. **Communication Module**: Email, SMS, and messaging
20. **B2B Module**: Business-to-business operations

#### Advanced Feature Modules:
21. **Analytics Module**: Business intelligence and reporting
22. **Backup Module**: Data backup and recovery
23. **Disaster Recovery Module**: Business continuity
24. **Mobile Module**: Mobile-specific optimizations

### Dependency Injection Strategy

#### NestJS DI Container:
```typescript
// Module-level providers
@Module({
  providers: [
    // Service registration
    UserService,
    
    // Factory providers
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (config: ConfigService) => createConnection(config),
      inject: [ConfigService],
    },
    
    // Value providers
    {
      provide: 'API_VERSION',
      useValue: '1.0.0',
    },
    
    // Class providers with custom tokens
    {
      provide: 'IUserRepository',
      useClass: DrizzleUserRepository,
    },
  ],
})
```

#### Dependency Hierarchy:
1. **Global Providers**: Available across all modules (Database, Cache, Logger)
2. **Module Providers**: Scoped to specific modules (Services, Repositories)
3. **Request Providers**: Created per request (User context, Tenant context)
4. **Singleton Providers**: Single instance across application (Configuration)

### Shared Libraries and Common Modules

#### GraphQL Common Module:
- Base resolvers and types
- Error handling utilities
- Pagination and filtering
- DataLoader service
- Performance monitoring
- Query complexity analysis

#### Validation Module:
- Custom validators
- Sanitization utilities
- Business rule validation
- Input transformation

#### Common Services:
- Encryption service
- Audit logging service
- Event emitter service
- File upload service
- Notification service

### Configuration Management

#### Environment-Based Configuration:
```typescript
// config/app.config.ts
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
}));
```

#### Configuration Validation:
```typescript
// Joi schema validation
export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  // ... additional validations
});
```

### Environment Handling

#### Development Environment:
- Hot reload with file watching
- Detailed error messages
- GraphQL playground enabled
- Comprehensive logging
- Database seeding
- Mock external services

#### Staging Environment:
- Production-like configuration
- Limited logging
- Performance monitoring
- Integration testing
- Security scanning
- Load testing

#### Production Environment:
- Optimized performance
- Error logging only
- Security hardening
- Monitoring and alerting
- Backup automation
- Disaster recovery

---
## 3️⃣ INFRASTRUCTURE & DEPLOYMENT

### Production Server Architecture

#### Multi-Tier Architecture:
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                  (NGINX/HAProxy)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐        ┌────▼────┐        ┌───▼───┐
│ App   │        │   App   │        │  App  │
│Server │        │ Server  │        │Server │
│  #1   │        │   #2    │        │  #3   │
└───┬───┘        └────┬────┘        └───┬───┘
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐        ┌────▼────┐        ┌───▼───┐
│Primary│        │  Read   │        │ Redis │
│  DB   │        │Replica  │        │Cluster│
└───────┘        └─────────┘        └───────┘
```

#### Server Specifications:
**Application Servers (3x):**
- CPU: 8 cores (Intel Xeon or AMD EPYC)
- RAM: 32GB DDR4
- Storage: 500GB NVMe SSD
- Network: 10Gbps
- OS: Ubuntu 22.04 LTS

**Database Servers:**
- Primary: 16 cores, 64GB RAM, 2TB NVMe SSD
- Read Replica: 8 cores, 32GB RAM, 1TB NVMe SSD
- Backup: Automated daily backups to S3

**Redis Cluster (3x):**
- CPU: 4 cores
- RAM: 16GB (12GB allocated to Redis)
- Storage: 200GB SSD
- Network: 1Gbps

### API Gateway Configuration

#### NGINX Configuration:
```nginx
upstream backend {
    least_conn;
    server app1.internal:3000 max_fails=3 fail_timeout=30s;
    server app2.internal:3000 max_fails=3 fail_timeout=30s;
    server app3.internal:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name api.businessplatform.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/api.businessplatform.com.crt;
    ssl_certificate_key /etc/ssl/private/api.businessplatform.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;
    
    # GraphQL Endpoint
    location /graphql {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket Support for Subscriptions
    location /graphql/subscriptions {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### GraphQL Server Setup

#### Apollo Server Configuration:
```typescript
// Enhanced GraphQL configuration
export class GraphQLConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      // Schema generation
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      
      // Performance optimizations
      introspection: !isProduction,
      playground: !isProduction,
      
      // Context setup with tenant isolation
      context: ({ req, res, connection }) => ({
        req,
        res,
        user: req.user,
        tenantId: req.user?.tenantId,
        dataloaders: new DataLoaderService(),
      }),
      
      // Subscription configuration
      subscriptions: {
        'graphql-ws': {
          onConnect: (context) => {
            const { connectionParams } = context;
            return {
              user: verifyToken(connectionParams.authorization),
              tenantId: connectionParams.tenantId,
            };
          },
        },
      },
      
      // Error handling
      formatError: (formattedError, error) => {
        // Log errors
        logger.error('GraphQL Error', { error, context });
        
        // Don't expose internal errors in production
        if (isProduction && error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return new Error('Internal server error');
        }
        
        return formattedError;
      },
      
      // Performance plugins
      plugins: [
        new QueryComplexityPlugin(1000), // Max complexity
        new PerformanceMonitoringPlugin(),
        new CacheControlPlugin(),
      ],
    };
  }
}
```

### Authentication Layer

#### JWT Strategy Implementation:
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthUser> {
    // Validate user exists and is active
    const user = await this.authService.validateUser(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check session validity
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      const isValidSession = await this.authService.validateSession(
        user.id,
        sessionId,
      );
      if (!isValidSession) {
        throw new UnauthorizedException('Invalid session');
      }
    }

    // Add tenant context
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      sessionId,
    };
  }
}
```

### Authorization & Role-Based Access Control

#### Permission System:
```typescript
// Permission structure
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

// Role-based permissions
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  tenantId: string;
}

// Permission conditions
interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt';
  value: any;
}
```

#### Permission Guard:
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = GqlExecutionContext.create(context).getContext();
    if (!user) {
      return false;
    }

    // Check permissions with caching
    return this.permissionsService.hasPermissions(
      user.id,
      requiredPermissions,
      user.tenantId,
    );
  }
}
```

### Database Choice and Justification

#### PostgreSQL Selection Rationale:
1. **ACID Compliance**: Critical for financial and business data
2. **JSON Support**: Flexible schema for varying business requirements
3. **Full-Text Search**: Built-in search capabilities
4. **Extensibility**: Custom functions and data types
5. **Performance**: Excellent query optimization and indexing
6. **Scalability**: Read replicas and partitioning support
7. **Ecosystem**: Rich tooling and community support

#### Database Configuration:
```typescript
// Primary database configuration
const primaryConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  
  // Connection pooling
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // Performance settings
  statement_timeout: 30000,
  query_timeout: 30000,
  application_name: 'business-platform',
  
  // SSL configuration
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('ca-certificate.crt').toString(),
  },
};

// Read replica configuration
const readReplicaConfigs = [
  {
    ...primaryConfig,
    host: process.env.DB_READ_REPLICA_1_HOST,
    max: 10, // Fewer connections for read replicas
  },
  {
    ...primaryConfig,
    host: process.env.DB_READ_REPLICA_2_HOST,
    max: 10,
  },
];
```

### Caching Strategy

#### Multi-Level Caching:
```typescript
// L1: Application-level caching (in-memory)
@Injectable()
export class L1CacheService {
  private cache = new Map<string, CacheItem>();
  private readonly maxSize = 1000;
  private readonly defaultTTL = 300000; // 5 minutes

  set(key: string, value: any, ttl?: number): void {
    // LRU eviction when cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

// L2: Redis distributed caching
@Injectable()
export class RedisCacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

#### Cache Invalidation Strategy:
```typescript
// Event-driven cache invalidation
@Injectable()
export class CacheInvalidationService {
  constructor(
    private eventEmitter: EventEmitter2,
    private cacheService: CacheService,
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // User-related cache invalidation
    this.eventEmitter.on('user.updated', async (event: UserUpdatedEvent) => {
      await this.cacheService.invalidatePattern(`user:${event.userId}:*`);
      await this.cacheService.invalidatePattern(`permissions:${event.userId}:*`);
    });

    // Tenant-related cache invalidation
    this.eventEmitter.on('tenant.updated', async (event: TenantUpdatedEvent) => {
      await this.cacheService.invalidatePattern(`tenant:${event.tenantId}:*`);
    });

    // Product-related cache invalidation
    this.eventEmitter.on('product.updated', async (event: ProductUpdatedEvent) => {
      await this.cacheService.invalidatePattern(`product:${event.productId}:*`);
      await this.cacheService.invalidatePattern(`inventory:*:${event.productId}`);
    });
  }
}
```

### Message Queues & Background Jobs

#### Bull Queue Configuration:
```typescript
// Queue module setup
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          db: 1, // Separate database for queues
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    
    // Individual queue registrations
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'reports' },
      { name: 'sync' },
      { name: 'notifications' },
      { name: 'analytics' },
    ),
  ],
})
export class QueueModule {}
```

#### Job Processors:
```typescript
// Email processor
@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, data, tenantId } = job.data;
    
    try {
      // Get tenant-specific email configuration
      const emailConfig = await this.getEmailConfig(tenantId);
      
      // Render email template
      const html = await this.templateService.render(template, data);
      
      // Send email
      await this.emailService.send({
        to,
        subject,
        html,
        from: emailConfig.fromAddress,
      });
      
      this.logger.log(`Email sent successfully to ${to}`, {
        jobId: job.id,
        tenantId,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack, {
        jobId: job.id,
        tenantId,
      });
      throw error;
    }
  }

  @Process('send-bulk-email')
  async handleBulkEmail(job: Job<BulkEmailJobData>): Promise<void> {
    const { emails, tenantId } = job.data;
    const results = [];

    for (const email of emails) {
      try {
        await this.handleSendEmail({ data: { ...email, tenantId } } as Job<EmailJobData>);
        results.push({ email: email.to, status: 'sent' });
      } catch (error) {
        results.push({ email: email.to, status: 'failed', error: error.message });
      }
    }

    // Store bulk email results
    await this.emailService.storeBulkResults(job.id, results);
  }
}
```

### File Storage

#### Multi-Provider File Storage:
```typescript
// File storage abstraction
interface FileStorageProvider {
  upload(file: Buffer, key: string, options?: UploadOptions): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

// AWS S3 implementation
@Injectable()
export class S3FileStorageProvider implements FileStorageProvider {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(file: Buffer, key: string, options: UploadOptions = {}): Promise<string> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
        Body: file,
        ContentType: options.contentType,
        ServerSideEncryption: 'AES256',
        Metadata: options.metadata,
      },
    });

    const result = await upload.done();
    return result.Location;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}

// Local file storage implementation
@Injectable()
export class LocalFileStorageProvider implements FileStorageProvider {
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    this.ensureUploadDirectory();
  }

  async upload(file: Buffer, key: string, options: UploadOptions = {}): Promise<string> {
    const filePath = path.join(this.uploadPath, key);
    const directory = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.promises.mkdir(directory, { recursive: true });
    
    // Write file
    await fs.promises.writeFile(filePath, file);
    
    return filePath;
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.uploadPath, key);
    return fs.promises.readFile(filePath);
  }
}
```

### CI/CD Pipeline

#### GitHub Actions Workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Run e2e tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: |
          docker build -t business-platform:${{ github.sha }} .
          docker tag business-platform:${{ github.sha }} business-platform:latest
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push business-platform:${{ github.sha }}
          docker push business-platform:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USERNAME }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/business-platform
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker system prune -f
```

### Monitoring, Logging, and Observability

#### Comprehensive Logging Strategy:
```typescript
// Custom logger service
@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private readonly winston: winston.Logger;

  constructor() {
    super();
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        
        // File transport for production
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
        
        // Elasticsearch transport for centralized logging
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: process.env.ELASTICSEARCH_URL,
          },
          index: 'business-platform-logs',
        }),
      ],
    });
  }

  log(message: string, context?: any): void {
    this.winston.info(message, { context, timestamp: new Date().toISOString() });
  }

  error(message: string, trace?: string, context?: any): void {
    this.winston.error(message, { trace, context, timestamp: new Date().toISOString() });
  }

  warn(message: string, context?: any): void {
    this.winston.warn(message, { context, timestamp: new Date().toISOString() });
  }

  debug(message: string, context?: any): void {
    this.winston.debug(message, { context, timestamp: new Date().toISOString() });
  }
}
```

#### Performance Monitoring:
```typescript
// Performance monitoring interceptor
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        
        // Log slow requests
        if (duration > 1000) {
          this.logger.warn('Slow request detected', {
            method,
            url,
            duration,
            userId: user?.id,
            tenantId: user?.tenantId,
          });
        }

        // Log all requests in debug mode
        this.logger.debug('Request completed', {
          method,
          url,
          duration,
          userId: user?.id,
          tenantId: user?.tenantId,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        
        this.logger.error('Request failed', error.stack, {
          method,
          url,
          duration,
          userId: user?.id,
          tenantId: user?.tenantId,
          error: error.message,
        });
        
        throw error;
      }),
    );
  }
}
```

#### Health Checks:
```typescript
// Comprehensive health checks
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Redis health
      () => this.redis.pingCheck('redis'),
      
      // Disk space health
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.9,
      }),
      
      // Memory health
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      
      // Custom business logic health
      () => this.checkBusinessLogic(),
    ]);
  }

  private async checkBusinessLogic(): Promise<HealthIndicatorResult> {
    try {
      // Check if critical services are responding
      const criticalServices = [
        'auth',
        'tenant',
        'database',
        'cache',
        'queue',
      ];

      for (const service of criticalServices) {
        await this.pingService(service);
      }

      return {
        business_logic: {
          status: 'up',
          services: criticalServices,
        },
      };
    } catch (error) {
      return {
        business_logic: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }
}
```

### Horizontal & Vertical Scaling Strategies

#### Horizontal Scaling:
1. **Stateless Application Design**
   - No server-side sessions (JWT tokens)
   - Shared Redis for caching
   - Database connection pooling

2. **Load Balancing**
   - Round-robin distribution
   - Health check-based routing
   - Session affinity for WebSocket connections

3. **Database Scaling**
   - Read replicas for query distribution
   - Connection pooling with pgBouncer
   - Query optimization and indexing

4. **Cache Scaling**
   - Redis cluster for distributed caching
   - Cache partitioning by tenant
   - Automatic failover

#### Vertical Scaling:
1. **Resource Optimization**
   - Memory profiling and optimization
   - CPU usage monitoring
   - Database query optimization

2. **Performance Tuning**
   - Connection pool sizing
   - Cache hit ratio optimization
   - Query complexity limits

3. **Capacity Planning**
   - Resource usage monitoring
   - Predictive scaling based on metrics
   - Cost optimization strategies

---
## 4️⃣ DATABASE DESIGN

### Database Type and Architecture

#### PostgreSQL as Primary Database:
The system uses **PostgreSQL 15+** as the primary database with the following architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Drizzle ORM                             │
│            (Type-safe Query Builder)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐        ┌────▼────┐        ┌───▼───┐
│Primary│        │  Read   │        │  Read │
│  DB   │        │Replica 1│        │Replica 2│
│(Write)│        │ (Read)  │        │ (Read) │
└───────┘        └─────────┘        └───────┘
```

#### Database Selection Rationale:
1. **ACID Compliance**: Essential for financial transactions and business data integrity
2. **JSON/JSONB Support**: Flexible schema for varying business requirements across tenants
3. **Full-Text Search**: Built-in search capabilities for products, customers, and documents
4. **Advanced Indexing**: GIN, GiST, and partial indexes for performance optimization
5. **Row-Level Security**: Native multi-tenant data isolation
6. **Extensibility**: Custom functions, triggers, and data types
7. **Scalability**: Read replicas, partitioning, and connection pooling
8. **Ecosystem**: Rich tooling (pgAdmin, pg_stat_statements, etc.)

### Schema Design Philosophy

#### Multi-Tenant Architecture:
Every table includes tenant isolation with the following patterns:

```sql
-- Base table structure
CREATE TABLE base_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1 -- Optimistic locking
);

-- Row-level security policy
ALTER TABLE base_entity ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON base_entity
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### Audit Trail Pattern:
```sql
-- Audit log table for all changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_audit_logs_tenant_table (tenant_id, table_name),
    INDEX idx_audit_logs_record (record_id),
    INDEX idx_audit_logs_timestamp (timestamp),
    INDEX idx_audit_logs_user (user_id)
);
```

### Complete Database Schema (All Tables)

#### 1. Core System Tables

```sql
-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    business_type VARCHAR(50) NOT NULL, -- 'manufacturing', 'retail', 'wholesale', 'service'
    tier VARCHAR(20) DEFAULT 'starter', -- 'starter', 'professional', 'enterprise'
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    
    -- MFA settings
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    backup_codes TEXT[],
    
    -- Account status
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, name)
);

-- User roles junction table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    
    UNIQUE(user_id, role_id)
);
```

#### 2. Customer Management Tables

```sql
-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'business'
    
    -- Basic information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    website VARCHAR(255),
    
    -- Business information
    tax_number VARCHAR(50),
    registration_number VARCHAR(50),
    industry VARCHAR(100),
    
    -- Financial information
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Address information
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Preferences
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Status and categorization
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(50),
    source VARCHAR(50),
    tags TEXT[],
    
    -- Loyalty program
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    
    -- Metadata
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1
);

-- Customer contacts table
CREATE TABLE customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true
);

-- Customer interactions table
CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    priority VARCHAR(20) DEFAULT 'medium',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Related records
    related_to_type VARCHAR(50), -- 'order', 'quote', 'invoice', etc.
    related_to_id UUID,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true
);
```

#### 3. Product and Inventory Tables

```sql
-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    path TEXT, -- Materialized path for hierarchy
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    image_url TEXT,
    
    -- SEO and metadata
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, slug)
);

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, name)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Categorization
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    tags TEXT[],
    
    -- Product type and attributes
    type VARCHAR(50) DEFAULT 'simple', -- 'simple', 'variable', 'grouped', 'bundle'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'discontinued'
    
    -- Pricing
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2) NOT NULL,
    msrp DECIMAL(15,2), -- Manufacturer's Suggested Retail Price
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Physical attributes
    weight DECIMAL(10,3),
    dimensions JSONB, -- {length, width, height, unit}
    
    -- Inventory settings
    track_inventory BOOLEAN DEFAULT true,
    manage_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    
    -- Manufacturing/Assembly
    is_manufactured BOOLEAN DEFAULT false,
    manufacturing_time_days INTEGER,
    bill_of_materials JSONB, -- For manufactured products
    
    -- Digital/Service products
    is_digital BOOLEAN DEFAULT false,
    is_service BOOLEAN DEFAULT false,
    service_duration_minutes INTEGER,
    
    -- Tax and compliance
    tax_class VARCHAR(50),
    harmonized_code VARCHAR(20), -- For international trade
    country_of_origin VARCHAR(2),
    
    -- Media and content
    images JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    
    -- SEO and e-commerce
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    search_keywords TEXT[],
    
    -- Custom attributes
    attributes JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    UNIQUE(tenant_id, sku)
);

-- Product variants table (for variable products)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    
    -- Variant attributes (size, color, etc.)
    attributes JSONB NOT NULL,
    
    -- Pricing (can override parent product)
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Physical attributes
    weight DECIMAL(10,3),
    dimensions JSONB,
    
    -- Media
    images JSONB DEFAULT '[]',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, sku)
);

-- Inventory transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    location_id UUID REFERENCES locations(id),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Transaction details
    type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'transfer', 'return'
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    
    -- Reference information
    reference_type VARCHAR(50), -- 'purchase_order', 'sales_order', 'adjustment', etc.
    reference_id UUID,
    reference_number VARCHAR(100),
    
    -- Batch/Lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Notes and metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_inventory_transactions_product (product_id),
    INDEX idx_inventory_transactions_location (location_id),
    INDEX idx_inventory_transactions_date (created_at),
    INDEX idx_inventory_transactions_type (type)
);
```

#### 4. Financial Management Tables

```sql
-- Chart of accounts table
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    account_subtype VARCHAR(50),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    
    -- Account properties
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false,
    allow_manual_entries BOOLEAN DEFAULT true,
    
    -- Balance information
    normal_balance VARCHAR(10) NOT NULL, -- 'debit' or 'credit'
    current_balance DECIMAL(15,2) DEFAULT 0,
    
    -- Tax settings
    tax_account BOOLEAN DEFAULT false,
    tax_rate DECIMAL(5,4),
    
    -- Description and notes
    description TEXT,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, account_code)
);

-- Journal entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    
    -- Entry type and status
    entry_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'automatic', 'recurring'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'posted', 'reversed'
    
    -- Reference information
    reference_type VARCHAR(50),
    reference_id UUID,
    reference_number VARCHAR(100),
    
    -- Totals (for validation)
    total_debits DECIMAL(15,2) DEFAULT 0,
    total_credits DECIMAL(15,2) DEFAULT 0,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Reversal information
    reversed_by UUID REFERENCES users(id),
    reversed_at TIMESTAMP WITH TIME ZONE,
    reversal_reason TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, entry_number)
);

-- Journal entry lines table
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    
    -- Line details
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Additional dimensions
    department VARCHAR(100),
    project_code VARCHAR(50),
    cost_center VARCHAR(50),
    
    -- Reference information
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CHECK (debit_amount = 0 OR credit_amount = 0) -- One must be zero
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Invoice details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL,
    
    -- Currency and exchange
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    
    -- Terms and conditions
    payment_terms INTEGER DEFAULT 30,
    notes TEXT,
    terms_conditions TEXT,
    
    -- Reference information
    purchase_order_number VARCHAR(100),
    project_id UUID,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, invoice_number)
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- Line item details
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    
    -- Tax information
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Discount information
    discount_rate DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Additional information
    unit_of_measure VARCHAR(20),
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    -- Payment details
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    
    -- Payment method
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'check', 'credit_card', 'bank_transfer', etc.
    payment_reference VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Bank/Account information
    bank_account VARCHAR(100),
    check_number VARCHAR(50),
    
    -- Notes
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, payment_number)
);

-- Payment allocations table (for applying payments to invoices)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    allocated_amount DECIMAL(15,2) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Ensure allocation doesn't exceed payment or invoice balance
    CHECK (allocated_amount > 0)
);
```

#### 5. Employee and HR Tables

```sql
-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Link to user account if employee has system access
    employee_number VARCHAR(50) NOT NULL,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    emergency_contact JSONB,
    
    -- Address information
    home_address JSONB,
    mailing_address JSONB,
    
    -- Employment information
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_type VARCHAR(50) DEFAULT 'full_time', -- 'full_time', 'part_time', 'contract', 'intern'
    employment_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'terminated', 'on_leave'
    
    -- Job information
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    manager_id UUID REFERENCES employees(id),
    location_id UUID REFERENCES locations(id),
    
    -- Compensation
    salary DECIMAL(15,2),
    hourly_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    pay_frequency VARCHAR(20), -- 'weekly', 'bi_weekly', 'monthly', 'annual'
    
    -- Benefits and PTO
    vacation_days_per_year INTEGER DEFAULT 0,
    sick_days_per_year INTEGER DEFAULT 0,
    vacation_days_used INTEGER DEFAULT 0,
    sick_days_used INTEGER DEFAULT 0,
    
    -- Tax and legal information
    tax_id VARCHAR(50), -- SSN, SIN, etc.
    work_authorization VARCHAR(50),
    visa_status VARCHAR(50),
    visa_expiry_date DATE,
    
    -- Banking information (encrypted)
    bank_account_info JSONB, -- Encrypted banking details for payroll
    
    -- Performance and notes
    performance_rating DECIMAL(3,2),
    notes TEXT,
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    UNIQUE(tenant_id, employee_number)
);

-- Time tracking table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Time tracking details
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Work details
    project_id UUID,
    task_description TEXT,
    work_type VARCHAR(50), -- 'regular', 'overtime', 'break', 'meeting', etc.
    
    -- Location tracking
    location_id UUID REFERENCES locations(id),
    clock_in_location JSONB, -- GPS coordinates, IP address, etc.
    clock_out_location JSONB,
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Billing information
    billable BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    total_amount DECIMAL(15,2),
    
    -- Notes
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Payroll table
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Payroll period
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'calculated', 'approved', 'paid'
    
    -- Totals
    total_gross_pay DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_net_pay DECIMAL(15,2) DEFAULT 0,
    total_employer_taxes DECIMAL(15,2) DEFAULT 0,
    
    -- Processing information
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Payroll entries table
CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Pay calculation
    regular_hours DECIMAL(8,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    regular_rate DECIMAL(10,2) DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    
    -- Earnings
    regular_pay DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    commission DECIMAL(15,2) DEFAULT 0,
    other_earnings DECIMAL(15,2) DEFAULT 0,
    gross_pay DECIMAL(15,2) NOT NULL,
    
    -- Deductions
    federal_tax DECIMAL(15,2) DEFAULT 0,
    state_tax DECIMAL(15,2) DEFAULT 0,
    social_security DECIMAL(15,2) DEFAULT 0,
    medicare DECIMAL(15,2) DEFAULT 0,
    health_insurance DECIMAL(15,2) DEFAULT 0,
    retirement_401k DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    
    -- Net pay
    net_pay DECIMAL(15,2) NOT NULL,
    
    -- Employer costs
    employer_social_security DECIMAL(15,2) DEFAULT 0,
    employer_medicare DECIMAL(15,2) DEFAULT 0,
    unemployment_tax DECIMAL(15,2) DEFAULT 0,
    workers_comp DECIMAL(15,2) DEFAULT 0,
    
    -- Year-to-date totals
    ytd_gross_pay DECIMAL(15,2) DEFAULT 0,
    ytd_net_pay DECIMAL(15,2) DEFAULT 0,
    ytd_federal_tax DECIMAL(15,2) DEFAULT 0,
    ytd_state_tax DECIMAL(15,2) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

#### 6. Supplier and Procurement Tables

```sql
-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_number VARCHAR(50) NOT NULL,
    
    -- Basic information
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Business information
    tax_number VARCHAR(50),
    registration_number VARCHAR(50),
    industry VARCHAR(100),
    
    -- Address information
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Financial information
    payment_terms INTEGER DEFAULT 30, -- Days
    credit_limit DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Performance metrics
    quality_rating DECIMAL(3,2) DEFAULT 0,
    delivery_rating DECIMAL(3,2) DEFAULT 0,
    service_rating DECIMAL(3,2) DEFAULT 0,
    overall_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Status and categorization
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'blocked'
    category VARCHAR(50),
    tags TEXT[],
    
    -- Compliance and certifications
    certifications JSONB DEFAULT '[]',
    insurance_info JSONB,
    
    -- Notes and custom fields
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    UNIQUE(tenant_id, supplier_number)
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    po_number VARCHAR(50) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Order details
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'
    
    -- Delivery information
    delivery_address JSONB,
    delivery_instructions TEXT,
    
    -- Financial information
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Terms and conditions
    payment_terms INTEGER DEFAULT 30,
    notes TEXT,
    terms_conditions TEXT,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Reference information
    requisition_number VARCHAR(100),
    project_id UUID,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(tenant_id, po_number)
);

-- Purchase order line items table
CREATE TABLE purchase_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- Line item details
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    
    -- Delivery tracking
    quantity_received DECIMAL(10,3) DEFAULT 0,
    quantity_remaining DECIMAL(10,3) NOT NULL,
    
    -- Tax information
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Additional information
    unit_of_measure VARCHAR(20),
    expected_delivery_date DATE,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Goods received notes table
CREATE TABLE goods_received_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    grn_number VARCHAR(50) NOT NULL,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Receipt details
    received_date DATE NOT NULL,
    received_by UUID NOT NULL REFERENCES employees(id),
    
    -- Delivery information
    delivery_note_number VARCHAR(100),
    carrier VARCHAR(255),
    tracking_number VARCHAR(100),
    
    -- Quality control
    inspection_required BOOLEAN DEFAULT false,
    inspection_status VARCHAR(20), -- 'pending', 'passed', 'failed', 'partial'
    inspected_by UUID REFERENCES employees(id),
    inspected_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'received', -- 'received', 'inspected', 'accepted', 'rejected'
    
    -- Notes
    notes TEXT,
    rejection_reason TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(tenant_id, grn_number)
);

-- Goods received note line items table
CREATE TABLE grn_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    grn_id UUID NOT NULL REFERENCES goods_received_notes(id) ON DELETE CASCADE,
    po_line_item_id UUID NOT NULL REFERENCES purchase_order_line_items(id),
    product_id UUID REFERENCES products(id),
    
    -- Receipt details
    quantity_ordered DECIMAL(10,3) NOT NULL,
    quantity_received DECIMAL(10,3) NOT NULL,
    quantity_accepted DECIMAL(10,3) DEFAULT 0,
    quantity_rejected DECIMAL(10,3) DEFAULT 0,
    
    -- Quality information
    condition_on_receipt VARCHAR(50), -- 'good', 'damaged', 'defective'
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Notes
    notes TEXT,
    rejection_reason TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

### Relationships Between Major Entities

#### Entity Relationship Diagram (Conceptual):
```
TENANTS (1) ──────── (∞) USERS
   │                     │
   │                     │
   └─── (∞) CUSTOMERS    └─── (∞) EMPLOYEES
   │         │                     │
   │         │                     │
   │         └─── (∞) INVOICES     └─── (∞) TIME_ENTRIES
   │                   │                     │
   │                   │                     │
   └─── (∞) PRODUCTS   └─── (∞) PAYMENTS    └─── (∞) PAYROLL_ENTRIES
         │                                         │
         │                                         │
         └─── (∞) INVENTORY_TRANSACTIONS          └─── (∞) PAYROLL_RUNS
               │
               │
               └─── (∞) PURCHASE_ORDERS ──── (∞) SUPPLIERS
                         │
                         │
                         └─── (∞) GOODS_RECEIVED_NOTES
```

#### Key Relationships:

1. **Tenant → All Entities**: Every table has a `tenant_id` for data isolation
2. **Users → Employees**: Optional 1:1 relationship for system access
3. **Customers → Invoices**: 1:∞ relationship for billing
4. **Products → Inventory**: 1:∞ relationship for stock tracking
5. **Suppliers → Purchase Orders**: 1:∞ relationship for procurement
6. **Employees → Time Entries**: 1:∞ relationship for time tracking
7. **Categories → Products**: 1:∞ hierarchical relationship
8. **Locations → Inventory**: 1:∞ relationship for multi-location stock

### Multi-Tenant Considerations

#### Row-Level Security Implementation:
```sql
-- Enable RLS on all tenant tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tenant tables)

-- Create policies for tenant isolation
CREATE POLICY tenant_isolation_customers ON customers
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_products ON products
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ... (repeat for all tenant tables)
```

#### Tenant Context Setting:
```sql
-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql;

-- Usage in application
SELECT set_tenant_context('tenant-uuid-here');
```

### Data Isolation Strategies

#### 1. Schema-per-Tenant (Not Used):
- Pros: Complete isolation, easy backup/restore per tenant
- Cons: Complex migrations, resource overhead, limited scalability

#### 2. Database-per-Tenant (Not Used):
- Pros: Maximum isolation, independent scaling
- Cons: High resource usage, complex management, expensive

#### 3. Row-Level Security (Chosen Approach):
- Pros: Single schema, efficient resource usage, easy management
- Cons: Requires careful implementation, potential for data leaks

#### Implementation Benefits:
1. **Single Database**: Easier maintenance and backups
2. **Efficient Queries**: PostgreSQL optimizes RLS policies
3. **Automatic Enforcement**: Cannot accidentally access wrong tenant data
4. **Flexible**: Can add tenant-specific columns without schema changes
5. **Scalable**: Handles thousands of tenants efficiently

### Performance Optimization

#### Indexing Strategy:
```sql
-- Composite indexes for tenant isolation and performance
CREATE INDEX idx_customers_tenant_active ON customers(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_products_tenant_sku ON products(tenant_id, sku);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_inventory_tenant_product ON inventory_transactions(tenant_id, product_id);

-- Partial indexes for common queries
CREATE INDEX idx_invoices_unpaid ON invoices(tenant_id, due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX idx_products_active ON products(tenant_id, category_id) WHERE is_active = true;

-- Full-text search indexes
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('english', 
    coalesce(first_name, '') || ' ' || 
    coalesce(last_name, '') || ' ' || 
    coalesce(company_name, '') || ' ' || 
    coalesce(email, '')
));

CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english',
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(sku, '')
));
```

#### Query Optimization Techniques:
1. **Prepared Statements**: Reduce parsing overhead
2. **Connection Pooling**: Efficient connection management
3. **Read Replicas**: Distribute read queries
4. **Materialized Views**: Pre-computed aggregations
5. **Partitioning**: Large table performance (by tenant or date)

### Migrations and Versioning

#### Migration Strategy:
```typescript
// Drizzle migration example
import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  // Create new table
  await db.execute(sql`
    CREATE TABLE new_feature_table (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true
    );
  `);

  // Enable RLS
  await db.execute(sql`ALTER TABLE new_feature_table ENABLE ROW LEVEL SECURITY;`);
  
  // Create policy
  await db.execute(sql`
    CREATE POLICY tenant_isolation_new_feature ON new_feature_table
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
  `);

  // Create indexes
  await db.execute(sql`
    CREATE INDEX idx_new_feature_tenant ON new_feature_table(tenant_id);
  `);
}

export async function down(db: any) {
  await db.execute(sql`DROP TABLE IF EXISTS new_feature_table;`);
}
```

#### Version Control:
1. **Sequential Migrations**: Numbered migration files
2. **Rollback Support**: Down migrations for each up migration
3. **Schema Validation**: Ensure migrations match expected schema
4. **Testing**: Automated migration testing in CI/CD
5. **Backup Before Migration**: Automatic backups before major changes

---
## 5️⃣ GRAPHQL API DESIGN

### GraphQL Schema Organization

The GraphQL schema is organized using a **modular approach** where each business domain module contributes its own schema definitions. This creates a unified, strongly-typed API while maintaining clear boundaries between different business areas.

#### Schema Structure:
```
src/
├── schema.gql (Auto-generated unified schema)
├── modules/
│   ├── auth/
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── session.types.ts
│   │   └── resolvers/
│   │       ├── auth.resolver.ts
│   │       └── user.resolver.ts
│   ├── crm/
│   │   ├── types/
│   │   │   ├── customer.types.ts
│   │   │   └── interaction.types.ts
│   │   └── resolvers/
│   │       └── customer.resolver.ts
│   └── [other modules...]
└── common/
    └── graphql/
        ├── base.types.ts
        ├── pagination.args.ts
        └── scalars.ts
```

#### Schema Composition Strategy:
```typescript
// Auto-generated schema file structure
@ObjectType()
export class Query {
  // Auth module queries
  @Field(() => User, { nullable: true })
  me: User;
  
  @Field(() => [User])
  users: User[];
  
  // CRM module queries
  @Field(() => [Customer])
  customers: Customer[];
  
  @Field(() => Customer, { nullable: true })
  customer: Customer;
  
  // Financial module queries
  @Field(() => [Invoice])
  invoices: Invoice[];
  
  // ... all other module queries
}

@ObjectType()
export class Mutation {
  // Auth mutations
  @Field(() => AuthResponse)
  login: AuthResponse;
  
  @Field(() => User)
  updateProfile: User;
  
  // CRM mutations
  @Field(() => Customer)
  createCustomer: Customer;
  
  @Field(() => Customer)
  updateCustomer: Customer;
  
  // ... all other module mutations
}

@ObjectType()
export class Subscription {
  // Real-time subscriptions from all modules
  @Field(() => User)
  userUpdated: User;
  
  @Field(() => Order)
  orderStatusChanged: Order;
  
  @Field(() => InventoryUpdate)
  inventoryChanged: InventoryUpdate;
  
  // ... all other module subscriptions
}
```

### How Schemas are Split Per Module

Each module defines its own GraphQL types, inputs, and resolvers, which are then automatically composed into the unified schema:

#### Module Schema Pattern:
```typescript
// modules/crm/types/customer.types.ts
@ObjectType()
export class Customer {
  @Field(() => ID)
  id: string;

  @Field()
  customerNumber: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  companyName?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => CustomerType)
  type: CustomerType;

  @Field(() => CustomerStatus)
  status: CustomerStatus;

  @Field(() => GraphQLDecimal)
  creditLimit: number;

  @Field(() => Int)
  paymentTerms: number;

  @Field(() => [CustomerContact])
  contacts: CustomerContact[];

  @Field(() => [CustomerInteraction])
  interactions: CustomerInteraction[];

  @Field(() => [Invoice])
  invoices: Invoice[];

  @Field(() => CustomerStats)
  stats: CustomerStats;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => User)
  createdBy: User;

  @Field(() => User)
  updatedBy: User;
}

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsNotEmpty()
  @Length(1, 100)
  firstName: string;

  @Field()
  @IsNotEmpty()
  @Length(1, 100)
  lastName: string;

  @Field({ nullable: true })
  @Length(1, 255)
  companyName?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  phone?: string;

  @Field(() => CustomerType, { defaultValue: CustomerType.INDIVIDUAL })
  type: CustomerType;

  @Field(() => GraphQLDecimal, { defaultValue: 0 })
  @Min(0)
  creditLimit: number;

  @Field(() => Int, { defaultValue: 30 })
  @Min(1)
  @Max(365)
  paymentTerms: number;

  @Field(() => CreateAddressInput, { nullable: true })
  billingAddress?: CreateAddressInput;

  @Field(() => CreateAddressInput, { nullable: true })
  shippingAddress?: CreateAddressInput;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateCustomerInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Length(1, 100)
  firstName?: string;

  @Field({ nullable: true })
  @Length(1, 100)
  lastName?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  companyName?: string;

  @Field({ nullable: true })
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  phone?: string;

  @Field(() => CustomerType, { nullable: true })
  type?: CustomerType;

  @Field(() => CustomerStatus, { nullable: true })
  status?: CustomerStatus;

  @Field(() => GraphQLDecimal, { nullable: true })
  @Min(0)
  creditLimit?: number;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(365)
  paymentTerms?: number;

  @Field(() => UpdateAddressInput, { nullable: true })
  billingAddress?: UpdateAddressInput;

  @Field(() => UpdateAddressInput, { nullable: true })
  shippingAddress?: UpdateAddressInput;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  notes?: string;
}

@ArgsType()
export class CustomersArgs extends PaginationArgs {
  @Field({ nullable: true })
  search?: string;

  @Field(() => CustomerType, { nullable: true })
  type?: CustomerType;

  @Field(() => CustomerStatus, { nullable: true })
  status?: CustomerStatus;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => CustomerSortField, { nullable: true, defaultValue: CustomerSortField.CREATED_AT })
  sortBy?: CustomerSortField;

  @Field(() => SortOrder, { nullable: true, defaultValue: SortOrder.DESC })
  sortOrder?: SortOrder;
}
```

### Complete GraphQL Operations by Module

Now I'll provide the comprehensive list of ALL GraphQL operations for each of the 24 modules:

#### 🔐 AUTH MODULE

**Queries:**
```typescript
// User authentication and profile queries
me: User                                    // Get current user profile
users(args: UsersArgs): UserConnection      // List all users (admin only)
user(id: ID!): User                        // Get user by ID
userSessions(userId: ID!): [UserSession]   // Get user's active sessions
permissions: [Permission]                   // Get current user's permissions
roles: [Role]                              // Get available roles
userPermissions(userId: ID!): [Permission] // Get specific user's permissions
mfaStatus: MfaStatus                       // Get MFA configuration status
backupCodes: [String]                      // Get MFA backup codes
```

**Mutations:**
```typescript
// Authentication mutations
login(input: LoginInput!): AuthResponse
logout: Boolean
refreshToken(refreshToken: String!): AuthResponse
forgotPassword(email: String!): Boolean
resetPassword(input: ResetPasswordInput!): Boolean
changePassword(input: ChangePasswordInput!): Boolean
verifyEmail(token: String!): Boolean
resendEmailVerification: Boolean

// MFA mutations
enableMfa(input: EnableMfaInput!): MfaSetupResponse
disableMfa(input: DisableMfaInput!): Boolean
verifyMfa(input: VerifyMfaInput!): Boolean
generateBackupCodes: [String]
verifyBackupCode(code: String!): Boolean

// User management mutations
createUser(input: CreateUserInput!): User
updateUser(input: UpdateUserInput!): User
deleteUser(id: ID!): Boolean
activateUser(id: ID!): User
deactivateUser(id: ID!): User
updateUserRoles(input: UpdateUserRolesInput!): User
updateUserPermissions(input: UpdateUserPermissionsInput!): User

// Session management mutations
terminateSession(sessionId: ID!): Boolean
terminateAllSessions(userId: ID!): Boolean

// Role and permission mutations
createRole(input: CreateRoleInput!): Role
updateRole(input: UpdateRoleInput!): Role
deleteRole(id: ID!): Boolean
assignPermissionsToRole(input: AssignPermissionsInput!): Role
removePermissionsFromRole(input: RemovePermissionsInput!): Role
```

**Subscriptions:**
```typescript
// Real-time authentication events
userLoggedIn: User                         // User login events
userLoggedOut: User                        // User logout events
userUpdated: User                          // User profile updates
userRolesChanged(userId: ID!): User        // Role assignment changes
userPermissionsChanged(userId: ID!): User  // Permission changes
sessionExpired: UserSession               // Session expiration alerts
securityAlert: SecurityAlert             // Security-related alerts
```

#### 👥 CRM MODULE

**Queries:**
```typescript
// Customer queries
customers(args: CustomersArgs): CustomerConnection
customer(id: ID!): Customer
customerByNumber(customerNumber: String!): Customer
customerStats(customerId: ID!): CustomerStats
customerInteractions(customerId: ID!, args: InteractionsArgs): InteractionConnection
customerInvoices(customerId: ID!, args: InvoicesArgs): InvoiceConnection
customerPayments(customerId: ID!, args: PaymentsArgs): PaymentConnection
customerOrders(customerId: ID!, args: OrdersArgs): OrderConnection

// Customer contact queries
customerContacts(customerId: ID!): [CustomerContact]
customerContact(id: ID!): CustomerContact

// Interaction queries
interactions(args: InteractionsArgs): InteractionConnection
interaction(id: ID!): CustomerInteraction
upcomingInteractions(args: UpcomingInteractionsArgs): InteractionConnection
overdueInteractions(args: OverdueInteractionsArgs): InteractionConnection

// Loyalty program queries
loyaltyPrograms: [LoyaltyProgram]
loyaltyProgram(id: ID!): LoyaltyProgram
customerLoyaltyStatus(customerId: ID!): CustomerLoyaltyStatus
loyaltyTransactions(customerId: ID!, args: LoyaltyTransactionsArgs): LoyaltyTransactionConnection

// Segmentation queries
customerSegments: [CustomerSegment]
customerSegment(id: ID!): CustomerSegment
customersInSegment(segmentId: ID!, args: PaginationArgs): CustomerConnection

// Campaign queries
campaigns(args: CampaignsArgs): CampaignConnection
campaign(id: ID!): Campaign
campaignStats(campaignId: ID!): CampaignStats
campaignCustomers(campaignId: ID!, args: PaginationArgs): CustomerConnection
```

**Mutations:**
```typescript
// Customer mutations
createCustomer(input: CreateCustomerInput!): Customer
updateCustomer(input: UpdateCustomerInput!): Customer
deleteCustomer(id: ID!): Boolean
activateCustomer(id: ID!): Customer
deactivateCustomer(id: ID!): Customer
mergeCustomers(input: MergeCustomersInput!): Customer
bulkUpdateCustomers(input: BulkUpdateCustomersInput!): BulkUpdateResult
importCustomers(input: ImportCustomersInput!): ImportResult
exportCustomers(input: ExportCustomersInput!): ExportResult

// Customer contact mutations
createCustomerContact(input: CreateCustomerContactInput!): CustomerContact
updateCustomerContact(input: UpdateCustomerContactInput!): CustomerContact
deleteCustomerContact(id: ID!): Boolean
setPrimaryContact(contactId: ID!): CustomerContact

// Interaction mutations
createInteraction(input: CreateInteractionInput!): CustomerInteraction
updateInteraction(input: UpdateInteractionInput!): CustomerInteraction
deleteInteraction(id: ID!): Boolean
completeInteraction(id: ID!): CustomerInteraction
scheduleInteraction(input: ScheduleInteractionInput!): CustomerInteraction
bulkCreateInteractions(input: BulkCreateInteractionsInput!): BulkCreateResult

// Loyalty program mutations
createLoyaltyProgram(input: CreateLoyaltyProgramInput!): LoyaltyProgram
updateLoyaltyProgram(input: UpdateLoyaltyProgramInput!): LoyaltyProgram
deleteLoyaltyProgram(id: ID!): Boolean
enrollCustomerInLoyalty(input: EnrollCustomerInput!): CustomerLoyaltyStatus
awardLoyaltyPoints(input: AwardPointsInput!): LoyaltyTransaction
redeemLoyaltyPoints(input: RedeemPointsInput!): LoyaltyTransaction
adjustLoyaltyPoints(input: AdjustPointsInput!): LoyaltyTransaction

// Segmentation mutations
createCustomerSegment(input: CreateSegmentInput!): CustomerSegment
updateCustomerSegment(input: UpdateSegmentInput!): CustomerSegment
deleteCustomerSegment(id: ID!): Boolean
refreshSegment(id: ID!): CustomerSegment
addCustomersToSegment(input: AddCustomersToSegmentInput!): CustomerSegment
removeCustomersFromSegment(input: RemoveCustomersFromSegmentInput!): CustomerSegment

// Campaign mutations
createCampaign(input: CreateCampaignInput!): Campaign
updateCampaign(input: UpdateCampaignInput!): Campaign
deleteCampaign(id: ID!): Boolean
launchCampaign(id: ID!): Campaign
pauseCampaign(id: ID!): Campaign
resumeCampaign(id: ID!): Campaign
completeCampaign(id: ID!): Campaign
addCustomersToCampaign(input: AddCustomersToCampaignInput!): Campaign
removeCustomersFromCampaign(input: RemoveCustomersFromCampaignInput!): Campaign
```

**Subscriptions:**
```typescript
// Customer real-time updates
customerCreated: Customer
customerUpdated(customerId: ID): Customer
customerDeleted: CustomerDeletedEvent
customerStatusChanged(customerId: ID): Customer

// Interaction real-time updates
interactionCreated(customerId: ID): CustomerInteraction
interactionUpdated(interactionId: ID): CustomerInteraction
interactionCompleted(customerId: ID): CustomerInteraction
upcomingInteractionReminder: CustomerInteraction

// Loyalty program updates
loyaltyPointsAwarded(customerId: ID): LoyaltyTransaction
loyaltyPointsRedeemed(customerId: ID): LoyaltyTransaction
loyaltyTierChanged(customerId: ID): CustomerLoyaltyStatus

// Campaign updates
campaignLaunched: Campaign
campaignCompleted: Campaign
campaignStatsUpdated(campaignId: ID): CampaignStats
```

#### 💰 FINANCIAL MODULE

**Queries:**
```typescript
// Chart of accounts queries
chartOfAccounts(args: ChartOfAccountsArgs): ChartOfAccountConnection
account(id: ID!): ChartOfAccount
accountByCode(accountCode: String!): ChartOfAccount
accountBalance(accountId: ID!, asOfDate: Date): AccountBalance
accountBalances(accountIds: [ID!]!, asOfDate: Date): [AccountBalance]
trialBalance(asOfDate: Date): TrialBalance

// Journal entry queries
journalEntries(args: JournalEntriesArgs): JournalEntryConnection
journalEntry(id: ID!): JournalEntry
journalEntryByNumber(entryNumber: String!): JournalEntry
pendingJournalEntries: [JournalEntry]
journalEntryLines(journalEntryId: ID!): [JournalEntryLine]

// Invoice queries
invoices(args: InvoicesArgs): InvoiceConnection
invoice(id: ID!): Invoice
invoiceByNumber(invoiceNumber: String!): Invoice
overdueInvoices(args: OverdueInvoicesArgs): InvoiceConnection
unpaidInvoices(args: UnpaidInvoicesArgs): InvoiceConnection
invoiceStats: InvoiceStats
invoiceLineItems(invoiceId: ID!): [InvoiceLineItem]

// Payment queries
payments(args: PaymentsArgs): PaymentConnection
payment(id: ID!): Payment
paymentByNumber(paymentNumber: String!): Payment
unappliedPayments: [Payment]
paymentAllocations(paymentId: ID!): [PaymentAllocation]

// Financial reporting queries
incomeStatement(input: IncomeStatementInput!): IncomeStatement
balanceSheet(input: BalanceSheetInput!): BalanceSheet
cashFlowStatement(input: CashFlowStatementInput!): CashFlowStatement
generalLedger(input: GeneralLedgerInput!): GeneralLedgerReport
accountsReceivableAging(asOfDate: Date): AccountsReceivableAging
accountsPayableAging(asOfDate: Date): AccountsPayableAging

// Budget queries
budgets(args: BudgetsArgs): BudgetConnection
budget(id: ID!): Budget
budgetVsActual(budgetId: ID!, period: BudgetPeriod!): BudgetVsActualReport
budgetVarianceAnalysis(budgetId: ID!): BudgetVarianceReport

// Tax queries
taxRates: [TaxRate]
taxRate(id: ID!): TaxRate
taxReports(args: TaxReportsArgs): TaxReportConnection
taxLiability(period: TaxPeriod!): TaxLiabilityReport

// Multi-currency queries
currencies: [Currency]
currency(code: String!): Currency
exchangeRates(baseCurrency: String!, targetCurrencies: [String!]!): [ExchangeRate]
currencyConversion(amount: Decimal!, fromCurrency: String!, toCurrency: String!): CurrencyConversion
```

**Mutations:**
```typescript
// Chart of accounts mutations
createAccount(input: CreateAccountInput!): ChartOfAccount
updateAccount(input: UpdateAccountInput!): ChartOfAccount
deleteAccount(id: ID!): Boolean
activateAccount(id: ID!): ChartOfAccount
deactivateAccount(id: ID!): ChartOfAccount
reorderAccounts(input: ReorderAccountsInput!): [ChartOfAccount]

// Journal entry mutations
createJournalEntry(input: CreateJournalEntryInput!): JournalEntry
updateJournalEntry(input: UpdateJournalEntryInput!): JournalEntry
deleteJournalEntry(id: ID!): Boolean
postJournalEntry(id: ID!): JournalEntry
reverseJournalEntry(input: ReverseJournalEntryInput!): JournalEntry
approveJournalEntry(id: ID!): JournalEntry
rejectJournalEntry(input: RejectJournalEntryInput!): JournalEntry
bulkPostJournalEntries(entryIds: [ID!]!): BulkPostResult

// Invoice mutations
createInvoice(input: CreateInvoiceInput!): Invoice
updateInvoice(input: UpdateInvoiceInput!): Invoice
deleteInvoice(id: ID!): Boolean
sendInvoice(id: ID!): Invoice
markInvoiceAsPaid(id: ID!): Invoice
voidInvoice(input: VoidInvoiceInput!): Invoice
duplicateInvoice(id: ID!): Invoice
bulkSendInvoices(invoiceIds: [ID!]!): BulkSendResult
generateRecurringInvoices: [Invoice]
applyInvoiceDiscount(input: ApplyDiscountInput!): Invoice

// Payment mutations
createPayment(input: CreatePaymentInput!): Payment
updatePayment(input: UpdatePaymentInput!): Payment
deletePayment(id: ID!): Boolean
allocatePayment(input: AllocatePaymentInput!): Payment
deallocatePayment(input: DeallocatePaymentInput!): Payment
refundPayment(input: RefundPaymentInput!): Payment
bulkAllocatePayments(input: BulkAllocatePaymentsInput!): BulkAllocationResult

// Budget mutations
createBudget(input: CreateBudgetInput!): Budget
updateBudget(input: UpdateBudgetInput!): Budget
deleteBudget(id: ID!): Boolean
approveBudget(id: ID!): Budget
lockBudget(id: ID!): Budget
copyBudget(input: CopyBudgetInput!): Budget
importBudget(input: ImportBudgetInput!): Budget

// Tax mutations
createTaxRate(input: CreateTaxRateInput!): TaxRate
updateTaxRate(input: UpdateTaxRateInput!): TaxRate
deleteTaxRate(id: ID!): Boolean
calculateTax(input: CalculateTaxInput!): TaxCalculation
generateTaxReport(input: GenerateTaxReportInput!): TaxReport
submitTaxReturn(input: SubmitTaxReturnInput!): TaxReturn

// Multi-currency mutations
createCurrency(input: CreateCurrencyInput!): Currency
updateCurrency(input: UpdateCurrencyInput!): Currency
updateExchangeRate(input: UpdateExchangeRateInput!): ExchangeRate
revalueCurrency(input: RevalueCurrencyInput!): CurrencyRevaluationResult
```

**Subscriptions:**
```typescript
// Financial real-time updates
invoiceCreated: Invoice
invoiceUpdated(invoiceId: ID): Invoice
invoicePaid(invoiceId: ID): Invoice
invoiceOverdue: Invoice
paymentReceived: Payment
paymentAllocated(paymentId: ID): Payment
journalEntryPosted: JournalEntry
budgetExceeded(budgetId: ID): BudgetAlert
exchangeRateUpdated(currencyPair: String): ExchangeRate
```

#### 👨‍💼 EMPLOYEE MODULE

**Queries:**
```typescript
// Employee queries
employees(args: EmployeesArgs): EmployeeConnection
employee(id: ID!): Employee
employeeByNumber(employeeNumber: String!): Employee
employeesByDepartment(department: String!): [Employee]
employeesByManager(managerId: ID!): [Employee]
employeeHierarchy(employeeId: ID!): EmployeeHierarchy

// Time tracking queries
timeEntries(args: TimeEntriesArgs): TimeEntryConnection
timeEntry(id: ID!): TimeEntry
employeeTimeEntries(employeeId: ID!, args: TimeEntriesArgs): TimeEntryConnection
pendingTimeEntries: [TimeEntry]
timeEntryStats(employeeId: ID!, period: TimePeriod!): TimeEntryStats
timesheetSummary(employeeId: ID!, startDate: Date!, endDate: Date!): TimesheetSummary

// Payroll queries
payrollRuns(args: PayrollRunsArgs): PayrollRunConnection
payrollRun(id: ID!): PayrollRun
currentPayrollRun: PayrollRun
payrollEntries(payrollRunId: ID!): [PayrollEntry]
employeePayrollHistory(employeeId: ID!, args: PayrollHistoryArgs): PayrollEntryConnection
payrollStats(payrollRunId: ID!): PayrollStats
payStub(payrollEntryId: ID!): PayStub

// Performance queries
performanceReviews(args: PerformanceReviewsArgs): PerformanceReviewConnection
performanceReview(id: ID!): PerformanceReview
employeePerformanceHistory(employeeId: ID!): [PerformanceReview]
performanceGoals(employeeId: ID!): [PerformanceGoal]
performanceMetrics(employeeId: ID!, period: PerformancePeriod!): PerformanceMetrics

// Leave management queries
leaveRequests(args: LeaveRequestsArgs): LeaveRequestConnection
leaveRequest(id: ID!): LeaveRequest
employeeLeaveBalance(employeeId: ID!): LeaveBalance
pendingLeaveRequests: [LeaveRequest]
leaveCalendar(startDate: Date!, endDate: Date!): [LeaveCalendarEntry]

// Benefits queries
benefitPlans: [BenefitPlan]
benefitPlan(id: ID!): BenefitPlan
employeeBenefits(employeeId: ID!): [EmployeeBenefit]
benefitEnrollments(employeeId: ID!): [BenefitEnrollment]
```

**Mutations:**
```typescript
// Employee mutations
createEmployee(input: CreateEmployeeInput!): Employee
updateEmployee(input: UpdateEmployeeInput!): Employee
deleteEmployee(id: ID!): Boolean
activateEmployee(id: ID!): Employee
deactivateEmployee(id: ID!): Employee
terminateEmployee(input: TerminateEmployeeInput!): Employee
rehireEmployee(input: RehireEmployeeInput!): Employee
transferEmployee(input: TransferEmployeeInput!): Employee
promoteEmployee(input: PromoteEmployeeInput!): Employee
bulkUpdateEmployees(input: BulkUpdateEmployeesInput!): BulkUpdateResult

// Time tracking mutations
createTimeEntry(input: CreateTimeEntryInput!): TimeEntry
updateTimeEntry(input: UpdateTimeEntryInput!): TimeEntry
deleteTimeEntry(id: ID!): Boolean
clockIn(input: ClockInInput!): TimeEntry
clockOut(id: ID!): TimeEntry
approveTimeEntry(id: ID!): TimeEntry
rejectTimeEntry(input: RejectTimeEntryInput!): TimeEntry
bulkApproveTimeEntries(entryIds: [ID!]!): BulkApprovalResult
submitTimesheet(input: SubmitTimesheetInput!): TimesheetSubmission

// Payroll mutations
createPayrollRun(input: CreatePayrollRunInput!): PayrollRun
updatePayrollRun(input: UpdatePayrollRunInput!): PayrollRun
deletePayrollRun(id: ID!): Boolean
calculatePayroll(payrollRunId: ID!): PayrollRun
approvePayroll(payrollRunId: ID!): PayrollRun
processPayroll(payrollRunId: ID!): PayrollRun
reversePayroll(input: ReversePayrollInput!): PayrollRun
generatePayStubs(payrollRunId: ID!): [PayStub]
exportPayrollData(input: ExportPayrollInput!): ExportResult

// Performance mutations
createPerformanceReview(input: CreatePerformanceReviewInput!): PerformanceReview
updatePerformanceReview(input: UpdatePerformanceReviewInput!): PerformanceReview
deletePerformanceReview(id: ID!): Boolean
submitPerformanceReview(id: ID!): PerformanceReview
approvePerformanceReview(id: ID!): PerformanceReview
createPerformanceGoal(input: CreatePerformanceGoalInput!): PerformanceGoal
updatePerformanceGoal(input: UpdatePerformanceGoalInput!): PerformanceGoal
completePerformanceGoal(id: ID!): PerformanceGoal

// Leave management mutations
createLeaveRequest(input: CreateLeaveRequestInput!): LeaveRequest
updateLeaveRequest(input: UpdateLeaveRequestInput!): LeaveRequest
deleteLeaveRequest(id: ID!): Boolean
approveLeaveRequest(id: ID!): LeaveRequest
rejectLeaveRequest(input: RejectLeaveRequestInput!): LeaveRequest
cancelLeaveRequest(id: ID!): LeaveRequest
adjustLeaveBalance(input: AdjustLeaveBalanceInput!): LeaveBalance

// Benefits mutations
createBenefitPlan(input: CreateBenefitPlanInput!): BenefitPlan
updateBenefitPlan(input: UpdateBenefitPlanInput!): BenefitPlan
deleteBenefitPlan(id: ID!): Boolean
enrollEmployeeInBenefit(input: EnrollBenefitInput!): BenefitEnrollment
updateBenefitEnrollment(input: UpdateBenefitEnrollmentInput!): BenefitEnrollment
terminateBenefitEnrollment(id: ID!): BenefitEnrollment
```

**Subscriptions:**
```typescript
// Employee real-time updates
employeeCreated: Employee
employeeUpdated(employeeId: ID): Employee
employeeTerminated: Employee
timeEntryClockedIn(employeeId: ID): TimeEntry
timeEntryClockedOut(employeeId: ID): TimeEntry
timeEntryApproved(employeeId: ID): TimeEntry
payrollProcessed: PayrollRun
leaveRequestSubmitted: LeaveRequest
leaveRequestApproved(employeeId: ID): LeaveRequest
performanceReviewDue(employeeId: ID): PerformanceReview
```

#### 🏭 SUPPLIER MODULE

**Queries:**
```typescript
// Supplier queries
suppliers(args: SuppliersArgs): SupplierConnection
supplier(id: ID!): Supplier
supplierByNumber(supplierNumber: String!): Supplier
suppliersByCategory(category: String!): [Supplier]
supplierPerformance(supplierId: ID!): SupplierPerformance
supplierStats(supplierId: ID!): SupplierStats

// Purchase order queries
purchaseOrders(args: PurchaseOrdersArgs): PurchaseOrderConnection
purchaseOrder(id: ID!): PurchaseOrder
purchaseOrderByNumber(poNumber: String!): PurchaseOrder
pendingPurchaseOrders: [PurchaseOrder]
overduePurchaseOrders: [PurchaseOrder]
purchaseOrderLineItems(purchaseOrderId: ID!): [PurchaseOrderLineItem]

// Goods received queries
goodsReceivedNotes(args: GRNArgs): GRNConnection
goodsReceivedNote(id: ID!): GoodsReceivedNote
grnByNumber(grnNumber: String!): GoodsReceivedNote
pendingInspections: [GoodsReceivedNote]
grnLineItems(grnId: ID!): [GRNLineItem]

// Procurement analytics queries
procurementAnalytics(period: AnalyticsPeriod!): ProcurementAnalytics
supplierSpendAnalysis(period: AnalyticsPeriod!): SupplierSpendAnalysis
purchaseOrderTrends(period: AnalyticsPeriod!): PurchaseOrderTrends
supplierLeadTimeAnalysis: SupplierLeadTimeAnalysis
costSavingsReport(period: AnalyticsPeriod!): CostSavingsReport

// Supplier evaluation queries
supplierEvaluations(args: SupplierEvaluationsArgs): SupplierEvaluationConnection
supplierEvaluation(id: ID!): SupplierEvaluation
supplierScorecard(supplierId: ID!): SupplierScorecard
supplierRankings(category: String): [SupplierRanking]

// Contract queries
supplierContracts(args: ContractsArgs): ContractConnection
supplierContract(id: ID!): SupplierContract
expiringContracts(daysAhead: Int!): [SupplierContract]
contractTerms(contractId: ID!): [ContractTerm]
```

**Mutations:**
```typescript
// Supplier mutations
createSupplier(input: CreateSupplierInput!): Supplier
updateSupplier(input: UpdateSupplierInput!): Supplier
deleteSupplier(id: ID!): Boolean
activateSupplier(id: ID!): Supplier
deactivateSupplier(id: ID!): Supplier
blockSupplier(input: BlockSupplierInput!): Supplier
unblockSupplier(id: ID!): Supplier
mergeSuppliers(input: MergeSuppliersInput!): Supplier
bulkUpdateSuppliers(input: BulkUpdateSuppliersInput!): BulkUpdateResult

// Purchase order mutations
createPurchaseOrder(input: CreatePurchaseOrderInput!): PurchaseOrder
updatePurchaseOrder(input: UpdatePurchaseOrderInput!): PurchaseOrder
deletePurchaseOrder(id: ID!): Boolean
sendPurchaseOrder(id: ID!): PurchaseOrder
approvePurchaseOrder(id: ID!): PurchaseOrder
rejectPurchaseOrder(input: RejectPurchaseOrderInput!): PurchaseOrder
cancelPurchaseOrder(input: CancelPurchaseOrderInput!): PurchaseOrder
closePurchaseOrder(id: ID!): PurchaseOrder
duplicatePurchaseOrder(id: ID!): PurchaseOrder
convertQuoteToPO(quoteId: ID!): PurchaseOrder

// Goods received mutations
createGoodsReceivedNote(input: CreateGRNInput!): GoodsReceivedNote
updateGoodsReceivedNote(input: UpdateGRNInput!): GoodsReceivedNote
deleteGoodsReceivedNote(id: ID!): Boolean
inspectGoods(input: InspectGoodsInput!): GoodsReceivedNote
acceptGoods(id: ID!): GoodsReceivedNote
rejectGoods(input: RejectGoodsInput!): GoodsReceivedNote
partialAcceptance(input: PartialAcceptanceInput!): GoodsReceivedNote

// Supplier evaluation mutations
createSupplierEvaluation(input: CreateSupplierEvaluationInput!): SupplierEvaluation
updateSupplierEvaluation(input: UpdateSupplierEvaluationInput!): SupplierEvaluation
deleteSupplierEvaluation(id: ID!): Boolean
submitSupplierEvaluation(id: ID!): SupplierEvaluation
approveSupplierEvaluation(id: ID!): SupplierEvaluation
generateSupplierScorecard(supplierId: ID!): SupplierScorecard

// Contract mutations
createSupplierContract(input: CreateContractInput!): SupplierContract
updateSupplierContract(input: UpdateContractInput!): SupplierContract
deleteSupplierContract(id: ID!): Boolean
activateContract(id: ID!): SupplierContract
renewContract(input: RenewContractInput!): SupplierContract
terminateContract(input: TerminateContractInput!): SupplierContract
addContractTerm(input: AddContractTermInput!): ContractTerm
updateContractTerm(input: UpdateContractTermInput!): ContractTerm
removeContractTerm(id: ID!): Boolean
```

**Subscriptions:**
```typescript
// Supplier real-time updates
supplierCreated: Supplier
supplierUpdated(supplierId: ID): Supplier
supplierBlocked: Supplier
purchaseOrderCreated: PurchaseOrder
purchaseOrderApproved(supplierId: ID): PurchaseOrder
purchaseOrderDelivered(supplierId: ID): PurchaseOrder
goodsReceived: GoodsReceivedNote
goodsInspected(supplierId: ID): GoodsReceivedNote
supplierEvaluationCompleted(supplierId: ID): SupplierEvaluation
contractExpiring: SupplierContract
```

#### 📦 INVENTORY MODULE

**Queries:**
```typescript
// Product queries
products(args: ProductsArgs): ProductConnection
product(id: ID!): Product
productBySku(sku: String!): Product
productsByCategory(categoryId: ID!, args: ProductsArgs): ProductConnection
productsByBrand(brandId: ID!, args: ProductsArgs): ProductConnection
lowStockProducts(threshold: Int): [Product]
outOfStockProducts: [Product]
productVariants(productId: ID!): [ProductVariant]

// Category queries
categories(args: CategoriesArgs): CategoryConnection
category(id: ID!): Category
categoryHierarchy: [CategoryHierarchy]
categoryBySlug(slug: String!): Category

// Brand queries
brands(args: BrandsArgs): BrandConnection
brand(id: ID!): Brand

// Inventory tracking queries
inventoryTransactions(args: InventoryTransactionsArgs): InventoryTransactionConnection
inventoryTransaction(id: ID!): InventoryTransaction
productInventoryHistory(productId: ID!, args: InventoryHistoryArgs): InventoryTransactionConnection
currentStock(productId: ID!, locationId: ID): StockLevel
stockLevels(args: StockLevelsArgs): StockLevelConnection
stockMovements(args: StockMovementsArgs): StockMovementConnection

// Inventory valuation queries
inventoryValuation(method: ValuationMethod!, asOfDate: Date): InventoryValuation
productValuation(productId: ID!, method: ValuationMethod!): ProductValuation
inventoryValueByLocation(locationId: ID!, method: ValuationMethod!): LocationInventoryValue

// Batch and lot tracking queries
batches(args: BatchesArgs): BatchConnection
batch(id: ID!): Batch
batchByNumber(batchNumber: String!): Batch
expiringBatches(daysAhead: Int!): [Batch]
batchTraceability(batchId: ID!): BatchTraceability

// Cycle counting queries
cycleCounts(args: CycleCountsArgs): CycleCountConnection
cycleCount(id: ID!): CycleCount
pendingCycleCounts: [CycleCount]
cycleCountVariances(cycleCountId: ID!): [CycleCountVariance]

// Inventory analytics queries
inventoryAnalytics(period: AnalyticsPeriod!): InventoryAnalytics
turnoverAnalysis(period: AnalyticsPeriod!): TurnoverAnalysis
abcAnalysis: ABCAnalysis
slowMovingItems(daysThreshold: Int!): [SlowMovingItem]
fastMovingItems(period: AnalyticsPeriod!): [FastMovingItem]
```

**Mutations:**
```typescript
// Product mutations
createProduct(input: CreateProductInput!): Product
updateProduct(input: UpdateProductInput!): Product
deleteProduct(id: ID!): Boolean
activateProduct(id: ID!): Product
deactivateProduct(id: ID!): Product
discontinueProduct(input: DiscontinueProductInput!): Product
duplicateProduct(id: ID!): Product
bulkUpdateProducts(input: BulkUpdateProductsInput!): BulkUpdateResult
importProducts(input: ImportProductsInput!): ImportResult
exportProducts(input: ExportProductsInput!): ExportResult

// Product variant mutations
createProductVariant(input: CreateProductVariantInput!): ProductVariant
updateProductVariant(input: UpdateProductVariantInput!): ProductVariant
deleteProductVariant(id: ID!): Boolean
generateVariants(input: GenerateVariantsInput!): [ProductVariant]

// Category mutations
createCategory(input: CreateCategoryInput!): Category
updateCategory(input: UpdateCategoryInput!): Category
deleteCategory(id: ID!): Boolean
moveCategory(input: MoveCategoryInput!): Category
reorderCategories(input: ReorderCategoriesInput!): [Category]

// Brand mutations
createBrand(input: CreateBrandInput!): Brand
updateBrand(input: UpdateBrandInput!): Brand
deleteBrand(id: ID!): Boolean

// Inventory adjustment mutations
adjustInventory(input: AdjustInventoryInput!): InventoryTransaction
bulkAdjustInventory(input: BulkAdjustInventoryInput!): [InventoryTransaction]
transferInventory(input: TransferInventoryInput!): InventoryTransaction
receiveInventory(input: ReceiveInventoryInput!): InventoryTransaction
issueInventory(input: IssueInventoryInput!): InventoryTransaction
returnInventory(input: ReturnInventoryInput!): InventoryTransaction

// Batch and lot mutations
createBatch(input: CreateBatchInput!): Batch
updateBatch(input: UpdateBatchInput!): Batch
expireBatch(id: ID!): Batch
splitBatch(input: SplitBatchInput!): [Batch]
mergeBatches(input: MergeBatchesInput!): Batch

// Cycle counting mutations
createCycleCount(input: CreateCycleCountInput!): CycleCount
updateCycleCount(input: UpdateCycleCountInput!): CycleCount
deleteCycleCount(id: ID!): Boolean
startCycleCount(id: ID!): CycleCount
completeCycleCount(id: ID!): CycleCount
approveCycleCount(id: ID!): CycleCount
rejectCycleCount(input: RejectCycleCountInput!): CycleCount
generateCycleCounts(input: GenerateCycleCountsInput!): [CycleCount]

// Reorder management mutations
createReorderRule(input: CreateReorderRuleInput!): ReorderRule
updateReorderRule(input: UpdateReorderRuleInput!): ReorderRule
deleteReorderRule(id: ID!): Boolean
triggerReorder(productId: ID!): ReorderSuggestion
generateReorderSuggestions: [ReorderSuggestion]
createPurchaseOrderFromReorder(reorderSuggestionId: ID!): PurchaseOrder
```

**Subscriptions:**
```typescript
// Inventory real-time updates
productCreated: Product
productUpdated(productId: ID): Product
stockLevelChanged(productId: ID): StockLevel
lowStockAlert: Product
outOfStockAlert: Product
inventoryAdjusted(productId: ID): InventoryTransaction
batchExpiring: Batch
cycleCountCompleted: CycleCount
reorderTriggered: ReorderSuggestion
```

#### 🏪 WAREHOUSE MODULE

**Queries:**
```typescript
// Warehouse queries
warehouses(args: WarehousesArgs): WarehouseConnection
warehouse(id: ID!): Warehouse
warehouseByCode(code: String!): Warehouse
warehouseStats(warehouseId: ID!): WarehouseStats
warehouseCapacity(warehouseId: ID!): WarehouseCapacity

// Zone queries
warehouseZones(warehouseId: ID!): [WarehouseZone]
warehouseZone(id: ID!): WarehouseZone
zonesByType(warehouseId: ID!, zoneType: ZoneType!): [WarehouseZone]

// Bin location queries
binLocations(args: BinLocationsArgs): BinLocationConnection
binLocation(id: ID!): BinLocation
binLocationByCode(warehouseId: ID!, locationCode: String!): BinLocation
availableBinLocations(warehouseId: ID!, productId: ID): [BinLocation]
binLocationContents(binLocationId: ID!): [BinLocationContent]

// Picking queries
pickingWaves(args: PickingWavesArgs): PickingWaveConnection
pickingWave(id: ID!): PickingWave
activePicks: [PickingWave]
pickingTasks(args: PickingTasksArgs): PickingTaskConnection
pickingTask(id: ID!): PickingTask
employeePickingTasks(employeeId: ID!): [PickingTask]

// Receiving queries
receivingTasks(args: ReceivingTasksArgs): ReceivingTaskConnection
receivingTask(id: ID!): ReceivingTask
pendingReceiving: [ReceivingTask]
receivingHistory(args: ReceivingHistoryArgs): ReceivingHistoryConnection

// Putaway queries
putawayTasks(args: PutawayTasksArgs): PutawayTaskConnection
putawayTask(id: ID!): PutawayTask
pendingPutaway: [PutawayTask]
suggestedPutawayLocations(productId: ID!, quantity: Int!): [BinLocation]

// Kitting and assembly queries
kitAssemblyOrders(args: KitAssemblyArgs): KitAssemblyConnection
kitAssemblyOrder(id: ID!): KitAssemblyOrder
billOfMaterials(productId: ID!): BillOfMaterials
assemblyInstructions(productId: ID!): [AssemblyInstruction]

// Shipping queries
shipments(args: ShipmentsArgs): ShipmentConnection
shipment(id: ID!): Shipment
shipmentByNumber(shipmentNumber: String!): Shipment
pendingShipments: [Shipment]
shippingLabels(shipmentId: ID!): [ShippingLabel]
trackingInfo(shipmentId: ID!): TrackingInfo
```

**Mutations:**
```typescript
// Warehouse mutations
createWarehouse(input: CreateWarehouseInput!): Warehouse
updateWarehouse(input: UpdateWarehouseInput!): Warehouse
deleteWarehouse(id: ID!): Boolean
activateWarehouse(id: ID!): Warehouse
deactivateWarehouse(id: ID!): Warehouse

// Zone mutations
createWarehouseZone(input: CreateZoneInput!): WarehouseZone
updateWarehouseZone(input: UpdateZoneInput!): WarehouseZone
deleteWarehouseZone(id: ID!): Boolean
reorderZones(input: ReorderZonesInput!): [WarehouseZone]

// Bin location mutations
createBinLocation(input: CreateBinLocationInput!): BinLocation
updateBinLocation(input: UpdateBinLocationInput!): BinLocation
deleteBinLocation(id: ID!): Boolean
bulkCreateBinLocations(input: BulkCreateBinLocationsInput!): [BinLocation]
moveBinLocation(input: MoveBinLocationInput!): BinLocation
reserveBinLocation(input: ReserveBinLocationInput!): BinLocation
releaseBinLocation(id: ID!): BinLocation

// Picking mutations
createPickingWave(input: CreatePickingWaveInput!): PickingWave
updatePickingWave(input: UpdatePickingWaveInput!): PickingWave
deletePickingWave(id: ID!): Boolean
releasePickingWave(id: ID!): PickingWave
assignPickingWave(input: AssignPickingWaveInput!): PickingWave
startPicking(pickingWaveId: ID!): PickingWave
completePicking(input: CompletePickingInput!): PickingWave
confirmPick(input: ConfirmPickInput!): PickingTask
shortPick(input: ShortPickInput!): PickingTask

// Receiving mutations
createReceivingTask(input: CreateReceivingTaskInput!): ReceivingTask
updateReceivingTask(input: UpdateReceivingTaskInput!): ReceivingTask
deleteReceivingTask(id: ID!): Boolean
startReceiving(receivingTaskId: ID!): ReceivingTask
completeReceiving(input: CompleteReceivingInput!): ReceivingTask
receiveItem(input: ReceiveItemInput!): ReceivingTask

// Putaway mutations
createPutawayTask(input: CreatePutawayTaskInput!): PutawayTask
updatePutawayTask(input: UpdatePutawayTaskInput!): PutawayTask
deletePutawayTask(id: ID!): Boolean
assignPutawayTask(input: AssignPutawayTaskInput!): PutawayTask
startPutaway(putawayTaskId: ID!): PutawayTask
completePutaway(input: CompletePutawayInput!): PutawayTask
confirmPutaway(input: ConfirmPutawayInput!): PutawayTask

// Kitting and assembly mutations
createKitAssemblyOrder(input: CreateKitAssemblyInput!): KitAssemblyOrder
updateKitAssemblyOrder(input: UpdateKitAssemblyInput!): KitAssemblyOrder
deleteKitAssemblyOrder(id: ID!): Boolean
startAssembly(kitAssemblyOrderId: ID!): KitAssemblyOrder
completeAssembly(input: CompleteAssemblyInput!): KitAssemblyOrder
createBillOfMaterials(input: CreateBOMInput!): BillOfMaterials
updateBillOfMaterials(input: UpdateBOMInput!): BillOfMaterials

// Shipping mutations
createShipment(input: CreateShipmentInput!): Shipment
updateShipment(input: UpdateShipmentInput!): Shipment
deleteShipment(id: ID!): Boolean
packShipment(input: PackShipmentInput!): Shipment
generateShippingLabel(shipmentId: ID!): ShippingLabel
schedulePickup(input: SchedulePickupInput!): Shipment
trackShipment(shipmentId: ID!): TrackingInfo
confirmDelivery(shipmentId: ID!): Shipment
```

**Subscriptions:**
```typescript
// Warehouse real-time updates
pickingWaveCreated: PickingWave
pickingWaveAssigned(employeeId: ID): PickingWave
pickingTaskCompleted(warehouseId: ID): PickingTask
receivingTaskCreated: ReceivingTask
receivingCompleted(warehouseId: ID): ReceivingTask
putawayTaskCreated: PutawayTask
putawayCompleted(warehouseId: ID): PutawayTask
shipmentCreated: Shipment
shipmentShipped(customerId: ID): Shipment
shipmentDelivered(customerId: ID): Shipment
binLocationUpdated(warehouseId: ID): BinLocation
```

#### 🛒 POS MODULE

**Queries:**
```typescript
// POS transaction queries
posTransactions(args: POSTransactionsArgs): POSTransactionConnection
posTransaction(id: ID!): POSTransaction
posTransactionByNumber(transactionNumber: String!): POSTransaction
dailySales(locationId: ID!, date: Date!): DailySalesReport
salesByEmployee(employeeId: ID!, args: SalesArgs): EmployeeSalesReport
salesByProduct(productId: ID!, args: SalesArgs): ProductSalesReport

// Register queries
posRegisters(locationId: ID!): [POSRegister]
posRegister(id: ID!): POSRegister
activeRegisters(locationId: ID!): [POSRegister]
registerSessions(registerId: ID!, args: SessionsArgs): RegisterSessionConnection
currentRegisterSession(registerId: ID!): RegisterSession

// Payment queries
posPayments(args: POSPaymentsArgs): POSPaymentConnection
posPayment(id: ID!): POSPayment
paymentMethods: [PaymentMethod]
paymentMethodStats(locationId: ID!, period: AnalyticsPeriod!): PaymentMethodStats

// Receipt queries
receipts(args: ReceiptsArgs): ReceiptConnection
receipt(id: ID!): Receipt
receiptByNumber(receiptNumber: String!): Receipt
emailReceipt(receiptId: ID!, email: String!): Boolean
printReceipt(receiptId: ID!): PrintJob

// Discount and promotion queries
discounts: [Discount]
discount(id: ID!): Discount
activePromotions(locationId: ID!): [Promotion]
promotion(id: ID!): Promotion
applicableDiscounts(customerId: ID, items: [CartItemInput!]!): [ApplicableDiscount]

// Tax queries
taxConfiguration(locationId: ID!): TaxConfiguration
taxRates(locationId: ID!): [TaxRate]
calculateTax(input: CalculateTaxInput!): TaxCalculation

// Offline sync queries
offlineSyncStatus(registerId: ID!): OfflineSyncStatus
pendingSyncTransactions(registerId: ID!): [POSTransaction]
syncHistory(registerId: ID!, args: SyncHistoryArgs): SyncHistoryConnection
```

**Mutations:**
```typescript
// POS transaction mutations
createPOSTransaction(input: CreatePOSTransactionInput!): POSTransaction
updatePOSTransaction(input: UpdatePOSTransactionInput!): POSTransaction
voidPOSTransaction(input: VoidPOSTransactionInput!): POSTransaction
refundPOSTransaction(input: RefundPOSTransactionInput!): POSTransaction
partialRefund(input: PartialRefundInput!): POSTransaction
holdTransaction(input: HoldTransactionInput!): POSTransaction
retrieveHeldTransaction(transactionId: ID!): POSTransaction
layawayTransaction(input: LayawayTransactionInput!): POSTransaction

// Register mutations
createPOSRegister(input: CreatePOSRegisterInput!): POSRegister
updatePOSRegister(input: UpdatePOSRegisterInput!): POSRegister
deletePOSRegister(id: ID!): Boolean
openRegister(input: OpenRegisterInput!): RegisterSession
closeRegister(input: CloseRegisterInput!): RegisterSession
addCashToRegister(input: AddCashInput!): CashOperation
removeCashFromRegister(input: RemoveCashInput!): CashOperation
performCashCount(input: CashCountInput!): CashCount

// Payment mutations
processPayment(input: ProcessPaymentInput!): POSPayment
refundPayment(input: RefundPaymentInput!): POSPayment
voidPayment(paymentId: ID!): POSPayment
splitPayment(input: SplitPaymentInput!): [POSPayment]
authorizePayment(input: AuthorizePaymentInput!): PaymentAuthorization
capturePayment(authorizationId: ID!): POSPayment

// Discount and promotion mutations
applyDiscount(input: ApplyDiscountInput!): POSTransaction
removeDiscount(input: RemoveDiscountInput!): POSTransaction
createDiscount(input: CreateDiscountInput!): Discount
updateDiscount(input: UpdateDiscountInput!): Discount
deleteDiscount(id: ID!): Boolean
createPromotion(input: CreatePromotionInput!): Promotion
updatePromotion(input: UpdatePromotionInput!): Promotion
activatePromotion(id: ID!): Promotion
deactivatePromotion(id: ID!): Promotion

// Customer mutations (POS-specific)
addCustomerToTransaction(input: AddCustomerToTransactionInput!): POSTransaction
removeCustomerFromTransaction(transactionId: ID!): POSTransaction
applyLoyaltyPoints(input: ApplyLoyaltyPointsInput!): POSTransaction
earnLoyaltyPoints(input: EarnLoyaltyPointsInput!): LoyaltyTransaction

// Offline sync mutations
syncOfflineTransactions(input: SyncOfflineTransactionsInput!): SyncResult
markTransactionSynced(transactionId: ID!): POSTransaction
resolveConflict(input: ResolveConflictInput!): POSTransaction
forceSyncTransaction(transactionId: ID!): POSTransaction
```

**Subscriptions:**
```typescript
// POS real-time updates
transactionCreated(locationId: ID): POSTransaction
transactionCompleted(locationId: ID): POSTransaction
transactionVoided(locationId: ID): POSTransaction
paymentProcessed(registerId: ID): POSPayment
registerOpened(locationId: ID): RegisterSession
registerClosed(locationId: ID): RegisterSession
cashOperationPerformed(registerId: ID): CashOperation
promotionActivated(locationId: ID): Promotion
offlineSyncCompleted(registerId: ID): SyncResult
```

#### 📍 LOCATION MODULE

**Queries:**
```typescript
// Location queries
locations(args: LocationsArgs): LocationConnection
location(id: ID!): Location
locationByCode(code: String!): Location
locationHierarchy: [LocationHierarchy]
locationsByType(type: LocationType!): [Location]
locationStats(locationId: ID!): LocationStats

// Franchise queries
franchises(args: FranchisesArgs): FranchiseConnection
franchise(id: ID!): Franchise
franchiseByCode(code: String!): Franchise
franchiseStats(franchiseId: ID!): FranchiseStats
franchiseRoyalties(franchiseId: ID!, period: AnalyticsPeriod!): FranchiseRoyalties

// Multi-location inventory queries
locationInventory(locationId: ID!, args: InventoryArgs): LocationInventoryConnection
inventoryByLocation(productId: ID!): [LocationInventory]
transferRequests(args: TransferRequestsArgs): TransferRequestConnection
transferRequest(id: ID!): TransferRequest
pendingTransfers(locationId: ID): [TransferRequest]

// Location-specific pricing queries
locationPricing(locationId: ID!, args: PricingArgs): LocationPricingConnection
priceOverrides(locationId: ID!, productId: ID): [PriceOverride]
pricingRules(locationId: ID!): [PricingRule]

// Location promotions queries
locationPromotions(locationId: ID!, args: PromotionsArgs): LocationPromotionConnection
activeLocationPromotions(locationId: ID!): [LocationPromotion]
promotionPerformance(promotionId: ID!): PromotionPerformance

// Geospatial queries
nearbyLocations(input: NearbyLocationsInput!): [Location]
locationsByRadius(input: LocationsByRadiusInput!): [Location]
deliveryZones(locationId: ID!): [DeliveryZone]
serviceAreas(locationId: ID!): [ServiceArea]
```

**Mutations:**
```typescript
// Location mutations
createLocation(input: CreateLocationInput!): Location
updateLocation(input: UpdateLocationInput!): Location
deleteLocation(id: ID!): Boolean
activateLocation(id: ID!): Location
deactivateLocation(id: ID!): Location
transferLocationOwnership(input: TransferOwnershipInput!): Location
bulkUpdateLocations(input: BulkUpdateLocationsInput!): BulkUpdateResult

// Franchise mutations
createFranchise(input: CreateFranchiseInput!): Franchise
updateFranchise(input: UpdateFranchiseInput!): Franchise
deleteFranchise(id: ID!): Boolean
approveFranchise(id: ID!): Franchise
suspendFranchise(input: SuspendFranchiseInput!): Franchise
calculateRoyalties(franchiseId: ID!, period: RoyaltyPeriod!): FranchiseRoyalties
processRoyaltyPayment(input: ProcessRoyaltyInput!): RoyaltyPayment

// Inventory transfer mutations
createTransferRequest(input: CreateTransferRequestInput!): TransferRequest
updateTransferRequest(input: UpdateTransferRequestInput!): TransferRequest
deleteTransferRequest(id: ID!): Boolean
approveTransferRequest(id: ID!): TransferRequest
rejectTransferRequest(input: RejectTransferRequestInput!): TransferRequest
shipTransfer(input: ShipTransferInput!): TransferRequest
receiveTransfer(input: ReceiveTransferInput!): TransferRequest
completeTransfer(id: ID!): TransferRequest

// Location pricing mutations
createPriceOverride(input: CreatePriceOverrideInput!): PriceOverride
updatePriceOverride(input: UpdatePriceOverrideInput!): PriceOverride
deletePriceOverride(id: ID!): Boolean
bulkUpdatePricing(input: BulkUpdatePricingInput!): BulkPricingResult
createPricingRule(input: CreatePricingRuleInput!): PricingRule
updatePricingRule(input: UpdatePricingRuleInput!): PricingRule
activatePricingRule(id: ID!): PricingRule
deactivatePricingRule(id: ID!): PricingRule

// Location promotion mutations
createLocationPromotion(input: CreateLocationPromotionInput!): LocationPromotion
updateLocationPromotion(input: UpdateLocationPromotionInput!): LocationPromotion
deleteLocationPromotion(id: ID!): Boolean
activateLocationPromotion(id: ID!): LocationPromotion
deactivateLocationPromotion(id: ID!): LocationPromotion
schedulePromotion(input: SchedulePromotionInput!): LocationPromotion

// Geospatial mutations
updateLocationCoordinates(input: UpdateCoordinatesInput!): Location
createDeliveryZone(input: CreateDeliveryZoneInput!): DeliveryZone
updateDeliveryZone(input: UpdateDeliveryZoneInput!): DeliveryZone
deleteDeliveryZone(id: ID!): Boolean
createServiceArea(input: CreateServiceAreaInput!): ServiceArea
updateServiceArea(input: UpdateServiceAreaInput!): ServiceArea
optimizeDeliveryRoutes(input: OptimizeRoutesInput!): RouteOptimization
```

**Subscriptions:**
```typescript
// Location real-time updates
locationCreated: Location
locationUpdated(locationId: ID): Location
locationStatusChanged(locationId: ID): Location
transferRequestCreated(locationId: ID): TransferRequest
transferRequestApproved(locationId: ID): TransferRequest
transferShipped(locationId: ID): TransferRequest
transferReceived(locationId: ID): TransferRequest
inventoryTransferred(locationId: ID): LocationInventory
pricingUpdated(locationId: ID): PriceOverride
promotionActivated(locationId: ID): LocationPromotion
franchiseApproved: Franchise
royaltyCalculated(franchiseId: ID): FranchiseRoyalties
```

Due to the massive size of this analysis, I need to continue with the remaining modules. Let me continue with the next section:

---
#### 🔗 INTEGRATION MODULE

**Queries:**
```typescript
// Integration queries
integrations(args: IntegrationsArgs): IntegrationConnection
integration(id: ID!): Integration
integrationByName(name: String!): Integration
activeIntegrations: [Integration]
integrationStatus(integrationId: ID!): IntegrationStatus
integrationLogs(integrationId: ID!, args: LogsArgs): IntegrationLogConnection

// Webhook queries
webhooks(args: WebhooksArgs): WebhookConnection
webhook(id: ID!): Webhook
webhooksByEvent(eventType: String!): [Webhook]
webhookDeliveries(webhookId: ID!, args: DeliveriesArgs): WebhookDeliveryConnection
failedWebhookDeliveries: [WebhookDelivery]

// API key queries
apiKeys(args: APIKeysArgs): APIKeyConnection
apiKey(id: ID!): APIKey
apiKeyUsage(apiKeyId: ID!, period: AnalyticsPeriod!): APIKeyUsage

// Third-party connector queries
connectors: [Connector]
connector(id: ID!): Connector
connectorsByCategory(category: ConnectorCategory!): [Connector]
connectorConfiguration(connectorId: ID!): ConnectorConfiguration
syncStatus(connectorId: ID!): SyncStatus
syncHistory(connectorId: ID!, args: SyncHistoryArgs): SyncHistoryConnection

// OAuth queries
oauthApplications(args: OAuthAppsArgs): OAuthApplicationConnection
oauthApplication(id: ID!): OAuthApplication
oauthTokens(applicationId: ID!): [OAuthToken]
authorizedApplications: [OAuthApplication]
```

**Mutations:**
```typescript
// Integration mutations
createIntegration(input: CreateIntegrationInput!): Integration
updateIntegration(input: UpdateIntegrationInput!): Integration
deleteIntegration(id: ID!): Boolean
enableIntegration(id: ID!): Integration
disableIntegration(id: ID!): Integration
testIntegration(id: ID!): IntegrationTestResult
syncIntegration(id: ID!): SyncResult
resetIntegration(id: ID!): Integration

// Webhook mutations
createWebhook(input: CreateWebhookInput!): Webhook
updateWebhook(input: UpdateWebhookInput!): Webhook
deleteWebhook(id: ID!): Boolean
enableWebhook(id: ID!): Webhook
disableWebhook(id: ID!): Webhook
testWebhook(id: ID!): WebhookTestResult
retryWebhookDelivery(deliveryId: ID!): WebhookDelivery
bulkRetryFailedDeliveries(webhookId: ID!): BulkRetryResult

// API key mutations
createAPIKey(input: CreateAPIKeyInput!): APIKey
updateAPIKey(input: UpdateAPIKeyInput!): APIKey
deleteAPIKey(id: ID!): Boolean
regenerateAPIKey(id: ID!): APIKey
revokeAPIKey(id: ID!): APIKey

// Third-party connector mutations
configureConnector(input: ConfigureConnectorInput!): ConnectorConfiguration
updateConnectorConfiguration(input: UpdateConnectorConfigInput!): ConnectorConfiguration
enableConnector(connectorId: ID!): ConnectorConfiguration
disableConnector(connectorId: ID!): ConnectorConfiguration
syncConnector(connectorId: ID!): SyncResult
resetConnectorSync(connectorId: ID!): SyncResult

// OAuth mutations
createOAuthApplication(input: CreateOAuthAppInput!): OAuthApplication
updateOAuthApplication(input: UpdateOAuthAppInput!): OAuthApplication
deleteOAuthApplication(id: ID!): Boolean
regenerateClientSecret(applicationId: ID!): OAuthApplication
authorizeApplication(input: AuthorizeAppInput!): OAuthAuthorization
revokeApplicationAccess(applicationId: ID!): Boolean
refreshOAuthToken(refreshToken: String!): OAuthToken
```

**Subscriptions:**
```typescript
// Integration real-time updates
integrationStatusChanged(integrationId: ID): Integration
syncCompleted(integrationId: ID): SyncResult
syncFailed(integrationId: ID): SyncError
webhookDelivered(webhookId: ID): WebhookDelivery
webhookFailed(webhookId: ID): WebhookDelivery
connectorSyncCompleted(connectorId: ID): SyncResult
apiKeyUsageThresholdExceeded(apiKeyId: ID): APIKeyUsage
```

#### 📧 COMMUNICATION MODULE

**Queries:**
```typescript
// Email queries
emailTemplates(args: EmailTemplatesArgs): EmailTemplateConnection
emailTemplate(id: ID!): EmailTemplate
emailCampaigns(args: EmailCampaignsArgs): EmailCampaignConnection
emailCampaign(id: ID!): EmailCampaign
emailDeliveries(args: EmailDeliveriesArgs): EmailDeliveryConnection
emailStats(campaignId: ID!, period: AnalyticsPeriod!): EmailStats

// SMS queries
smsTemplates(args: SMSTemplatesArgs): SMSTemplateConnection
smsTemplate(id: ID!): SMSTemplate
smsCampaigns(args: SMSCampaignsArgs): SMSCampaignConnection
smsCampaign(id: ID!): SMSCampaign
smsDeliveries(args: SMSDeliveriesArgs): SMSDeliveryConnection
smsStats(campaignId: ID!, period: AnalyticsPeriod!): SMSStats

// Notification queries
notifications(args: NotificationsArgs): NotificationConnection
notification(id: ID!): Notification
unreadNotifications: [Notification]
notificationPreferences: NotificationPreferences
notificationChannels: [NotificationChannel]

// Slack integration queries
slackWorkspaces: [SlackWorkspace]
slackChannels(workspaceId: ID!): [SlackChannel]
slackMessages(channelId: ID!, args: MessagesArgs): SlackMessageConnection

// Teams integration queries
teamsWorkspaces: [TeamsWorkspace]
teamsChannels(workspaceId: ID!): [TeamsChannel]
teamsMessages(channelId: ID!, args: MessagesArgs): TeamsMessageConnection
```

**Mutations:**
```typescript
// Email mutations
createEmailTemplate(input: CreateEmailTemplateInput!): EmailTemplate
updateEmailTemplate(input: UpdateEmailTemplateInput!): EmailTemplate
deleteEmailTemplate(id: ID!): Boolean
sendEmail(input: SendEmailInput!): EmailDelivery
sendBulkEmail(input: SendBulkEmailInput!): BulkEmailResult
createEmailCampaign(input: CreateEmailCampaignInput!): EmailCampaign
updateEmailCampaign(input: UpdateEmailCampaignInput!): EmailCampaign
launchEmailCampaign(id: ID!): EmailCampaign
pauseEmailCampaign(id: ID!): EmailCampaign
resumeEmailCampaign(id: ID!): EmailCampaign

// SMS mutations
createSMSTemplate(input: CreateSMSTemplateInput!): SMSTemplate
updateSMSTemplate(input: UpdateSMSTemplateInput!): SMSTemplate
deleteSMSTemplate(id: ID!): Boolean
sendSMS(input: SendSMSInput!): SMSDelivery
sendBulkSMS(input: SendBulkSMSInput!): BulkSMSResult
createSMSCampaign(input: CreateSMSCampaignInput!): SMSCampaign
launchSMSCampaign(id: ID!): SMSCampaign

// Notification mutations
createNotification(input: CreateNotificationInput!): Notification
markNotificationAsRead(id: ID!): Notification
markAllNotificationsAsRead: Boolean
deleteNotification(id: ID!): Boolean
updateNotificationPreferences(input: UpdateNotificationPreferencesInput!): NotificationPreferences
subscribeToNotifications(input: SubscribeNotificationsInput!): NotificationSubscription
unsubscribeFromNotifications(input: UnsubscribeNotificationsInput!): Boolean

// Slack integration mutations
connectSlackWorkspace(input: ConnectSlackInput!): SlackWorkspace
disconnectSlackWorkspace(workspaceId: ID!): Boolean
sendSlackMessage(input: SendSlackMessageInput!): SlackMessage
createSlackChannel(input: CreateSlackChannelInput!): SlackChannel
inviteToSlackChannel(input: InviteToSlackChannelInput!): Boolean

// Teams integration mutations
connectTeamsWorkspace(input: ConnectTeamsInput!): TeamsWorkspace
disconnectTeamsWorkspace(workspaceId: ID!): Boolean
sendTeamsMessage(input: SendTeamsMessageInput!): TeamsMessage
createTeamsChannel(input: CreateTeamsChannelInput!): TeamsChannel
```

**Subscriptions:**
```typescript
// Communication real-time updates
emailSent: EmailDelivery
emailDelivered(recipientId: ID): EmailDelivery
emailBounced: EmailDelivery
smsSent: SMSDelivery
smsDelivered(recipientId: ID): SMSDelivery
notificationCreated(userId: ID): Notification
slackMessageReceived(channelId: ID): SlackMessage
teamsMessageReceived(channelId: ID): TeamsMessage
campaignLaunched: EmailCampaign
campaignCompleted: EmailCampaign
```

#### 🏢 B2B MODULE

**Queries:**
```typescript
// B2B customer queries
b2bCustomers(args: B2BCustomersArgs): B2BCustomerConnection
b2bCustomer(id: ID!): B2BCustomer
b2bCustomerByCode(customerCode: String!): B2BCustomer
b2bCustomerHierarchy(customerId: ID!): B2BCustomerHierarchy
b2bCustomerStats(customerId: ID!): B2BCustomerStats

// B2B order queries
b2bOrders(args: B2BOrdersArgs): B2BOrderConnection
b2bOrder(id: ID!): B2BOrder
b2bOrderByNumber(orderNumber: String!): B2BOrder
pendingB2BOrders: [B2BOrder]
b2bOrderHistory(customerId: ID!, args: OrderHistoryArgs): B2BOrderConnection

// Quote queries
quotes(args: QuotesArgs): QuoteConnection
quote(id: ID!): Quote
quoteByNumber(quoteNumber: String!): Quote
pendingQuotes: [Quote]
expiredQuotes: [Quote]
quoteLineItems(quoteId: ID!): [QuoteLineItem]

// Contract queries
contracts(args: ContractsArgs): ContractConnection
contract(id: ID!): Contract
contractByNumber(contractNumber: String!): Contract
activeContracts(customerId: ID): [Contract]
expiringContracts(daysAhead: Int!): [Contract]
contractTerms(contractId: ID!): [ContractTerm]

// Territory queries
territories(args: TerritoriesArgs): TerritoryConnection
territory(id: ID!): Territory
territoriesByManager(managerId: ID!): [Territory]
territoryCustomers(territoryId: ID!): [B2BCustomer]
territoryStats(territoryId: ID!): TerritoryStats

// Dynamic pricing queries
pricingTiers(customerId: ID!): [PricingTier]
customerPricing(customerId: ID!, productId: ID!): CustomerPricing
volumeDiscounts(customerId: ID!): [VolumeDiscount]
contractPricing(contractId: ID!): [ContractPricing]
```

**Mutations:**
```typescript
// B2B customer mutations
createB2BCustomer(input: CreateB2BCustomerInput!): B2BCustomer
updateB2BCustomer(input: UpdateB2BCustomerInput!): B2BCustomer
deleteB2BCustomer(id: ID!): Boolean
approveB2BCustomer(id: ID!): B2BCustomer
suspendB2BCustomer(input: SuspendB2BCustomerInput!): B2BCustomer
activateB2BCustomer(id: ID!): B2BCustomer
assignCustomerToTerritory(input: AssignTerritoryInput!): B2BCustomer

// B2B order mutations
createB2BOrder(input: CreateB2BOrderInput!): B2BOrder
updateB2BOrder(input: UpdateB2BOrderInput!): B2BOrder
deleteB2BOrder(id: ID!): Boolean
submitB2BOrder(id: ID!): B2BOrder
approveB2BOrder(id: ID!): B2BOrder
rejectB2BOrder(input: RejectB2BOrderInput!): B2BOrder
fulfillB2BOrder(input: FulfillB2BOrderInput!): B2BOrder
cancelB2BOrder(input: CancelB2BOrderInput!): B2BOrder
convertQuoteToOrder(quoteId: ID!): B2BOrder

// Quote mutations
createQuote(input: CreateQuoteInput!): Quote
updateQuote(input: UpdateQuoteInput!): Quote
deleteQuote(id: ID!): Boolean
sendQuote(id: ID!): Quote
approveQuote(id: ID!): Quote
rejectQuote(input: RejectQuoteInput!): Quote
expireQuote(id: ID!): Quote
reviseQuote(input: ReviseQuoteInput!): Quote
duplicateQuote(id: ID!): Quote

// Contract mutations
createContract(input: CreateContractInput!): Contract
updateContract(input: UpdateContractInput!): Contract
deleteContract(id: ID!): Boolean
activateContract(id: ID!): Contract
renewContract(input: RenewContractInput!): Contract
terminateContract(input: TerminateContractInput!): Contract
addContractTerm(input: AddContractTermInput!): ContractTerm
updateContractTerm(input: UpdateContractTermInput!): ContractTerm
removeContractTerm(id: ID!): Boolean

// Territory mutations
createTerritory(input: CreateTerritoryInput!): Territory
updateTerritory(input: UpdateTerritoryInput!): Territory
deleteTerritory(id: ID!): Boolean
assignTerritoryManager(input: AssignTerritoryManagerInput!): Territory
reassignCustomers(input: ReassignCustomersInput!): Territory
mergeTerritories(input: MergeTerritoriesInput!): Territory
splitTerritory(input: SplitTerritoryInput!): [Territory]

// Dynamic pricing mutations
createPricingTier(input: CreatePricingTierInput!): PricingTier
updatePricingTier(input: UpdatePricingTierInput!): PricingTier
deletePricingTier(id: ID!): Boolean
assignCustomerToPricingTier(input: AssignPricingTierInput!): B2BCustomer
createVolumeDiscount(input: CreateVolumeDiscountInput!): VolumeDiscount
updateVolumeDiscount(input: UpdateVolumeDiscountInput!): VolumeDiscount
createContractPricing(input: CreateContractPricingInput!): ContractPricing
updateContractPricing(input: UpdateContractPricingInput!): ContractPricing
```

**Subscriptions:**
```typescript
// B2B real-time updates
b2bOrderCreated: B2BOrder
b2bOrderApproved(customerId: ID): B2BOrder
b2bOrderFulfilled(customerId: ID): B2BOrder
quoteCreated: Quote
quoteSent(customerId: ID): Quote
quoteApproved(customerId: ID): Quote
contractCreated: Contract
contractExpiring: Contract
territoryAssigned(managerId: ID): Territory
pricingTierUpdated(customerId: ID): PricingTier
```

### Input Types and Output Types

#### Common Input Types:
```typescript
// Pagination and filtering
@InputType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Min(0)
  offset?: number;

  @Field(() => String, { nullable: true })
  cursor?: string;
}

@InputType()
export class SortInput {
  @Field(() => String)
  field: string;

  @Field(() => SortOrder, { defaultValue: SortOrder.ASC })
  order: SortOrder;
}

@InputType()
export class FilterInput {
  @Field(() => String)
  field: string;

  @Field(() => FilterOperator)
  operator: FilterOperator;

  @Field(() => String)
  value: string;
}

@InputType()
export class DateRangeInput {
  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}

// Address input
@InputType()
export class CreateAddressInput {
  @Field()
  @Length(1, 255)
  street1: string;

  @Field({ nullable: true })
  @Length(1, 255)
  street2?: string;

  @Field()
  @Length(1, 100)
  city: string;

  @Field()
  @Length(1, 100)
  state: string;

  @Field()
  @Length(1, 20)
  postalCode: string;

  @Field()
  @Length(2, 2)
  country: string;
}
```

#### Common Output Types:
```typescript
// Connection types for pagination
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;
}

@ObjectType()
export class CustomerConnection {
  @Field(() => [Customer])
  nodes: Customer[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

// Bulk operation results
@ObjectType()
export class BulkUpdateResult {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  errorCount: number;

  @Field(() => [BulkError])
  errors: BulkError[];
}

@ObjectType()
export class BulkError {
  @Field(() => Int)
  index: number;

  @Field()
  message: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

// Statistics and analytics
@ObjectType()
export class CustomerStats {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => GraphQLDecimal)
  totalSpent: number;

  @Field(() => GraphQLDecimal)
  averageOrderValue: number;

  @Field(() => Date, { nullable: true })
  lastOrderDate?: Date;

  @Field(() => Int)
  loyaltyPoints: number;

  @Field(() => CustomerTier)
  tier: CustomerTier;
}
```

### Pagination Strategy

#### Cursor-Based Pagination:
```typescript
// Cursor-based pagination for real-time data
@ArgsType()
export class CursorPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @Min(1)
  @Max(100)
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => Int, { nullable: true })
  last?: number;

  @Field(() => String, { nullable: true })
  before?: string;
}

// Implementation in resolver
@Query(() => CustomerConnection)
async customers(
  @Args() args: CustomersArgs,
  @Context() context: GraphQLContext,
): Promise<CustomerConnection> {
  const { tenantId } = context;
  
  // Build cursor-based query
  const query = this.customerService.buildQuery({
    tenantId,
    ...args,
  });

  const [customers, totalCount] = await Promise.all([
    query.execute(),
    this.customerService.count({ tenantId, ...args }),
  ]);

  return {
    nodes: customers,
    pageInfo: {
      hasNextPage: customers.length === args.first,
      hasPreviousPage: !!args.after,
      startCursor: customers[0]?.id,
      endCursor: customers[customers.length - 1]?.id,
    },
    totalCount,
  };
}
```

#### Offset-Based Pagination:
```typescript
// Offset-based pagination for stable data
@ArgsType()
export class OffsetPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Min(0)
  offset?: number;
}
```

### Error Handling

#### GraphQL Error Types:
```typescript
// Custom error codes
export enum GraphQLErrorCode {
  // Authentication errors
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Custom GraphQL error class
export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public code: GraphQLErrorCode,
    public field?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// Error formatting
export const formatError = (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
  const originalError = error as GraphQLError;
  
  // Business logic errors
  if (originalError.originalError instanceof BusinessLogicError) {
    return {
      message: originalError.message,
      extensions: {
        code: originalError.originalError.code,
        field: originalError.originalError.field,
        details: originalError.originalError.details,
        timestamp: new Date().toISOString(),
      },
      locations: originalError.locations,
      path: originalError.path,
    };
  }

  // Validation errors
  if (originalError.extensions?.code === 'BAD_USER_INPUT') {
    return {
      message: 'Validation failed',
      extensions: {
        code: GraphQLErrorCode.VALIDATION_ERROR,
        validationErrors: originalError.extensions.validationErrors,
        timestamp: new Date().toISOString(),
      },
      locations: originalError.locations,
      path: originalError.path,
    };
  }

  // Default error handling
  return {
    message: isProduction ? 'Internal server error' : originalError.message,
    extensions: {
      code: GraphQLErrorCode.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    },
  };
};
```

### Validation

#### Input Validation:
```typescript
// Validation decorators
@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty({ message: 'SKU is required' })
  @Length(1, 100, { message: 'SKU must be between 1 and 100 characters' })
  @Matches(/^[A-Z0-9-_]+$/, { message: 'SKU can only contain uppercase letters, numbers, hyphens, and underscores' })
  sku: string;

  @Field()
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(1, 255, { message: 'Product name must be between 1 and 255 characters' })
  name: string;

  @Field(() => GraphQLDecimal)
  @IsPositive({ message: 'Selling price must be positive' })
  @Min(0.01, { message: 'Selling price must be at least 0.01' })
  sellingPrice: number;

  @Field(() => ID)
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayMaxSize(20, { message: 'Maximum 20 tags allowed' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @Length(1, 50, { each: true, message: 'Each tag must be between 1 and 50 characters' })
  tags?: string[];
}

// Custom validators
@ValidatorConstraint({ name: 'isValidSKU', async: true })
export class IsValidSKUConstraint implements ValidatorConstraintInterface {
  constructor(private productService: ProductService) {}

  async validate(sku: string, args: ValidationArguments): Promise<boolean> {
    const tenantId = args.object['tenantId'];
    const existingProduct = await this.productService.findBySku(sku, tenantId);
    return !existingProduct;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'SKU already exists';
  }
}

export function IsValidSKU(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSKUConstraint,
    });
  };
}
```

### Security at GraphQL Level

#### Query Depth Limiting:
```typescript
// Query depth analysis
export class QueryDepthPlugin implements ApolloServerPlugin {
  requestDidStart(): GraphQLRequestListener {
    return {
      didResolveOperation({ request, document }) {
        const depth = getQueryDepth(document);
        if (depth > 10) {
          throw new Error('Query depth limit exceeded');
        }
      },
    };
  }
}
```

#### Query Complexity Analysis:
```typescript
// Query complexity plugin
export class QueryComplexityPlugin implements ApolloServerPlugin {
  constructor(private maxComplexity: number = 1000) {}

  requestDidStart(): GraphQLRequestListener {
    return {
      didResolveOperation({ request, document, schema }) {
        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
          maximumComplexity: this.maxComplexity,
          scalarCost: 1,
          objectCost: 2,
          listFactor: 10,
          introspectionCost: 1000,
        });

        if (complexity > this.maxComplexity) {
          throw new Error(`Query complexity ${complexity} exceeds maximum allowed complexity ${this.maxComplexity}`);
        }
      },
    };
  }
}
```

### Rate Limiting & Query Complexity Protection

#### Rate Limiting Implementation:
```typescript
// Rate limiting guard
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();
    const { user } = req;

    if (!user) {
      return true; // Let authentication guard handle this
    }

    const key = `rate_limit:${user.tenantId}:${user.id}`;
    const limit = this.configService.get<number>('RATE_LIMIT_MAX', 100);
    const window = this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000); // 15 minutes

    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, Math.ceil(window / 1000));
    }

    if (current > limit) {
      throw new Error('Rate limit exceeded');
    }

    return true;
  }
}

// Apply rate limiting to resolvers
@UseGuards(RateLimitGuard)
@Resolver(() => Customer)
export class CustomerResolver {
  // ... resolver methods
}
```

---