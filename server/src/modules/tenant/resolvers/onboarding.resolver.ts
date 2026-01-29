import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import {
    OnboardingStatusType,
    PlanFeaturesType,
    UpdateOnboardingStepInput,
    CompleteOnboardingInput,
} from '../types/onboarding.types';
import { BusinessTier } from '../entities/tenant.entity';

/**
 * Onboarding resolver for managing user onboarding flow
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class OnboardingResolver {
    constructor(private readonly onboardingService: OnboardingService) { }

    /**
     * Get current onboarding status for the authenticated user's tenant
     */
    @Query(() => OnboardingStatusType, {
        description: 'Get onboarding status for current tenant',
    })
    async myOnboardingStatus(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<OnboardingStatusType> {
        return this.onboardingService.getOnboardingStatus(user.tenantId);
    }

    /**
     * Get all available plans for comparison
     */
    @Query(() => [PlanFeaturesType], {
        description: 'Get all available subscription plans',
    })
    async availablePlans(): Promise<PlanFeaturesType[]> {
        return this.onboardingService.getAllPlans();
    }

    /**
     * Get features for a specific plan
     */
    @Query(() => PlanFeaturesType, {
        description: 'Get features for a specific plan',
    })
    async planFeatures(
        @Args('tier', { type: () => BusinessTier }) tier: BusinessTier,
    ): Promise<PlanFeaturesType> {
        return this.onboardingService.getPlanFeatures(tier);
    }

    /**
     * Update onboarding step with data
     */
    @Mutation(() => OnboardingStatusType, {
        description: 'Update onboarding step with collected data',
    })
    async updateOnboardingStep(
        @CurrentUser() user: AuthenticatedUser,
        @Args('input') input: UpdateOnboardingStepInput,
    ): Promise<OnboardingStatusType> {
        const { step, ...data } = input;
        return this.onboardingService.updateOnboardingStep(
            user.tenantId,
            step,
            data as any, // GraphQL input types don't preserve exact string literal types
            user.id,
        );
    }

    /**
     * Complete onboarding with optional plan selection
     */
    @Mutation(() => OnboardingStatusType, {
        description: 'Complete onboarding and finalize plan selection',
    })
    async completeOnboarding(
        @CurrentUser() user: AuthenticatedUser,
        @Args('input', { nullable: true }) input?: CompleteOnboardingInput,
    ): Promise<OnboardingStatusType> {
        return this.onboardingService.completeOnboarding(
            user.tenantId,
            input?.selectedPlan,
            user.id,
        );
    }
}
