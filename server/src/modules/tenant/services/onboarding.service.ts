import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tenants } from '../../database/schema';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessTier, BusinessMetrics } from '../entities/tenant.entity';

/**
 * Onboarding step identifiers
 */
export enum OnboardingStep {
    BUSINESS_PROFILE = 'business_profile',
    BUSINESS_TYPE = 'business_type',
    USAGE_EXPECTATIONS = 'usage_expectations',
    PLAN_SELECTION = 'plan_selection',
    WELCOME = 'welcome',
}

/**
 * Business type categories for plan recommendation
 */
export enum BusinessType {
    FREE = 'free',
    RENEWABLES = 'renewables',
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    INDUSTRY = 'industry',
}

/**
 * Onboarding data collected during the process
 */
export interface OnboardingData {
    // Business Profile
    businessName?: string;
    businessIndustry?: string;
    businessSize?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';

    // Business Type
    businessType?: BusinessType;

    // Usage Expectations
    expectedEmployees?: number;
    expectedLocations?: number;
    expectedMonthlyTransactions?: number;
    expectedMonthlyRevenue?: number;

    // Plan Selection
    selectedPlan?: BusinessTier;
    recommendedPlan?: BusinessTier;
}

/**
 * Onboarding status response
 */
export interface OnboardingStatus {
    tenantId: string;
    completionPercentage: number;
    currentStep: number;
    completedSteps: OnboardingStep[];
    pendingSteps: OnboardingStep[];
    isComplete: boolean;
    onboardingData: OnboardingData;
    recommendedPlan: BusinessTier | null;
    completedAt: Date | null;
}

@Injectable()
export class OnboardingService {
    private readonly allSteps: OnboardingStep[] = [
        OnboardingStep.BUSINESS_PROFILE,
        OnboardingStep.BUSINESS_TYPE,
        OnboardingStep.USAGE_EXPECTATIONS,
        OnboardingStep.PLAN_SELECTION,
        OnboardingStep.WELCOME,
    ];

    constructor(
        private readonly drizzle: DrizzleService,
        private readonly logger: CustomLoggerService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.logger.setContext('OnboardingService');
    }

