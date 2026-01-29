import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { BusinessProfileService } from '../services/business-profile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import {
    OnboardingStatusType,
    PlanFeaturesType,
    UpdateOnboardingStepInput,
    CompleteOnboardingInput,
    WorkflowStateType,
    BusinessProfileAnalysisType,
    IndustrySuggestionType,
    InitializeWorkflowInput,
    ValidateStepDataInput,
    ValidationResultType,
    StepConfigurationType,
    IndustrySuggestionsInput,
} from '../types/onboarding.types';
import { BusinessTier } from '../entities/tenant.entity';
import { IndustryType } from '../entities/business-profile.entity';
import { OnboardingStep } from '../services/onboarding.service';
import { PubSubService } from '../../../common/graphql/pubsub.service';

/**
 * Onboarding resolver for managing user onboarding flow
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class OnboardingResolver {
    constructor(
        private readonly onboardingService: OnboardingService,
        private readonly businessProfileService: BusinessProfileService,
        private readonly pubSubService: PubSubService,
    ) { }

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
     * Initialize or resume onboarding workflow
     */
    @Mutation(() => WorkflowStateType, {
        description: 'Initialize or resume onboarding workflow',
    })
    async initializeOnboardingWorkflow(
        @CurrentUser() user: AuthenticatedUser,
        @Args('input', { nullable: true }) input?: InitializeWorkflowInput,
    ): Promise<WorkflowStateType> {
        return this.onboardingService.initializeWorkflow(user.tenantId);
    }

    /**
     * Resume onboarding from where user left off
     */
    @Mutation(() => OnboardingStatusType, {
        description: 'Resume onboarding from where user left off',
    })
    async resumeOnboarding(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<OnboardingStatusType> {
        return this.onboardingService.resumeOnboarding(user.tenantId);
    }

    /**
     * Validate step data without saving
     */
    @Query(() => ValidationResultType, {
        description: 'Validate onboarding step data without saving',
    })
    async validateOnboardingStepData(
        @Args('input') input: ValidateStepDataInput,
    ): Promise<ValidationResultType> {
        const validation = await this.businessProfileService.validateStepData(input.step, input.data);
        return validation;
    }

    /**
     * Get step configuration for UI rendering
     */
    @Query(() => StepConfigurationType, {
        description: 'Get configuration for a specific onboarding step',
    })
    async getStepConfiguration(
        @Args('step', { type: () => OnboardingStep }) step: OnboardingStep,
    ): Promise<StepConfigurationType> {
        const config = this.onboardingService.getStepConfiguration(step);
        if (!config) {
            throw new Error(`Configuration not found for step: ${step}`);
        }
        return config;
    }

    /**
     * Get all step configurations
     */
    @Query(() => [StepConfigurationType], {
        description: 'Get all onboarding step configurations',
    })
    async getAllStepConfigurations(): Promise<StepConfigurationType[]> {
        return this.onboardingService.getAllStepConfigurations();
    }

    /**
     * Get industry suggestions based on query
     */
    @Query(() => [IndustrySuggestionType], {
        description: 'Get industry suggestions based on search query',
    })
    async getIndustrySuggestions(
        @Args('input') input: IndustrySuggestionsInput,
    ): Promise<IndustrySuggestionType[]> {
        return this.businessProfileService.getIndustrySuggestions(input.query)
            .slice(0, input.limit || 10);
    }

    /**
     * Analyze business profile for plan recommendation
     */
    @Query(() => BusinessProfileAnalysisType, {
        description: 'Analyze business profile and get plan recommendation',
    })
    async analyzeBusinessProfile(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<BusinessProfileAnalysisType> {
        return this.businessProfileService.analyzeBusinessProfile(user.tenantId);
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
        const result = await this.onboardingService.updateOnboardingStep(
            user.tenantId,
            step,
            data as any, // GraphQL input types don't preserve exact string literal types
            user.id,
        );

        // Publish progress update for real-time updates
        await this.pubSubService.publish(`onboarding.progress.${user.tenantId}`, {
            onboardingProgressUpdate: result,
            tenantId: user.tenantId,
        });

        // Publish step completion event
        await this.pubSubService.publish(`onboarding.step_completed.${user.tenantId}`, {
            stepCompleted: result,
            tenantId: user.tenantId,
        });

        return result;
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
        const result = await this.onboardingService.completeOnboarding(
            user.tenantId,
            input?.selectedPlan,
            user.id,
        );

        // Publish completion event for real-time updates
        await this.pubSubService.publish(`onboarding.completed.${user.tenantId}`, {
            onboardingCompleted: result,
            tenantId: user.tenantId,
        });

        return result;
    }

    /**
     * Subscribe to onboarding progress updates
     */
    @Subscription(() => OnboardingStatusType, {
        description: 'Subscribe to real-time onboarding progress updates',
    })
    async onboardingProgressUpdates(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.pubSubService.asyncIterator(`onboarding.progress.${user.tenantId}`, user.tenantId);
    }

    /**
     * Subscribe to onboarding completion
     */
    @Subscription(() => OnboardingStatusType, {
        description: 'Subscribe to onboarding completion events',
    })
    async onboardingCompleted(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.pubSubService.asyncIterator(`onboarding.completed.${user.tenantId}`, user.tenantId);
    }

    /**
     * Subscribe to step completion events
     */
    @Subscription(() => OnboardingStatusType, {
        description: 'Subscribe to step completion events',
    })
    async stepCompleted(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.pubSubService.asyncIterator(`onboarding.step_completed.${user.tenantId}`, user.tenantId);
    }
}
