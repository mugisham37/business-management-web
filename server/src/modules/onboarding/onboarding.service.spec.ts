import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { PlanTier } from './types/onboarding.types';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockOrganizationsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('selectPlan', () => {
    const organizationId = 'org-123';

    it('should update organization with Starter plan limits', async () => {
      const planTier: PlanTier = 'Starter';

      await service.selectPlan(organizationId, planTier);

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          maxUsers: 10,
          maxLocations: 1,
          subscriptionPlan: 'Starter',
          subscriptionStatus: 'trial',
        },
      });
    });

    it('should update organization with Professional plan limits', async () => {
      const planTier: PlanTier = 'Professional';

      await service.selectPlan(organizationId, planTier);

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          maxUsers: 50,
          maxLocations: 5,
          subscriptionPlan: 'Professional',
          subscriptionStatus: 'trial',
        },
      });
    });

    it('should update organization with Business plan limits', async () => {
      const planTier: PlanTier = 'Business';

      await service.selectPlan(organizationId, planTier);

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          maxUsers: 200,
          maxLocations: 20,
          subscriptionPlan: 'Business',
          subscriptionStatus: 'trial',
        },
      });
    });

    it('should update organization with Enterprise plan limits', async () => {
      const planTier: PlanTier = 'Enterprise';

      await service.selectPlan(organizationId, planTier);

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          maxUsers: 1000,
          maxLocations: 100,
          subscriptionPlan: 'Enterprise',
          subscriptionStatus: 'trial',
        },
      });
    });

    it('should throw error for invalid plan tier', async () => {
      const invalidPlanTier = 'InvalidPlan' as PlanTier;

      await expect(service.selectPlan(organizationId, invalidPlanTier)).rejects.toThrow(
        'Invalid plan tier: InvalidPlan'
      );

      expect(mockPrismaService.organization.update).not.toHaveBeenCalled();
    });

    it('should set subscriptionStatus to trial for all plans', async () => {
      const planTiers: PlanTier[] = ['Starter', 'Professional', 'Business', 'Enterprise'];

      for (const planTier of planTiers) {
        jest.clearAllMocks();
        await service.selectPlan(organizationId, planTier);

        const updateCall = mockPrismaService.organization.update.mock.calls[0][0];
        expect(updateCall.data.subscriptionStatus).toBe('trial');
      }
    });
  });
});