    /**
     * Get onboarding status for a tenant
     */
    async getOnboardingStatus(tenantId: string): Promise<OnboardingStatus> {
        const [tenant] = await this.drizzle.getDb()
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));

        if (!tenant) {
            throw new NotFoundException(`Tenant ${tenantId} not found`);
        }

        const settings = (tenant.settings || {}) as Record<string, any>;
        const onboardingData = (settings.onboarding || {}) as OnboardingData;
        const completedSteps = (settings.completedOnboardingSteps || []) as OnboardingStep[];
        const isComplete = settings.onboardingComplete === true;
        const completedAt = settings.onboardingCompletedAt ? new Date(settings.onboardingCompletedAt) : null;

        const pendingSteps = this.allSteps.filter(step => !completedSteps.includes(step));
        const currentStep = Math.min(completedSteps.length, this.allSteps.length - 1);
        const completionPercentage = Math.round((completedSteps.length / this.allSteps.length) * 100);

        // Calculate recommended plan based on collected data
        const recommendedPlan = this.calculateRecommendedPlan(onboardingData);

        return {
            tenantId,
            completionPercentage,
            currentStep,
            completedSteps,
            pendingSteps,
            isComplete,
            onboardingData,
            recommendedPlan,
            completedAt,
        };
    }

    /**
     * Update onboarding step with data
     */
    async updateOnboardingStep(
        tenantId: string,
        step: OnboardingStep,
        data: Partial<OnboardingData>,
        updatedBy?: string,
    ): Promise<OnboardingStatus> {
        const [tenant] = await this.drizzle.getDb()
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));

        if (!tenant) {
            throw new NotFoundException(`Tenant ${tenantId} not found`);
        }

        if (!this.allSteps.includes(step)) {
            throw new BadRequestException(`Invalid onboarding step: ${step}`);
        }

        const currentSettings = (tenant.settings || {}) as Record<string, any>;
        const currentOnboardingData = (currentSettings.onboarding || {}) as OnboardingData;
        const currentCompletedSteps = (currentSettings.completedOnboardingSteps || []) as OnboardingStep[];

        // Merge new data with existing
        const updatedOnboardingData: OnboardingData = {
            ...currentOnboardingData,
            ...data,
        };

        // Add step to completed if not already there
        const updatedCompletedSteps = currentCompletedSteps.includes(step)
            ? currentCompletedSteps
            : [...currentCompletedSteps, step];

        // Calculate recommended plan
        const recommendedPlan = this.calculateRecommendedPlan(updatedOnboardingData);
        updatedOnboardingData.recommendedPlan = recommendedPlan;

        // Update tenant settings
        const updatedSettings = {
            ...currentSettings,
            onboarding: updatedOnboardingData,
            completedOnboardingSteps: updatedCompletedSteps,
        };

        await this.drizzle.getDb()
            .update(tenants)
            .set({
                settings: updatedSettings,
                updatedBy,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));

        this.logger.log(`Onboarding step ${step} completed for tenant ${tenantId}`);

        // Emit event
        this.eventEmitter.emit('tenant.onboarding.step_completed', {
            tenantId,
            step,
            data,
            timestamp: new Date(),
        });

        return this.getOnboardingStatus(tenantId);
    }

    /**
     * Complete onboarding and set initial tier
     */
    async completeOnboarding(
        tenantId: string,
        selectedPlan?: BusinessTier,
        completedBy?: string,
    ): Promise<OnboardingStatus> {
        const status = await this.getOnboardingStatus(tenantId);

        // Use selected plan or recommended plan
        const finalPlan = selectedPlan || status.recommendedPlan || BusinessTier.MICRO;

        const [tenant] = await this.drizzle.getDb()
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));

        if (!tenant) {
            throw new NotFoundException(`Tenant ${tenantId} not found`);
        }

        const currentSettings = (tenant.settings || {}) as Record<string, any>;
        const currentOnboardingData = (currentSettings.onboarding || {}) as OnboardingData;

        // Update onboarding data with selected plan
        const updatedOnboardingData: OnboardingData = {
            ...currentOnboardingData,
            selectedPlan: finalPlan,
        };

        // Mark all steps as complete
        const updatedSettings = {
            ...currentSettings,
            onboarding: updatedOnboardingData,
            completedOnboardingSteps: [...this.allSteps],
            onboardingComplete: true,
            onboardingCompletedAt: new Date().toISOString(),
        };

        // Update tenant with new tier based on plan
        const updatedMetrics = this.getInitialMetricsForPlan(finalPlan, status.onboardingData);

        await this.drizzle.getDb()
            .update(tenants)
            .set({
                businessTier: finalPlan,
                settings: updatedSettings,
                metrics: updatedMetrics,
                updatedBy: completedBy,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));

        this.logger.log(`Onboarding completed for tenant ${tenantId} with plan ${finalPlan}`);

        // Emit completion event
        this.eventEmitter.emit('tenant.onboarding.completed', {
            tenantId,
            selectedPlan: finalPlan,
            timestamp: new Date(),
        });

        return this.getOnboardingStatus(tenantId);
    }

    /**
     * Calculate recommended plan based on business profile
     */
    calculateRecommendedPlan(data: OnboardingData): BusinessTier {
        // If business type is explicitly set, use it for recommendation
        if (data.businessType) {
            return this.mapBusinessTypeToTier(data.businessType);
        }

        // Otherwise, calculate based on metrics
        const employees = data.expectedEmployees || 0;
        const locations = data.expectedLocations || 1;
        const transactions = data.expectedMonthlyTransactions || 0;
        const revenue = data.expectedMonthlyRevenue || 0;

        // Enterprise tier: Large operations
        if (employees > 100 || locations > 10 || revenue > 1000000 || transactions > 50000) {
            return BusinessTier.ENTERPRISE;
        }

        // Medium tier: Growing businesses
        if (employees > 25 || locations > 3 || revenue > 100000 || transactions > 10000) {
            return BusinessTier.MEDIUM;
        }

        // Small tier: Small teams
        if (employees > 5 || locations > 1 || revenue > 10000 || transactions > 1000) {
            return BusinessTier.SMALL;
        }

        // Micro tier: Solo/Starter
        return BusinessTier.MICRO;
    }

    /**
     * Map business type to tier
     */
    private mapBusinessTypeToTier(businessType: BusinessType): BusinessTier {
        switch (businessType) {
            case BusinessType.FREE:
                return BusinessTier.MICRO;
            case BusinessType.RENEWABLES:
            case BusinessType.RETAIL:
                return BusinessTier.SMALL;
            case BusinessType.WHOLESALE:
                return BusinessTier.MEDIUM;
            case BusinessType.INDUSTRY:
                return BusinessTier.ENTERPRISE;
            default:
                return BusinessTier.MICRO;
        }
    }

    /**
     * Get initial metrics based on plan and onboarding data
     */
    private getInitialMetricsForPlan(
        plan: BusinessTier,
        data: OnboardingData,
    ): BusinessMetrics {
        return {
            employeeCount: data.expectedEmployees || this.getDefaultEmployeeCount(plan),
            locationCount: data.expectedLocations || this.getDefaultLocationCount(plan),
            monthlyTransactionVolume: data.expectedMonthlyTransactions || 0,
            monthlyRevenue: data.expectedMonthlyRevenue || 0,
        };
    }

    /**
     * Get default employee count for plan
     */
    private getDefaultEmployeeCount(plan: BusinessTier): number {
        switch (plan) {
            case BusinessTier.MICRO:
                return 1;
            case BusinessTier.SMALL:
                return 10;
            case BusinessTier.MEDIUM:
                return 50;
            case BusinessTier.ENTERPRISE:
                return 200;
            default:
                return 1;
        }
    }

    /**
     * Get default location count for plan
     */
    private getDefaultLocationCount(plan: BusinessTier): number {
        switch (plan) {
            case BusinessTier.MICRO:
                return 1;
            case BusinessTier.SMALL:
                return 2;
            case BusinessTier.MEDIUM:
                return 5;
            case BusinessTier.ENTERPRISE:
                return 20;
            default:
                return 1;
        }
    }

    /**
     * Get plan features for comparison
     */
    getPlanFeatures(tier: BusinessTier): {
        name: string;
        description: string;
        features: string[];
        limits: {
            employees: number;
            locations: number;
            transactions: number;
        };
        price: {
            monthly: number;
            annually: number;
        };
    } {
        const planDetails = {
            [BusinessTier.MICRO]: {
                name: 'Free',
                description: 'For individuals and small startups',
                features: [
                    'Basic POS functionality',
                    'Inventory management',
                    'Customer profiles',
                    'Basic reporting',
                    'Community support',
                ],
                limits: { employees: 5, locations: 1, transactions: 1000 },
                price: { monthly: 0, annually: 0 },
            },
            [BusinessTier.SMALL]: {
                name: 'Growth',
                description: 'For growing retail and renewable businesses',
                features: [
                    'All Free features',
                    'Multi-location support',
                    'Advanced inventory',
                    'Loyalty program',
                    'Real-time updates',
                    'API access',
                    'Email support',
                ],
                limits: { employees: 25, locations: 5, transactions: 10000 },
                price: { monthly: 49, annually: 39 },
            },
            [BusinessTier.MEDIUM]: {
                name: 'Business',
                description: 'For wholesale and B2B operations',
                features: [
                    'All Growth features',
                    'B2B operations',
                    'Financial management',
                    'Quote management',
                    'Advanced analytics',
                    'SSO integration',
                    'Priority support',
                ],
                limits: { employees: 100, locations: 20, transactions: 50000 },
                price: { monthly: 99, annually: 79 },
            },
            [BusinessTier.ENTERPRISE]: {
                name: 'Industry',
                description: 'For large scale industrial operations',
                features: [
                    'All Business features',
                    'Custom integrations',
                    'Warehouse management',
                    'Predictive analytics',
                    'Dedicated account manager',
                    '24/7 support',
                    'Custom SLA',
                ],
                limits: { employees: -1, locations: -1, transactions: -1 }, // Unlimited
                price: { monthly: 299, annually: 249 },
            },
        };

        return planDetails[tier];
    }

    /**
     * Get all plans for comparison
     */
    getAllPlans() {
        return [
            this.getPlanFeatures(BusinessTier.MICRO),
            this.getPlanFeatures(BusinessTier.SMALL),
            this.getPlanFeatures(BusinessTier.MEDIUM),
            this.getPlanFeatures(BusinessTier.ENTERPRISE),
        ];
    }
}
