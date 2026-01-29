import { ObjectType, Field, Int, ID, InputType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { BusinessTier } from '../entities/tenant.entity';
import { OnboardingStep, BusinessType } from '../services/onboarding.service';

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

    @Field({ nullable: true })
    businessIndustry?: string;

    @Field({ nullable: true })
    businessSize?: string;

    @Field(() => BusinessType, { nullable: true })
    businessType?: BusinessType;

    @Field(() => Int, { nullable: true })
    expectedEmployees?: number;

    @Field(() => Int, { nullable: true })
    expectedLocations?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyTransactions?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyRevenue?: number;

    @Field(() => BusinessTier, { nullable: true })
    selectedPlan?: BusinessTier;

    @Field(() => BusinessTier, { nullable: true })
    recommendedPlan?: BusinessTier;
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

    @Field({ nullable: true })
    businessIndustry?: string;

    @Field({ nullable: true })
    businessSize?: string;

    @Field(() => BusinessType, { nullable: true })
    businessType?: BusinessType;

    @Field(() => Int, { nullable: true })
    expectedEmployees?: number;

    @Field(() => Int, { nullable: true })
    expectedLocations?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyTransactions?: number;

    @Field(() => Int, { nullable: true })
    expectedMonthlyRevenue?: number;
}

/**
 * Input for completing onboarding
 */
@InputType()
export class CompleteOnboardingInput {
    @Field(() => BusinessTier, { nullable: true })
    selectedPlan?: BusinessTier;
}
