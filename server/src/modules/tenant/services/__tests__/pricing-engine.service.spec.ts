import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PricingEngineService } from '../pricing-engine.service';
import { BusinessMetricsService } from '../business-metrics.service';
import { CustomLoggerService } from '../../../logger/logger.service';
import { BusinessProfile, IndustryType, BusinessSize, BusinessType, RevenueRange, TransactionVolumeRange } from '../../entities/business-profile.entity';
import { BusinessTier } from '../../entities/tenant.entity';

describe('PricingEngineService', () => {
  let service: PricingEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingEngineService,
        {
          provide: BusinessMetricsService,
          useValue: {
            calculateBusinessTier: jest.fn(),
            getTierBenefits: jest.fn(),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PricingEngineService>(PricingEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRecommendation', () => {
    it('should recommend MICRO tier for small business', async () => {
      const profile: BusinessProfile = {
        id: 'test-profile',
        businessName: 'Test Business',
        industry: IndustryType.RETAIL,
        businessSize: BusinessSize.SOLO,
        businessType: BusinessType.FREE,
        expectedEmployees: 1,
        expectedLocations: 1,
        expectedRevenueRange: RevenueRange.UNDER_10K,
        expectedTransactionVolumeRange: TransactionVolumeRange.UNDER_100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const recommendation = await service.calculateRecommendation(profile);

      expect(recommendation.recommendedTier).toBe(BusinessTier.MICRO);
      expect(recommendation.confidence).toBeGreaterThan(0.5);
      expect(recommendation.reasoning).toHaveLength(2);
      expect(recommendation.monthlyPrice).toBe(0);
      expect(recommendation.features).toContain('Basic POS System');
    });

    it('should recommend SMALL tier for growing business', async () => {
      const profile: BusinessProfile = {
        id: 'test-profile',
        businessName: 'Growing Business',
        industry: IndustryType.RETAIL,
        businessSize: BusinessSize.SMALL,
        businessType: BusinessType.RETAIL,
        expectedEmployees: 10,
        expectedLocations: 1,
        expectedRevenueRange: RevenueRange.FROM_50K_TO_100K,
        expectedTransactionVolumeRange: TransactionVolumeRange.FROM_500_TO_1K,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const recommendation = await service.calculateRecommendation(profile);

      expect(recommendation.recommendedTier).toBe(BusinessTier.SMALL);
      expect(recommendation.confidence).toBeGreaterThan(0.7);
      expect(recommendation.monthlyPrice).toBe(4900);
      expect(recommendation.features).toContain('Advanced POS System');
    });
  });

  describe('calculateUpgradePrice', () => {
    it('should calculate upgrade price correctly', async () => {
      const result = await service.calculateUpgradePrice(
        BusinessTier.MICRO,
        BusinessTier.SMALL,
        'monthly'
      );

      expect(result.originalPrice).toBe(4900);
      expect(result.finalPrice).toBe(4900);
      expect(result.effectiveDate).toBeInstanceOf(Date);
      expect(result.nextBillingDate).toBeInstanceOf(Date);
    });
  });

  describe('calculateTrialEligibility', () => {
    it('should not allow trial for free tier', async () => {
      const result = await service.calculateTrialEligibility(BusinessTier.MICRO);

      expect(result.isEligible).toBe(false);
      expect(result.trialDays).toBe(0);
      expect(result.reason).toContain('Free tier');
    });

    it('should allow trial for paid tiers', async () => {
      const result = await service.calculateTrialEligibility(BusinessTier.SMALL);

      expect(result.isEligible).toBe(true);
      expect(result.trialDays).toBe(30);
    });
  });

  describe('getAllTierOptions', () => {
    it('should return all tier options sorted by level', () => {
      const options = service.getAllTierOptions();

      expect(options).toHaveLength(4);
      expect(options[0]?.tier).toBe(BusinessTier.MICRO);
      expect(options[1]?.tier).toBe(BusinessTier.SMALL);
      expect(options[2]?.tier).toBe(BusinessTier.MEDIUM);
      expect(options[3]?.tier).toBe(BusinessTier.ENTERPRISE);
    });
  });
});