import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeModule } from './realtime.module';
import { RealtimeService } from './services/realtime.service';
import { ConnectionManagerService } from './services/connection-manager.service';

describe('RealtimeModule Integration', () => {
  let app: INestApplication;
  let realtimeService: RealtimeService;
  let connectionManager: ConnectionManagerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        RealtimeModule,
      ],
    })
    .overrideProvider('AuthService')
    .useValue({
      validateUser: jest.fn().mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com',
        tenantId: 'test-tenant',
        role: 'employee',
        permissions: ['realtime:read'],
        displayName: 'Test User',
        sessionId: 'test-session',
      }),
    })
    .overrideProvider('TenantService')
    .useValue({
      isValidTenant: jest.fn().mockResolvedValue(true),
    })
    .overrideProvider('LoggerService')
    .useValue({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    realtimeService = moduleFixture.get<RealtimeService>(RealtimeService);
    connectionManager = moduleFixture.get<ConnectionManagerService>(ConnectionManagerService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RealtimeService', () => {
    it('should be defined', () => {
      expect(realtimeService).toBeDefined();
    });

    it('should broadcast inventory update', async () => {
      const event = {
        productId: 'product-1',
        locationId: 'location-1',
        previousQuantity: 5,
        newQuantity: 10,
        changeReason: 'restock',
        changedBy: 'user-1',
      };

      // This should not throw an error
      await expect(
        realtimeService.broadcastInventoryUpdate('tenant-1', event)
      ).resolves.not.toThrow();
    });

    it('should broadcast transaction event', async () => {
      const event = {
        transactionId: 'tx-1',
        locationId: 'location-1',
        customerId: 'customer-1',
        total: 100,
        items: [
          { productId: 'product-1', quantity: 2, price: 50 }
        ],
        paymentMethod: 'cash',
        status: 'completed',
        processedBy: 'user-1',
      };

      await expect(
        realtimeService.broadcastTransactionEvent('tenant-1', event)
      ).resolves.not.toThrow();
    });

    it('should send notification', async () => {
      const notification = {
        id: 'notif-1',
        type: 'info' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'medium' as const,
      };

      await expect(
        realtimeService.sendNotification('tenant-1', notification)
      ).resolves.not.toThrow();
    });

    it('should get connection statistics', () => {
      const stats = realtimeService.getConnectionStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.connectedClients).toBe('number');
    });
  });

  describe('ConnectionManagerService', () => {
    it('should be defined', () => {
      expect(connectionManager).toBeDefined();
    });

    it('should get metrics', () => {
      const metrics = connectionManager.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalConnections');
      expect(metrics).toHaveProperty('connectionsByTenant');
      expect(metrics).toHaveProperty('lastUpdated');
    });

    it('should get health status', () => {
      const health = connectionManager.getHealth();
      expect(health).toBeDefined();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('totalConnections');
      expect(health).toHaveProperty('lastHealthCheck');
      expect(['healthy', 'degraded', 'critical']).toContain(health.status);
    });

    it('should get system stats', () => {
      const stats = connectionManager.getSystemStats();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('current');
      expect(stats).toHaveProperty('historical');
      expect(stats).toHaveProperty('health');
    });

    it('should detect anomalies', () => {
      const anomalies = connectionManager.detectAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should get connection trends', () => {
      const trends = connectionManager.getConnectionTrends();
      expect(trends).toBeDefined();
      expect(trends).toHaveProperty('hourly');
      expect(trends).toHaveProperty('peak');
      expect(trends).toHaveProperty('current');
      expect(Array.isArray(trends.hourly)).toBe(true);
    });
  });
});