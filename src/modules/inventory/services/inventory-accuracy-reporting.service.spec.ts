import { Test, TestingModule } from '@nestjs/testing';
import { InventoryAccuracyReportingService } from './inventory-accuracy-reporting.service';
import { InventoryMovementRepository } from '../repositories/inventory-movement.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

describe('InventoryAccuracyReportingService', () => {
  let service: InventoryAccuracyReportingService;
  let movementRepository: jest.Mocked<InventoryMovementRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let cacheService: jest.Mocked<IntelligentCacheService>;

  beforeEach(async () => {
    const mockMovementRepository = {
      findMany: jest.fn(),
      getMovementSummary: jest.fn(),
    };

    const mockInventoryRepository = {
      findMany: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryAccuracyReportingService,
        {
          provide: InventoryMovementRepository,
          useValue: mockMovementRepository,
        },
        {
          provide: InventoryRepository,
          useValue: mockInventoryRepository,
        },
        {
          provide: IntelligentCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<InventoryAccuracyReportingService>(InventoryAccuracyReportingService);
    movementRepository = module.get(InventoryMovementRepository);
    inventoryRepository = module.get(InventoryRepository);
    cacheService = module.get(IntelligentCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccuracyReport', () => {
    it('should generate summary accuracy report', async () => {
      const tenantId = 'tenant-1';
      const query = {
        reportType: 'summary' as const,
        locationId: 'location-1',
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
      };

      const adjustments = [
        {
          id: 'adj-1',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId: 'location-1',
          movementType: 'adjustment',
          quantity: 2,
          unitCost: 10,
          totalCost: 20,
          previousLevel: 98,
          newLevel: 100,
          reason: 'cycle_count',
          requiresApproval: false,
          metadata: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          version: 1,
        },
      ];

      const inventoryLevels = {
        inventoryLevels: [
          {
            id: 'inv-1',
            tenantId: 'tenant-1',
            productId: 'product-1',
            locationId: 'location-1',
            currentLevel: 100,
            availableLevel: 100,
            reservedLevel: 0,
            minStockLevel: 10,
            reorderPoint: 20,
            reorderQuantity: 50,
            valuationMethod: 'fifo',
            averageCost: 10,
            totalValue: 1000,
            lowStockAlertSent: false,
            attributes: {},
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-1',
            updatedBy: 'user-1',
            version: 1,
          },
          {
            id: 'inv-2',
            tenantId: 'tenant-1',
            productId: 'product-2',
            locationId: 'location-1',
            currentLevel: 50,
            availableLevel: 50,
            reservedLevel: 0,
            minStockLevel: 5,
            reorderPoint: 10,
            reorderQuantity: 25,
            valuationMethod: 'fifo',
            averageCost: 15,
            totalValue: 750,
            lowStockAlertSent: false,
            attributes: {},
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-1',
            updatedBy: 'user-1',
            version: 1,
          },
        ],
        total: 2,
        page: 1,
        limit: 100,
        totalPages: 1,
      };

      cacheService.get.mockResolvedValue(null);
      movementRepository.findMany.mockResolvedValue(adjustments);
      inventoryRepository.findMany.mockResolvedValue(inventoryLevels);

      const result = await service.generateAccuracyReport(tenantId, query);

      expect(result.reportType).toBe('summary');
      expect(result.summary.totalProducts).toBe(2);
      expect(result.summary.totalVariances).toBe(1);
      expect(result.summary.overallAccuracyPercentage).toBe(50);
      expect(result.summary.totalVarianceValue).toBe(20);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached result if available', async () => {
      const tenantId = 'tenant-1';
      const query = {
        reportType: 'summary' as const,
        locationId: 'location-1',
      };
      const cachedResult = {
        reportType: 'summary' as const,
        locationId: 'location-1',
        summary: {
          totalProducts: 2,
          totalVariances: 1,
          overallAccuracyPercentage: 50,
          totalVarianceValue: 20,
          totalLocations: 1,
          totalCountSessions: 1,
          averageVariancePerProduct: 20,
          bestPerformingLocation: {
            locationId: 'location-1',
            accuracyPercentage: 50,
          },
          worstPerformingLocation: {
            locationId: 'location-1',
            accuracyPercentage: 50,
          },
        },
        data: {},
        generatedAt: new Date(),
      };

      cacheService.get.mockResolvedValue(cachedResult);

      const result = await service.generateAccuracyReport(tenantId, query);

      expect(result).toEqual(cachedResult);
      expect(movementRepository.findMany).not.toHaveBeenCalled();
      expect(inventoryRepository.findMany).not.toHaveBeenCalled();
    });

    it('should generate detailed accuracy report', async () => {
      const tenantId = 'tenant-1';
      const query = {
        reportType: 'detailed' as const,
        locationId: 'location-1',
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
      };

      const adjustments = [
        {
          id: 'adj-1',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId: 'location-1',
          movementType: 'adjustment',
          quantity: 2,
          unitCost: 10,
          totalCost: 20,
          previousLevel: 98,
          newLevel: 100,
          reason: 'cycle_count',
          notes: 'Found 2 extra units during cycle count',
          requiresApproval: false,
          metadata: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          version: 1,
          product: {
            id: 'product-1',
            name: 'Test Product 1',
            sku: 'TEST-001',
          },
        },
      ];

      cacheService.get.mockResolvedValue(null);
      movementRepository.findMany.mockResolvedValue(adjustments);

      const result = await service.generateAccuracyReport(tenantId, query);

      expect(result.reportType).toBe('detailed');
      expect(result.data.adjustments).toHaveLength(1);
      expect(result.data.adjustments[0].productId).toBe('product-1');
      expect(result.data.adjustments[0].variance).toBe(2);
      expect(result.data.adjustments[0].varianceValue).toBe(20);
      expect(result.summary.totalVariances).toBe(1);
      expect(result.summary.totalVarianceValue).toBe(20);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });
});