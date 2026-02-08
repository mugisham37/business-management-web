import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization with unique company code', async () => {
      const dto = {
        name: 'Test Organization',
        email: 'test@example.com',
      };

      const mockOrganization = {
        id: '123',
        companyCode: 'ABC123',
        name: dto.name,
        email: dto.email,
        phone: null,
        address: null,
        subscriptionPlan: null,
        subscriptionStatus: 'trial',
        trialEndsAt: null,
        maxUsers: 10,
        maxLocations: 1,
        currentUserCount: 0,
        currentLocationCount: 0,
        onboardingCompleted: false,
        onboardingData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue(mockOrganization);

      const result = await service.create(dto);

      expect(result).toEqual(mockOrganization);
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          email: dto.email,
          maxUsers: 10,
          maxLocations: 1,
          subscriptionStatus: 'trial',
          companyCode: expect.any(String),
        }),
      });
    });

    it('should use custom maxUsers and maxLocations if provided', async () => {
      const dto = {
        name: 'Test Organization',
        email: 'test@example.com',
        maxUsers: 50,
        maxLocations: 5,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue({
        id: '123',
        companyCode: 'ABC123',
        ...dto,
      });

      await service.create(dto);

      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          maxUsers: 50,
          maxLocations: 5,
        }),
      });
    });
  });

  describe('findById', () => {
    it('should find organization by ID', async () => {
      const mockOrganization = {
        id: '123',
        companyCode: 'ABC123',
        name: 'Test Org',
        email: 'test@example.com',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.findById('123');

      expect(result).toEqual(mockOrganization);
      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByCompanyCode', () => {
    it('should find organization by company code', async () => {
      const mockOrganization = {
        id: '123',
        companyCode: 'ABC123',
        name: 'Test Org',
        email: 'test@example.com',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.findByCompanyCode('ABC123');

      expect(result).toEqual(mockOrganization);
      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { companyCode: 'ABC123' },
      });
    });

    it('should convert company code to uppercase', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await service.findByCompanyCode('abc123');

      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { companyCode: 'ABC123' },
      });
    });

    it('should return null if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      const result = await service.findByCompanyCode('NONEXIST');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const existingOrg = {
        id: '123',
        companyCode: 'ABC123',
        name: 'Old Name',
        email: 'old@example.com',
      };

      const updateDto = {
        name: 'New Name',
        email: 'new@example.com',
      };

      const updatedOrg = {
        ...existingOrg,
        ...updateDto,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(existingOrg);
      mockPrismaService.organization.update.mockResolvedValue(updatedOrg);

      const result = await service.update('123', updateDto);

      expect(result).toEqual(updatedOrg);
      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'New Name' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('canAddUser', () => {
    it('should return true if current user count is below max', async () => {
      const mockOrganization = {
        id: '123',
        currentUserCount: 5,
        maxUsers: 10,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.canAddUser('123');

      expect(result).toBe(true);
    });

    it('should return false if current user count equals max', async () => {
      const mockOrganization = {
        id: '123',
        currentUserCount: 10,
        maxUsers: 10,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.canAddUser('123');

      expect(result).toBe(false);
    });

    it('should return false if current user count exceeds max', async () => {
      const mockOrganization = {
        id: '123',
        currentUserCount: 11,
        maxUsers: 10,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.canAddUser('123');

      expect(result).toBe(false);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.canAddUser('nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('canAddLocation', () => {
    it('should return true if current location count is below max', async () => {
      const mockOrganization = {
        id: '123',
        currentLocationCount: 2,
        maxLocations: 5,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.canAddLocation('123');

      expect(result).toBe(true);
    });

    it('should return false if current location count equals max', async () => {
      const mockOrganization = {
        id: '123',
        currentLocationCount: 5,
        maxLocations: 5,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.canAddLocation('123');

      expect(result).toBe(false);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.canAddLocation('nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('incrementUserCount', () => {
    it('should increment user count', async () => {
      mockPrismaService.organization.update.mockResolvedValue({
        id: '123',
        currentUserCount: 6,
      });

      await service.incrementUserCount('123');

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          currentUserCount: {
            increment: 1,
          },
        },
      });
    });
  });

  describe('decrementUserCount', () => {
    it('should decrement user count', async () => {
      mockPrismaService.organization.update.mockResolvedValue({
        id: '123',
        currentUserCount: 4,
      });

      await service.decrementUserCount('123');

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          currentUserCount: {
            decrement: 1,
          },
        },
      });
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription plan and status', async () => {
      mockPrismaService.organization.update.mockResolvedValue({
        id: '123',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
      });

      await service.updateSubscription('123', 'premium', 'active');

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          subscriptionPlan: 'premium',
          subscriptionStatus: 'active',
        },
      });
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true for active subscription', async () => {
      const mockOrganization = {
        id: '123',
        subscriptionStatus: 'active',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.isSubscriptionActive('123');

      expect(result).toBe(true);
    });

    it('should return true for trial subscription', async () => {
      const mockOrganization = {
        id: '123',
        subscriptionStatus: 'trial',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.isSubscriptionActive('123');

      expect(result).toBe(true);
    });

    it('should return false for suspended subscription', async () => {
      const mockOrganization = {
        id: '123',
        subscriptionStatus: 'suspended',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.isSubscriptionActive('123');

      expect(result).toBe(false);
    });

    it('should return false for cancelled subscription', async () => {
      const mockOrganization = {
        id: '123',
        subscriptionStatus: 'cancelled',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.isSubscriptionActive('123');

      expect(result).toBe(false);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.isSubscriptionActive('nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as completed and store data', async () => {
      const onboardingData = {
        businessType: 'retail',
        industry: 'e-commerce',
        companySize: 'medium',
        teamSize: 25,
        numberOfLocations: 3,
      };

      mockPrismaService.organization.update.mockResolvedValue({
        id: '123',
        onboardingCompleted: true,
        onboardingData,
      });

      await service.completeOnboarding('123', onboardingData);

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          onboardingCompleted: true,
          onboardingData,
        },
      });
    });
  });

  describe('getRecommendedPlans', () => {
    it('should recommend Starter plan for small teams', () => {
      const data = {
        teamSize: 5,
        numberOfLocations: 1,
        companySize: 'small',
      };

      const plans = service.getRecommendedPlans(data);

      expect(plans).toHaveLength(4);
      const recommended = plans.find(p => p.recommended);
      expect(recommended?.name).toBe('Starter');
    });

    it('should recommend Professional plan for medium teams', () => {
      const data = {
        teamSize: 25,
        numberOfLocations: 3,
        companySize: 'medium',
      };

      const plans = service.getRecommendedPlans(data);

      const recommended = plans.find(p => p.recommended);
      expect(recommended?.name).toBe('Professional');
    });

    it('should recommend Business plan for large teams', () => {
      const data = {
        teamSize: 100,
        numberOfLocations: 10,
        companySize: 'large',
      };

      const plans = service.getRecommendedPlans(data);

      const recommended = plans.find(p => p.recommended);
      expect(recommended?.name).toBe('Business');
    });

    it('should recommend Enterprise plan for enterprise companies', () => {
      const data = {
        teamSize: 500,
        numberOfLocations: 50,
        companySize: 'enterprise',
      };

      const plans = service.getRecommendedPlans(data);

      const recommended = plans.find(p => p.recommended);
      expect(recommended?.name).toBe('Enterprise');
    });

    it('should include recommendation reason', () => {
      const data = {
        teamSize: 25,
        numberOfLocations: 3,
        companySize: 'medium',
      };

      const plans = service.getRecommendedPlans(data);

      const recommended = plans.find(p => p.recommended);
      expect(recommended?.reason).toBeDefined();
      expect(recommended?.reason).toContain('users');
    });

    it('should handle minimal onboarding data', () => {
      const data = {};

      const plans = service.getRecommendedPlans(data);

      expect(plans).toHaveLength(4);
      const recommended = plans.find(p => p.recommended);
      expect(recommended?.name).toBe('Starter');
    });
  });
});
