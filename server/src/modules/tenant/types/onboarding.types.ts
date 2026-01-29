import { ObjectType, Field, Int, ID, InputType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { BusinessTier } from '../entities/tenant.entity';
import { OnboardingStep, BusinessType } from '../services/onboarding.service';
import { IndustryType, BusinessSize, RevenueRange, TransactionVolumeRange } from '../entities/business-profile.entity';

// Register enums for GraphQL
registerEnumType(OnboardingStep, {
    name: 'OnboardingStep',
    description: 'Onboarding step identifiers',
});

registerEnumType(BusinessType, {
    name: 'BusinessType',
    description: 'Business type categories for plan recommendation',
});

/**
 * Onboarding data type
 */
@ObjectType()
export class OnboardingDataType {
    @Field({ nullable: true })
    businessName?: string;

    @Field(() => IndustryType, { nullable: true })
    businessIndustry?: IndustryType;

    @Field(() => BusinessSize, { nullable: true })
    businessSize?: BusinessSize;

    @Field(() => BusinessType, { nullable: true })
    businessType?: BusinessType;

    @Field(() => Int, { nullable: true })
    expectedEmployees?: number;

    @Field(() => Int, { nullable: true })
    expectedLocations?: number;

    @Field(() => RevenueRange, { nullable: true })
    expectedRevenueRange?: RevenueRange;

    @Field(() => TransactionVolumeRange, { nullable: true })
    expectedTransactionVolumeRange?: TransactionVolumeRange;

    @Field(() => Int, { nullable: true })
    expectedMonthlyTransactions?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyRevenue?: number;

    @Field(() => BusinessTier, { nullable: true })
    selectedPlan?: BusinessTier;

    @Field(() => BusinessTier, { nullable: true })
    recommendedPlan?: BusinessTier;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    website?: string;

    @Field({ nullable: true })
    phoneNumber?: string;

    @Field({ nullable: true })
    address?: string;

    @Field({ nullable: true })
    city?: string;

    @Field({ nullable: true })
    state?: string;

    @Field({ nullable: true })
    country?: string;

    @Field({ nullable: true })
    postalCode?: string;

    @Field(() => [String], { nullable: true })
    currentSoftware?: string[];

    @Field(() => [String], { nullable: true })
    businessGoals?: string[];
}

/**
 * Onboarding status response type
 */
@ObjectType()
export class OnboardingStatusType {
    @Field(() => ID)
    tenantId!: string;

    @Field(() => Int)
    completionPercentage!: number;

    @Field(() => Int)
    currentStep!: number;

    @Field(() => [OnboardingStep])
    completedSteps!: OnboardingStep[];

    @Field(() => [OnboardingStep])
    pendingSteps!: OnboardingStep[];

    @Field()
    isComplete!: boolean;

    @Field(() => OnboardingDataType)
    onboardingData!: OnboardingDataType;

    @Field(() => BusinessTier, { nullable: true })
    recommendedPlan!: BusinessTier | null;

    @Field({ nullable: true })
    completedAt!: Date | null;

    @Field(() => WorkflowStateType)
    workflowState!: WorkflowStateType;

    @Field()
    canResume!: boolean;

    @Field()
    sessionId!: string;
}

/**
 * Plan limits type
 */
@ObjectType()
export class PlanLimitsType {
    @Field(() => Int)
    employees!: number;

    @Field(() => Int)
    locations!: number;

    @Field(() => Int)
    transactions!: number;
}

/**
 * Plan pricing type
 */
@ObjectType()
export class PlanPricingType {
    @Field(() => Int)
    monthly!: number;

    @Field(() => Int)
    annually!: number;
}

/**
 * Plan features response type
 */
@ObjectType()
export class PlanFeaturesType {
    @Field()
    name!: string;

    @Field()
    description!: string;

    @Field(() => [String])
    features!: string[];

    @Field(() => PlanLimitsType)
    limits!: PlanLimitsType;

    @Field(() => PlanPricingType)
    price!: PlanPricingType;
}

/**
 * Input for updating onboarding step
 */
@InputType()
export class UpdateOnboardingStepInput {
    @Field(() => OnboardingStep)
    step!: OnboardingStep;

    @Field({ nullable: true })
    businessName?: string;

    @Field(() => IndustryType, { nullable: true })
    businessIndustry?: IndustryType;

    @Field(() => BusinessSize, { nullable: true })
    businessSize?: BusinessSize;

    @Field(() => BusinessType, { nullable: true })
    businessType?: BusinessType;

    @Field(() => Int, { nullable: true })
    expectedEmployees?: number;

    @Field(() => Int, { nullable: true })
    expectedLocations?: number;

    @Field(() => RevenueRange, { nullable: true })
    expectedRevenueRange?: RevenueRange;

    @Field(() => TransactionVolumeRange, { nullable: true })
    expectedTransactionVolumeRange?: TransactionVolumeRange;

    @Field(() => Int, { nullable: true })
    expectedMonthlyTransactions?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyRevenue?: number;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    website?: string;

    @Field({ nullable: true })
    phoneNumber?: string;

    @Field({ nullable: true })
    address?: string;

    @Field({ nullable: true })
    city?: string;

    @Field({ nullable: true })
    state?: string;

    @Field({ nullable: true })
    country?: string;

    @Field({ nullable: true })
    postalCode?: string;

    @Field(() => [String], { nullable: true })
    currentSoftware?: string[];

    @Field(() => [String], { nullable: true })
    businessGoals?: string[];
}

/**
 * Workflow state type
 */
@ObjectType()
export class WorkflowStateType {
    @Field(() => OnboardingStep)
    currentStep!: OnboardingStep;

    @Field(() => [OnboardingStep])
    completedSteps!: OnboardingStep[];

    @Field(() => [OnboardingStep])
    availableSteps!: OnboardingStep[];

    @Field()
    canProceed!: boolean;

    @Field(() => GraphQLJSON)
    validationErrors!: Record<string, string[]>;

    @Field()
    lastUpdated!: Date;

    @Field()
    sessionId!: string;
}

/**
 * Business profile analysis type
 */
@ObjectType()
export class BusinessProfileAnalysisType {
    @Field(() => BusinessTier)
    recommendedTier!: BusinessTier;

    @Field()
    confidence!: number;

    @Field(() => [String])
    reasoning!: string[];

    @Field(() => [TierAlternativeType])
    alternatives!: TierAlternativeType[];
}

/**
 * Tier alternative type
 */
@ObjectType()
export class TierAlternativeType {
    @Field(() => BusinessTier)
    tier!: BusinessTier;

    @Field()
    reason!: string;
}

/**
 * Industry suggestion type
 */
@ObjectType()
export class IndustrySuggestionType {
    @Field(() => IndustryType)
    value!: IndustryType;

    @Field()
    label!: string;

    @Field()
    confidence!: number;
}

/**
 * Step configuration type
 */
@ObjectType()
export class StepConfigurationType {
    @Field(() => OnboardingStep)
    id!: OnboardingStep;

    @Field()
    title!: string;

    @Field()
    description!: string;

    @Field()
    isRequired!: boolean;

    @Field(() => [OnboardingStep], { nullable: true })
    dependsOn?: OnboardingStep[];

    @Field(() => [ValidationRuleType])
    validationRules!: ValidationRuleType[];
}

/**
 * Validation rule type
 */
@ObjectType()
export class ValidationRuleType {
    @Field()
    field!: string;

    @Field()
    type!: string;

    @Field({ nullable: true })
    value?: string;

    @Field()
    message!: string;
}
/**
 * Input for completing onboarding
 */
@InputType()
export class CompleteOnboardingInput {
    @Field(() => BusinessTier, { nullable: true })
    selectedPlan?: BusinessTier;
}

/**
 * Input for initializing workflow
 */
@InputType()
export class InitializeWorkflowInput {
    @Field({ nullable: true })
    resumeSession?: string;
}

/**
 * Input for validating step data
 */
@InputType()
export class ValidateStepDataInput {
    @Field(() => OnboardingStep)
    step!: OnboardingStep;

    @Field(() => GraphQLJSON)
    data!: any;
}

/**
 * Input for industry suggestions
 */
@InputType()
export class IndustrySuggestionsInput {
    @Field()
    query!: string;

    @Field(() => Int, { nullable: true, defaultValue: 10 })
    limit?: number;
}

/**
 * Validation result type
 */
@ObjectType()
export class ValidationResultType {
    @Field()
    isValid!: boolean;

    @Field(() => GraphQLJSON)
    errors!: Record<string, string[]>;
}