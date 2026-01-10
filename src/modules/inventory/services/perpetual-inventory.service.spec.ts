import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PerpetualInventoryService } from './perpetual-inventory.service';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryMovementRepository } from '../repositories/inventory-movement.repository';
import { BatchTrackingRepository } from '../repositories/batch-tracking.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

describe('PerpetualInventoryService', () => {
  let service: PerpetualInventoryService;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let movementRepository: jest.Mocked<InventoryMovementRepository>;
  let cacheService: jest.Mocked<IntelligentCacheService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockInventoryRepository = {
      findByProductAndLocation: jest.fn(),
      create: jest.fn(),
      updateLevel: jest.fn(),
      findMany: jest.fn(),
    };

    const mockMovementRepository = {
      create: jest.fn(),
      findMany: jest.fn(),
      findPendingApprovals: jest.fn(),
    };

    const mockBatchRepository = {
      findByBatchNumber: jest.fn(),
      updateQuantity: jest.fn(),
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
        PerpetualInventoryService,
        {
          provide: InventoryRepository,
          useValue: mockInventoryRepository,
        },
        {
          provide: InventoryMovementRepository,
          useValue: mockMovementRepository,
        },
        {
          provide: BatchTrackingRepository,
          useValue: mockBatchRepository,
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

    service = module.get<PerpetualInventoryService>(PerpetualInventoryService);
    inventoryRepository = module.get(InventoryRepository);
    movementRepository = module.get(InventoryMovementRepository);
    cacheService = module.get(IntelligentCacheService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updatePerpetualInventory', () => {
    const mockInventoryLevel = {
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
    };

    it('should update inventory for sale movement', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const updateDto = {
        productId: 'product-1',
        locationId: 'location-1',
        movementType: 'sale' as const,
        quantity: 5,
        unitCost: 10,
      };

      inventoryRepository.findByProductAndLocation.mockResolvedValue(mockInventoryLevel);
      movementRepository.create.mockResolvedValue({
        id: 'movement-1',
        tenantId: 'tenant-1',
        productId: updateDto.productId,
        locationId: updateDto.locationId,
        movementType: updateDto.movementType,
        quantity: updateDto.quantity,
        unitCost: updateDto.unitCost,
        totalCost: 50,
        previousLevel: 100,
        newLevel: 95,
        requiresApproval: false,
        metadata: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        version: 1,
      });

      const result = await service.updatePerpetualInventory(tenantId, updateDto, userId);

      expect(result.previousLevel).toBe(100);
      expect(result.newLevel).toBe(95);
      expect(inventoryRepository.updateLevel).toHaveBeenCalledWith(
        tenantId,
        'product-1',
        null,
        'location-1',
        95,
        userId
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'perpetual.inventory.updated',
        expect.any(Object)
      );
    });

    it('should throw error if inventory level not found', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const updateDto = {
        productId: 'product-1',
        locationId: 'location-1',
        movementType: 'sale' as const,
        quantity: 5,
      };

      inventoryRepository.findByProductAndLocation.mockResolvedValue(null);

      await expect(
        service.updatePerpetualInventory(tenantId, updateDto, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if movement would result in negative inventory', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const updateDto = {
        productId: 'product-1',
        locationId: 'location-1',
        movementType: 'sale' as const,
        quantity: 150, // More than current level of 100
      };

      inventoryRepository.findByProductAndLocation.mockResolvedValue(mockInventoryLevel);

      await expect(
        service.updatePerpetualInventory(tenantId, updateDto, userId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('performInventoryReconciliation', () => {
    it('should reconcile inventory with variances', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const reconciliationDto = {
        locationId: 'location-1',
        reconciliationType: 'cycle' as const,
        expectedCounts: [
          {
            productId: 'product-1',
            expectedQuantity: 95, // System shows 100, actual is 95
          },
        ],
      };

      const mockInventoryLevel = {
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
      };

      inventoryRepository.findByProductAndLocation.mockResolvedValue(mockInventoryLevel);
      movementRepository.create.mockResolvedValue({
        id: 'movement-1',
        tenantId: 'tenant-1',
        productId: 'product-1',
        locationId: 'location-1',
        movementType: 'adjustment',
        quantity: -5,
        previousLevel: 100,
        newLevel: 95,
        requiresApproval: false,
        metadata: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        version: 1,
      });

      const result = await service.performInventoryReconciliation(
        tenantId,
        reconciliationDto,
        userId
      );

      expect(result.summary.totalItems).toBe(1);
      expect(result.summary.itemsWithVariances).toBe(1);
      expect(result.variances).toHaveLength(1);
      expect(result.variances[0]?.variance).toBe(-5);
      expect(result.adjustments).toHaveLength(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inventory.variance.detected',
        expect.any(Object)
      );
    });
  });

  describe('getPerpetualInventoryStatus', () => {
    it('should return inventory status with alerts and recommendations', async () => {
      const tenantId = 'tenant-1';
      const locationId = 'location-1';

      const inventoryLevels = {
        inventoryLevels: [
          {
            id: 'inv-1',
            tenantId: 'tenant-1',
            productId: 'product-1',
            locationId,
            currentLevel: 0, // Out of stock
            availableLevel: 0,
            reservedLevel: 0,
            minStockLevel: 5,
            reorderPoint: 10,
            reorderQuantity: 50,
            valuationMethod: 'fifo',
            averageCost: 10,
            totalValue: 0,
            lastMovementAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
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
            currentLevel: 5, // Low stock
            availableLevel: 5,
            reservedLevel: 0,
            minStockLevel: 2,
            reorderPoint: 10,
            reorderQuantity: 50,
            valuationMethod: 'fifo',
            averageCost: 15,
            totalValue: 75,
            lastMovementAt: new Date(),
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

      const recentMovements = [
        {
          id: 'movement-1',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId,
          movementType: 'adjustment',
          quantity: 0,
          previousLevel: 0,
          newLevel: 0,
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

      const pendingAdjustments = [
        {
          id: 'movement-2',
          tenantId: 'tenant-1',
          productId: 'product-1',
          locationId,
          movementType: 'adjustment',
          quantity: 5,
          previousLevel: 0,
          newLevel: 5,
          requiresApproval: true,
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
      inventoryRepository.findMany.mockResolvedValue(inventoryLevels);
      movementRepository.findMany.mockResolvedValue(recentMovements);
      movementRepository.findPendingApprovals.mockResolvedValue(pendingAdjustments);

      const result = await service.getPerpetualInventoryStatus(tenantId, locationId);

      expect(result.locationId).toBe(locationId);
      expect(result.summary.totalProducts).toBe(2);
      expect(result.summary.pendingAdjustments).toBe(1);
      expect(result.alerts.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});