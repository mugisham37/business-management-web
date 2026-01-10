import { Test, TestingModule } from '@nestjs/testing';
import { LiveInventoryService } from './live-inventory.service';
import { LiveSalesDashboardService } from './live-sales-dashboard.service';
import { LiveCustomerActivityService } from './live-customer-activity.service';
import { LiveAnalyticsService } from './live-analytics.service';
import { RealtimeService } from './realtime.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

// Mock implementations
const mockRealtimeService = {
  broadcastInventoryUpdate: jest.fn(),
  broadcastTransactionEvent: jest.fn(),
  broadcastCustomerActivity: jest.fn(),
  sendNotification: jest.fn(),
  broadcastLowStockAlert: jest.fn(),
  broadcastSalesMilestone: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  invalidatePattern: jest.fn(),
};

describe('Live Data Services', () => {
  let liveInventoryService: LiveInventoryService;
  let liveSalesService: LiveSalesDashboardService;
  let liveCustomerService: LiveCustomerActivityService;
  let liveAnalyticsService: LiveAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveInventoryService,
        LiveSalesDashboardService,
        LiveCustomerActivityService,
        LiveAnalyticsService,
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
        {
          provide: IntelligentCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    liveInventoryService = module.get<LiveInventoryService>(LiveInventoryService);
    liveSalesService = module.get<LiveSalesDashboardService>(LiveSalesDashboardService);
    liveCustomerService = module.get<LiveCustomerActivityService>(LiveCustomerActivityService);
    liveAnalyticsService = module.get<LiveAnalyticsService>(LiveAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('LiveInventoryService', () => {
    it('should be defined', () => {
      expect(liveInventoryService).toBeDefined();
    });

    it('should get inventory dashboard data', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveInventoryService.getInventoryDashboardData(tenantId);

      expect(result).toBeDefined();
      expect(result.totalProducts).toBeGreaterThan(0);
      expect(result.recentMovements).toBeInstanceOf(Array);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should get live inventory levels', async () => {
      const tenantId = 'test-tenant';
      const productIds = ['prod-1', 'prod-2'];
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveInventoryService.getLiveInventoryLevels(tenantId, productIds);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(productIds.length);
      expect(result[0]).toHaveProperty('productId');
      expect(result[0]).toHaveProperty('currentLevel');
      expect(result[0]).toHaveProperty('status');
    });

    it('should subscribe to inventory updates', async () => {
      const tenantId = 'test-tenant';
      const productIds = ['prod-1'];

      const result = await liveInventoryService.subscribeToInventoryUpdates(tenantId, productIds);

      expect(result).toBeDefined();
      expect(result.subscriptionId).toBeDefined();
      expect(result.initialData).toBeInstanceOf(Array);
    });
  });

  describe('LiveSalesDashboardService', () => {
    it('should be defined', () => {
      expect(liveSalesService).toBeDefined();
    });

    it('should get sales dashboard data', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveSalesService.getSalesDashboardData(tenantId);

      expect(result).toBeDefined();
      expect(result.today).toBeDefined();
      expect(result.realTime).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.topPerformers).toBeDefined();
    });

    it('should get live sales metrics', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveSalesService.getLiveSalesMetrics(tenantId);

      expect(result).toBeDefined();
      expect(result.currentHourSales).toBeGreaterThanOrEqual(0);
      expect(result.todayTotal).toBeGreaterThanOrEqual(0);
      expect(result.salesVelocity).toBeGreaterThanOrEqual(0);
    });

    it('should get hourly sales breakdown', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveSalesService.getHourlySalesBreakdown(tenantId);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(24); // 24 hours
      expect(result[0]).toHaveProperty('hour');
      expect(result[0]).toHaveProperty('sales');
      expect(result[0]).toHaveProperty('transactions');
    });
  });

  describe('LiveCustomerActivityService', () => {
    it('should be defined', () => {
      expect(liveCustomerService).toBeDefined();
    });

    it('should get customer activity feed', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveCustomerService.getCustomerActivityFeed(tenantId);

      expect(result).toBeDefined();
      expect(result.activities).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.trends).toBeDefined();
    });

    it('should get customer engagement metrics', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveCustomerService.getCustomerEngagementMetrics(tenantId);

      expect(result).toBeDefined();
      expect(result.activeCustomers).toBeDefined();
      expect(result.newCustomers).toBeDefined();
      expect(result.loyaltyMetrics).toBeDefined();
      expect(result.purchaseBehavior).toBeDefined();
    });

    it('should get customer activity history', async () => {
      const tenantId = 'test-tenant';
      const customerId = 'customer-1';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveCustomerService.getCustomerActivityHistory(tenantId, customerId);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('customerId');
      expect(result[0]).toHaveProperty('timestamp');
    });
  });

  describe('LiveAnalyticsService', () => {
    it('should be defined', () => {
      expect(liveAnalyticsService).toBeDefined();
    });

    it('should get live analytics data', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveAnalyticsService.getLiveAnalyticsData(tenantId);

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.realTimeMetrics).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.locationPerformance).toBeInstanceOf(Array);
      expect(result.productPerformance).toBeInstanceOf(Array);
    });

    it('should get KPI metrics', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveAnalyticsService.getKPIMetrics(tenantId);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('unit');
      expect(result[0]).toHaveProperty('change');
    });

    it('should get analytics alerts', async () => {
      const tenantId = 'test-tenant';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveAnalyticsService.getAnalyticsAlerts(tenantId);

      expect(result).toBeInstanceOf(Array);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('type');
        expect(result[0]).toHaveProperty('severity');
        expect(result[0]).toHaveProperty('title');
      }
    });

    it('should create analytics alert', async () => {
      const tenantId = 'test-tenant';
      const alertData = {
        type: 'performance' as const,
        severity: 'warning' as const,
        title: 'Test Alert',
        message: 'This is a test alert',
        data: { test: true },
      };

      const result = await liveAnalyticsService.createAnalyticsAlert(tenantId, alertData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(alertData.title);
      expect(result.type).toBe(alertData.type);
      expect(mockRealtimeService.sendNotification).toHaveBeenCalled();
    });

    it('should get performance comparison', async () => {
      const tenantId = 'test-tenant';
      const period = 'day';
      mockCacheService.get.mockResolvedValue(null);

      const result = await liveAnalyticsService.getPerformanceComparison(tenantId, period);

      expect(result).toBeDefined();
      expect(result.current).toBeDefined();
      expect(result.previous).toBeDefined();
      expect(result.change).toBeDefined();
      expect(result.changeDirection).toBeDefined();
    });
  });
});