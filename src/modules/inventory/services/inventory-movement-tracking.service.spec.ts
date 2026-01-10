import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryMovementTrackingService } from './inventory-movement-tracking.service';
import { InventoryMovementRepository } from '../repositories/inventory-movement.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

describe('InventoryMovementTrackingService', () => {
  let service: InventoryMovementTrackingService;
  let movementRepository: jest.Mocked<InventoryMovementRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let cacheService: jest.Mocked<IntelligentCacheService>;

  beforeEach(async () => {
    const mockMovementRepository = {
      findMany: jest.fn(),
      findByProduct: jest.fn(),
    };

    const mockInventoryRepository = {
      findMany: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryMovementTrackingService,
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
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<InventoryMovementTrackingService>(InventoryMovementTrackingService);
    movementRepository = module.get(InventoryMovementRepository);
    inventoryRepository = module.get(InventoryRepository);
    cacheService = module.get(IntelligentCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailedMovementHistory', () => {
    it('should return cached result if available', async () => {
      const tenantId = 'tenant-1';
      const query = { productId: 'product-1' };
      const cachedResult = {
        movements: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
        summary: {
          totalInbound: 0,
          totalOutbound: 0,
          netMovement: 0,
          uniqueProducts: 0,
          movementTypes: {},
          valueImpact: 0,
        },
      };

      cacheService.get.mockResolvedValue(cachedResult);

      const result = await service.getDetailedMovementHistory(tenantId, query);

      expect(result).toEqual(cachedResult);
      expect(cacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('movement-tracking:tenant-1:detailed:')
      );
      expect(movementRepository.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and cache result if not in cache', async () => {
      const tenantId = 'tenant-1';
      const query = { productId: 'product-1' };
      const movements = [
        {
          id: 'movement-1',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId: 'location-1',
          movementType: 'purchase',
          quantity: 10,
          unitCost: 10,
          totalCost: 100,
          previousLevel: 90,
          newLevel: 100,
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

      cacheService.get.mockResolvedValue(null);
      movementRepository.findMany.mockResolvedValue(movements);

      const result = await service.getDetailedMovementHistory(tenantId, query);

      expect(result.movements).toEqual(movements);
      expect(result.summary.totalInbound).toBe(10);
      expect(result.summary.uniqueProducts).toBe(1);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('analyzeMovementVelocity', () => {
    it('should calculate velocity metrics correctly', async () => {
      const tenantId = 'tenant-1';
      const productId = 'product-1';
      const locationId = 'location-1';
      const periodDays = 30;

      const movements = [
        {
          id: 'movement-1',
          tenantId: 'tenant-1',
          productId,
          locationId,
          movementType: 'sale',
          quantity: 10,
          unitCost: 10,
          totalCost: 100,
          previousLevel: 90,
          newLevel: 100,
          requiresApproval: false,
          metadata: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          version: 1,
        },
        {
          id: 'movement-2',
          tenantId: 'tenant-1',
          productId,
          locationId,
          movementType: 'sale',
          quantity: -5,
          unitCost: 10,
          totalCost: 50,
          previousLevel: 100,
          newLevel: 95,
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

      cacheService.get.mockResolvedValue(null);
      movementRepository.findMany.mockResolvedValue(movements);

      const result = await service.analyzeMovementVelocity(
        tenantId,
        productId,
        locationId,
        periodDays
      );

      expect(result.productId).toBe(productId);
      expect(result.locationId).toBe(locationId);
      expect(result.velocity.totalInbound).toBe(10);
      expect(result.velocity.totalOutbound).toBe(5);
      expect(result.velocity.netMovement).toBe(5);
      expect(result.accuracy.adjustmentCount).toBe(0);
    });
  });

  describe('calculateInventoryAccuracy', () => {
    it('should calculate accuracy metrics for a location', async () => {
      const tenantId = 'tenant-1';
      const locationId = 'location-1';
      const periodDays = 30;

      const adjustments = [
        {
          id: 'adj-1',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId,
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
            locationId,
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
            locationId,
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

      const result = await service.calculateInventoryAccuracy(
        tenantId,
        locationId,
        periodDays
      );

      expect(result.locationId).toBe(locationId);
      expect(result.accuracy.totalProducts).toBe(2);
      expect(result.accuracy.productsWithAdjustments).toBe(1);
      expect(result.accuracy.accuracyPercentage).toBe(50); // 1 out of 2 products had adjustments
      expect(result.accuracy.totalAdjustments).toBe(1);
    });
  });
});