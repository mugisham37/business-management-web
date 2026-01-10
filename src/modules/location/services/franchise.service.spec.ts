import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { FranchiseRepository } from '../repositories/franchise.repository';
import { LocationService } from './location.service';
import { FranchiseType, FranchiseStatus, TerritoryType } from '../entities/franchise.entity';
import { CreateFranchiseDto, CreateTerritoryDto } from '../dto/franchise.dto';

describe('FranchiseService', () => {
  let service: FranchiseService;
  let franchiseRepository: jest.Mocked<FranchiseRepository>;
  let locationService: jest.Mocked<LocationService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockFranchise = {
    id: 'franchise-1',
    tenantId: 'tenant-1',
    name: 'Test Franchise',
    code: 'TF001',
    type: FranchiseType.FRANCHISE,
    status: FranchiseStatus.ACTIVE,
    contactInfo: {},
    contractTerms: {},
    performanceMetrics: {},
    settings: {},
    featureFlags: {},
    royaltyRate: 0.05,
    marketingFeeRate: 0.02,
    initialFranchiseFee: 50000,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const mockTerritory = {
    id: 'territory-1',
    tenantId: 'tenant-1',
    name: 'Test Territory',
    code: 'TT001',
    type: TerritoryType.GEOGRAPHIC,
    boundaries: {},
    marketCriteria: {},
    metrics: {},
    settings: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  beforeEach(async () => {
    const mockFranchiseRepository = {
      createFranchise: jest.fn(),
      findFranchiseById: jest.fn(),
      findFranchiseByCode: jest.fn(),
      findFranchises: jest.fn(),
      updateFranchise: jest.fn(),
      deleteFranchise: jest.fn(),
      createTerritory: jest.fn(),
      findTerritoryById: jest.fn(),
      findTerritoryByCode: jest.fn(),
      findTerritories: jest.fn(),
      updateTerritory: jest.fn(),
      deleteTerritory: jest.fn(),
      createFranchiseLocation: jest.fn(),
      findFranchiseLocationsByFranchise: jest.fn(),
      findFranchiseLocationsByLocation: jest.fn(),
      createFranchisePermission: jest.fn(),
      findFranchisePermissionsByUser: jest.fn(),
      findFranchisePermissionsByFranchise: jest.fn(),
      createTerritoryAssignment: jest.fn(),
      findTerritoryAssignmentsByTerritory: jest.fn(),
      findTerritoryAssignmentsByFranchise: jest.fn(),
      createFranchiseMetric: jest.fn(),
      findFranchiseMetrics: jest.fn(),
    };

    const mockLocationService = {
      getLocationById: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseService,
        {
          provide: FranchiseRepository,
          useValue: mockFranchiseRepository,
        },
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<FranchiseService>(FranchiseService);
    franchiseRepository = module.get(FranchiseRepository);
    locationService = module.get(LocationService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFranchise', () => {
    const createFranchiseDto: CreateFranchiseDto = {
      name: 'Test Franchise',
      code: 'TF001',
      type: FranchiseType.FRANCHISE,
    };

    it('should create a franchise successfully', async () => {
      franchiseRepository.findFranchiseByCode.mockResolvedValue(null);
      franchiseRepository.createFranchise.mockResolvedValue(mockFranchise);

      const result = await service.createFranchise('tenant-1', createFranchiseDto, 'user-1');

      expect(franchiseRepository.findFranchiseByCode).toHaveBeenCalledWith('tenant-1', 'TF001');
      expect(franchiseRepository.createFranchise).toHaveBeenCalledWith('tenant-1', createFranchiseDto, 'user-1');
      expect(eventEmitter.emit).toHaveBeenCalledWith('franchise.created', {
        tenantId: 'tenant-1',
        franchise: mockFranchise,
        userId: 'user-1',
      });
      expect(result).toEqual(mockFranchise);
    });

    it('should throw ConflictException if franchise code already exists', async () => {
      franchiseRepository.findFranchiseByCode.mockResolvedValue(mockFranchise);

      await expect(
        service.createFranchise('tenant-1', createFranchiseDto, 'user-1')
      ).rejects.toThrow(ConflictException);

      expect(franchiseRepository.createFranchise).not.toHaveBeenCalled();
    });
  });

  describe('getFranchiseById', () => {
    it('should return franchise if found', async () => {
      franchiseRepository.findFranchiseById.mockResolvedValue(mockFranchise);

      const result = await service.getFranchiseById('tenant-1', 'franchise-1');

      expect(franchiseRepository.findFranchiseById).toHaveBeenCalledWith('tenant-1', 'franchise-1');
      expect(result).toEqual(mockFranchise);
    });

    it('should throw NotFoundException if franchise not found', async () => {
      franchiseRepository.findFranchiseById.mockResolvedValue(null);

      await expect(
        service.getFranchiseById('tenant-1', 'franchise-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTerritory', () => {
    const createTerritoryDto: CreateTerritoryDto = {
      name: 'Test Territory',
      code: 'TT001',
      type: TerritoryType.GEOGRAPHIC,
    };

    it('should create a territory successfully', async () => {
      franchiseRepository.findTerritoryByCode.mockResolvedValue(null);
      franchiseRepository.createTerritory.mockResolvedValue(mockTerritory);

      const result = await service.createTerritory('tenant-1', createTerritoryDto, 'user-1');

      expect(franchiseRepository.findTerritoryByCode).toHaveBeenCalledWith('tenant-1', 'TT001');
      expect(franchiseRepository.createTerritory).toHaveBeenCalledWith('tenant-1', createTerritoryDto, 'user-1');
      expect(eventEmitter.emit).toHaveBeenCalledWith('territory.created', {
        tenantId: 'tenant-1',
        territory: mockTerritory,
        userId: 'user-1',
      });
      expect(result).toEqual(mockTerritory);
    });

    it('should throw ConflictException if territory code already exists', async () => {
      franchiseRepository.findTerritoryByCode.mockResolvedValue(mockTerritory);

      await expect(
        service.createTerritory('tenant-1', createTerritoryDto, 'user-1')
      ).rejects.toThrow(ConflictException);

      expect(franchiseRepository.createTerritory).not.toHaveBeenCalled();
    });
  });

  describe('getFranchises', () => {
    it('should return paginated franchises', async () => {
      const mockResult = {
        franchises: [mockFranchise],
        total: 1,
      };

      franchiseRepository.findFranchises.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' as const };
      const result = await service.getFranchises('tenant-1', query);

      expect(franchiseRepository.findFranchises).toHaveBeenCalledWith('tenant-1', query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTerritories', () => {
    it('should return paginated territories', async () => {
      const mockResult = {
        territories: [mockTerritory],
        total: 1,
      };

      franchiseRepository.findTerritories.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' as const };
      const result = await service.getTerritories('tenant-1', query);

      expect(franchiseRepository.findTerritories).toHaveBeenCalledWith('tenant-1', query);
      expect(result).toEqual(mockResult);
    });
  });
});