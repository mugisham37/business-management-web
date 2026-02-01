import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tenants } from '../../database/schema';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessTier, BusinessMetrics } from '../entities/tenant.entity';
import { BusinessProfileService } from './business-profile.service';
import { IndustryType, BusinessSize, RevenueRange, TransactionVolumeRange } from '../entities/business-profile.entity';
import { OnboardingStep, BusinessType } from '../enums/onboarding.enums';

// Re-export for backward compatibility
export { OnboardingStep, BusinessType } from '../enums/onboarding.enums';

/**
 * Workflow step configuration
 */
export interface WorkflowStepConfig {
    id: OnboardingStep;
    title: string;
    description: string;
    isRequired: boolean;
    dependsOn?: OnboardingStep[];
    validationRules: ValidationRule[];
    conditionalLogic?: ConditionalLogic;
}

/**
 * Validation rule for step data
 */
export interface ValidationRule {
    field: string;
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
    customValidator?: (data: any) => boolean;
}

/**
 * Conditional logic for step visibility/requirements
 */
export interface ConditionalLogic {
    condition: (data: OnboardingData) => boolean;
    action: 'show' | 'hide' | 'require' | 'optional';
}

/**
 * Workflow state for tracking progress
 */
export interface WorkflowState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    availableSteps: OnboardingStep[];
    canProceed: boolean;
    validationErrors: Record<string, string[]>;
    lastUpdated: Date;
    sessionId: string;
}

/**
 * Onboarding data collected during the process
 */
export interface OnboardingData {
    // Business Profile
    businessName?: string;
    businessIndustry?: IndustryType;
    businessSize?: BusinessSize;

    // Business Type
    businessType?: BusinessType;

    // Usage Expectations
    expectedEmployees?: number;
    expectedLocations?: number;
    expectedRevenueRange?: RevenueRange;
    expectedTransactionVolumeRange?: TransactionVolumeRange;
    expectedMonthlyTransactions?: number;
    expectedMonthlyRevenue?: number;

    // Plan Selection
    selectedPlan?: BusinessTier;
    recommendedPlan?: BusinessTier;

    // Additional fields
    description?: string;
    website?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    currentSoftware?: string[];
    businessGoals?: string[];
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
    workflowState: WorkflowState;
    canResume: boolean;
    sessionId: string;
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

    private readonly workflowConfig: Map<OnboardingStep, WorkflowStepConfig> = new Map([
        [OnboardingStep.BUSINESS_PROFILE, {
            id: OnboardingStep.BUSINESS_PROFILE,
            title: 'Business Profile',
            description: 'Tell us about your business',
            isRequired: true,
            validationRules: [
                { field: 'businessName', type: 'required', message: 'Business name is required' },
                { field: 'businessIndustry', type: 'required', message: 'Business industry is required' },
                { field: 'businessSize', type: 'required', message: 'Business size is required' },
            ],
        }],
        [OnboardingStep.BUSINESS_TYPE, {
            id: OnboardingStep.BUSINESS_TYPE,
            title: 'Business Type',
            description: 'What type of business do you operate?',
            isRequired: true,
            dependsOn: [OnboardingStep.BUSINESS_PROFILE],
            validationRules: [
                { field: 'businessType', type: 'required', message: 'Business type is required' },
            ],
        }],
        [OnboardingStep.USAGE_EXPECTATIONS, {
            id: OnboardingStep.USAGE_EXPECTATIONS,
            title: 'Usage Expectations',
            description: 'Help us understand your expected usage',
            isRequired: true,
            dependsOn: [OnboardingStep.BUSINESS_TYPE],
            validationRules: [
                { field: 'expectedEmployees', type: 'min', value: 1, message: 'Expected employees must be at least 1' },
                { field: 'expectedLocations', type: 'min', value: 1, message: 'Expected locations must be at least 1' },
                { field: 'expectedMonthlyTransactions', type: 'min', value: 0, message: 'Expected transactions cannot be negative' },
                { field: 'expectedMonthlyRevenue', type: 'min', value: 0, message: 'Expected revenue cannot be negative' },
            ],
        }],
        [OnboardingStep.PLAN_SELECTION, {
            id: OnboardingStep.PLAN_SELECTION,
            title: 'Plan Selection',
            description: 'Choose your subscription plan',
            isRequired: true,
            dependsOn: [OnboardingStep.USAGE_EXPECTATIONS],
            validationRules: [
                { field: 'selectedPlan', type: 'required', message: 'Plan selection is required' },
            ],
        }],
        [OnboardingStep.WELCOME, {
            id: OnboardingStep.WELCOME,
            title: 'Welcome',
            description: 'Welcome to your new business platform',
            isRequired: false,
            dependsOn: [OnboardingStep.PLAN_SELECTION],
            validationRules: [],
        }],
    ]);

