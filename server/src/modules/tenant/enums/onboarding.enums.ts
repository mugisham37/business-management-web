/**
 * Onboarding step identifiers
 * 
 * This enum is in a separate file to avoid circular dependencies
 * between onboarding.service.ts, onboarding.types.ts, and validation schemas.
 */
export enum OnboardingStep {
    BUSINESS_PROFILE = 'business_profile',
    BUSINESS_TYPE = 'business_type',
    USAGE_EXPECTATIONS = 'usage_expectations',
    PLAN_SELECTION = 'plan_selection',
    WELCOME = 'welcome',
}

/**
 * Business type for plan recommendation
 * 
 * Note: This is duplicated from business-profile.entity.ts to avoid 
 * circular dependency issues. Keep in sync with the entity definition.
 */
export enum BusinessType {
    FREE = 'free',
    RENEWABLES = 'renewables',
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    INDUSTRY = 'industry',
}