    constructor(
        private readonly drizzle: DrizzleService,
        private readonly logger: CustomLoggerService,
        private readonly eventEmitter: EventEmitter2,
        private readonly businessProfileService: BusinessProfileService,
    ) {
        this.logger.setContext('OnboardingService');
    }

    /**
     * Initialize or resume onboarding workflow
     */
    async initializeWorkflow(tenantId: string): Promise<WorkflowState> {
        const status = await this.getOnboardingStatus(tenantId);
        const sessionId = this.generateSessionId();
        
        const workflowState: WorkflowState = {
            currentStep: this.determineCurrentStep(status.completedSteps),
            completedSteps: status.completedSteps,
            availableSteps: this.getAvailableSteps(status.completedSteps, status.onboardingData),
            canProceed: this.canProceedToNextStep(status.completedSteps, status.onboardingData),
            validationErrors: {},
            lastUpdated: new Date(),
            sessionId,
        };

        // Save workflow state
        await this.saveWorkflowState(tenantId, workflowState);
        
        this.logger.log(`Workflow initialized for tenant ${tenantId} with session ${sessionId}`);
        
        return workflowState;
    }

    /**
     * Validate step data against configured rules
     */
    async validateStepData(step: OnboardingStep, data: Partial<OnboardingData>): Promise<Record<string, string[]>> {
        const stepConfig = this.workflowConfig.get(step);
        if (!stepConfig) {
            throw new BadRequestException(`Invalid step: ${step}`);
        }

        // Use business profile service for comprehensive validation
        const validation = await this.businessProfileService.validateStepData(step, data);
        
        if (!validation.isValid) {
            return validation.errors;
        }

        // Additional workflow-specific validation
        const errors: Record<string, string[]> = {};

        for (const rule of stepConfig.validationRules) {
            const fieldValue = (data as any)[rule.field];
            const fieldErrors: string[] = [];

            switch (rule.type) {
                case 'required':
                    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                        fieldErrors.push(rule.message);
                    }
                    break;
                case 'min':
                    if (typeof fieldValue === 'number' && fieldValue < rule.value) {
                        fieldErrors.push(rule.message);
                    }
                    break;
                case 'max':
                    if (typeof fieldValue === 'number' && fieldValue > rule.value) {
                        fieldErrors.push(rule.message);
                    }
                    break;
                case 'pattern':
                    if (typeof fieldValue === 'string' && !new RegExp(rule.value).test(fieldValue)) {
                        fieldErrors.push(rule.message);
                    }
                    break;
                case 'custom':
                    if (rule.customValidator && !rule.customValidator(data)) {
                        fieldErrors.push(rule.message);
                    }
                    break;
            }

            if (fieldErrors.length > 0) {
                errors[rule.field] = fieldErrors;
            }
        }

        return errors;
    }

    /**
     * Check if user can proceed to next step
     */
    canProceedToNextStep(completedSteps: OnboardingStep[], data: OnboardingData): boolean {
        const currentStepIndex = completedSteps.length;
        if (currentStepIndex >= this.allSteps.length) {
            return false; // Already completed
        }

        const currentStep = this.allSteps[currentStepIndex];
        if (!currentStep) {
            return false; // No more steps
        }

        const stepConfig = this.workflowConfig.get(currentStep);
        
        if (!stepConfig) {
            return false;
        }

        // Check dependencies
        if (stepConfig.dependsOn) {
            for (const dependency of stepConfig.dependsOn) {
                if (!completedSteps.includes(dependency)) {
                    return false;
                }
            }
        }

        // Check conditional logic
        if (stepConfig.conditionalLogic) {
            const conditionResult = stepConfig.conditionalLogic.condition(data);
            if (stepConfig.conditionalLogic.action === 'hide' && conditionResult) {
                return true; // Skip this step
            }
            if (stepConfig.conditionalLogic.action === 'show' && !conditionResult) {
                return false; // Cannot proceed
            }
        }

        return true;
    }

    /**
     * Get available steps based on current progress and conditional logic
     */
    getAvailableSteps(completedSteps: OnboardingStep[], data: OnboardingData): OnboardingStep[] {
        const availableSteps: OnboardingStep[] = [];

        for (const step of this.allSteps) {
            if (completedSteps.includes(step)) {
                continue; // Already completed
            }

            const stepConfig = this.workflowConfig.get(step);
            if (!stepConfig) {
                continue;
            }

            // Check dependencies
            let dependenciesMet = true;
            if (stepConfig.dependsOn) {
                for (const dependency of stepConfig.dependsOn) {
                    if (!completedSteps.includes(dependency)) {
                        dependenciesMet = false;
                        break;
                    }
                }
            }

            if (!dependenciesMet) {
                continue;
            }

            // Check conditional logic
            if (stepConfig.conditionalLogic) {
                const conditionResult = stepConfig.conditionalLogic.condition(data);
                if (stepConfig.conditionalLogic.action === 'hide' && conditionResult) {
                    continue; // Skip this step
                }
                if (stepConfig.conditionalLogic.action === 'show' && !conditionResult) {
                    continue; // Not available yet
                }
            }

            availableSteps.push(step);
        }

        return availableSteps;
    }

    /**
     * Determine current step based on completed steps
     */
    determineCurrentStep(completedSteps: OnboardingStep[]): OnboardingStep {
        for (const step of this.allSteps) {
            if (!completedSteps.includes(step)) {
                return step;
            }
        }
        return OnboardingStep.WELCOME; // All steps completed
    }

    /**
     * Save workflow state to database
     */
    private async saveWorkflowState(tenantId: string, workflowState: WorkflowState): Promise<void> {
        const [tenant] = await this.drizzle.getDb()
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));

        if (!tenant) {
            throw new NotFoundException(`Tenant ${tenantId} not found`);
        }

        const currentSettings = (tenant.settings || {}) as Record<string, any>;
        const updatedSettings = {
            ...currentSettings,
            workflowState,
        };

        await this.drizzle.getDb()
            .update(tenants)
            .set({
                settings: updatedSettings,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));
    }

    /**
     * Load workflow state from database
     */
    private async loadWorkflowState(tenantId: string): Promise<WorkflowState | null> {
        const [tenant] = await this.drizzle.getDb()
            .select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));

        if (!tenant) {
            return null;
        }

        const settings = (tenant.settings || {}) as Record<string, any>;
        return settings.workflowState || null;
    }

    /**
     * Generate unique session ID for workflow tracking
     */
    private generateSessionId(): string {
        return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

        // Load or create workflow state
        let workflowState = await this.loadWorkflowState(tenantId);
        if (!workflowState) {
            workflowState = {
                currentStep: this.determineCurrentStep(completedSteps),
                completedSteps,
                availableSteps: this.getAvailableSteps(completedSteps, onboardingData),
                canProceed: this.canProceedToNextStep(completedSteps, onboardingData),
                validationErrors: {},
                lastUpdated: new Date(),
                sessionId: this.generateSessionId(),
            };
            await this.saveWorkflowState(tenantId, workflowState);
        }

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
            workflowState,
            canResume: !isComplete && completedSteps.length > 0,
            sessionId: workflowState.sessionId,
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

        // Validate step data
        const validationErrors = await this.validateStepData(step, data);
        if (Object.keys(validationErrors).length > 0) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: validationErrors,
            });
        }

        const currentSettings = (tenant.settings || {}) as Record<string, any>;
        const currentOnboardingData = (currentSettings.onboarding || {}) as OnboardingData;
        const currentCompletedSteps = (currentSettings.completedOnboardingSteps || []) as OnboardingStep[];

        // Check if step can be completed based on workflow rules
        const availableSteps = this.getAvailableSteps(currentCompletedSteps, currentOnboardingData);
        if (!availableSteps.includes(step) && !currentCompletedSteps.includes(step)) {
            throw new BadRequestException(`Step ${step} is not available at this time`);
        }

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

        // Update workflow state
        const workflowState: WorkflowState = {
            currentStep: this.determineCurrentStep(updatedCompletedSteps),
            completedSteps: updatedCompletedSteps,
            availableSteps: this.getAvailableSteps(updatedCompletedSteps, updatedOnboardingData),
            canProceed: this.canProceedToNextStep(updatedCompletedSteps, updatedOnboardingData),
            validationErrors: {},
            lastUpdated: new Date(),
            sessionId: currentSettings.workflowState?.sessionId || this.generateSessionId(),
        };

        // Update tenant settings
        const updatedSettings = {
            ...currentSettings,
            onboarding: updatedOnboardingData,
            completedOnboardingSteps: updatedCompletedSteps,
            workflowState,
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
            workflowState,
            timestamp: new Date(),
        });

        return this.getOnboardingStatus(tenantId);
    }

    /**
     * Resume onboarding from where user left off
     */
    async resumeOnboarding(tenantId: string): Promise<OnboardingStatus> {
        const status = await this.getOnboardingStatus(tenantId);
        
        if (status.isComplete) {
            throw new BadRequestException('Onboarding is already complete');
        }

        // Initialize workflow if not already done
        if (!status.workflowState.sessionId) {
            await this.initializeWorkflow(tenantId);
        }

        this.logger.log(`Onboarding resumed for tenant ${tenantId}`);

        // Emit event
        this.eventEmitter.emit('tenant.onboarding.resumed', {
            tenantId,
            currentStep: status.workflowState.currentStep,
            completedSteps: status.completedSteps,
            timestamp: new Date(),
        });

        return this.getOnboardingStatus(tenantId);
    }

    /**
     * Get step configuration for validation and UI rendering
     */
    getStepConfiguration(step: OnboardingStep): WorkflowStepConfig | null {
        return this.workflowConfig.get(step) || null;
    }

    /**
     * Get all step configurations
     */
    getAllStepConfigurations(): WorkflowStepConfig[] {
        return Array.from(this.workflowConfig.values());
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
