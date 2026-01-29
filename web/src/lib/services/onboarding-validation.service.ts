/**
 * OnboardingValidationService - Step validation and progress tracking
 */

import { OnboardingStep, BusinessType, OnboardingData } from '@/hooks/useOnboarding';

/**
 * Validation rule interface
 */
export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (data: any) => boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * Step configuration
 */
export interface StepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  isRequired: boolean;
  dependsOn?: OnboardingStep[];
  validationRules: ValidationRule[];
  estimatedTime?: number; // in minutes
}

export class OnboardingValidationService {
  private readonly stepConfigs: Map<OnboardingStep, StepConfig> = new Map([
    [OnboardingStep.BUSINESS_PROFILE, {
      id: OnboardingStep.BUSINESS_PROFILE,
      title: 'Business Profile',
      description: 'Tell us about your business',
      isRequired: true,
      estimatedTime: 3,
      validationRules: [
        {
          field: 'businessName',
          type: 'required',
          message: 'Business name is required',
        },
        {
          field: 'businessName',
          type: 'min',
          value: 2,
          message: 'Business name must be at least 2 characters',
        },
        {
          field: 'businessIndustry',
          type: 'required',
          message: 'Please select your business industry',
        },
        {
          field: 'businessSize',
          type: 'required',
          message: 'Please select your business size',
        },
      ],
    }],
    [OnboardingStep.BUSINESS_TYPE, {
      id: OnboardingStep.BUSINESS_TYPE,
      title: 'Business Type',
      description: 'What type of business do you operate?',
      isRequired: true,
      dependsOn: [OnboardingStep.BUSINESS_PROFILE],
      estimatedTime: 2,
      validationRules: [
        {
          field: 'businessType',
          type: 'required',
          message: 'Please select your business type',
        },
        {
          field: 'businessType',
          type: 'custom',
          message: 'Invalid business type selection',
          customValidator: (data) => {
            const validTypes = Object.values(BusinessType);
            return validTypes.includes(data.businessType);
          },
        },
      ],
    }],
    [OnboardingStep.USAGE_EXPECTATIONS, {
      id: OnboardingStep.USAGE_EXPECTATIONS,
      title: 'Usage Expectations',
      description: 'Help us understand your expected usage',
      isRequired: true,
      dependsOn: [OnboardingStep.BUSINESS_TYPE],
      estimatedTime: 4,
      validationRules: [
        {
          field: 'expectedEmployees',
          type: 'required',
          message: 'Please enter expected number of employees',
        },
        {
          field: 'expectedEmployees',
          type: 'min',
          value: 1,
          message: 'Expected employees must be at least 1',
        },
        {
          field: 'expectedEmployees',
          type: 'max',
          value: 10000,
          message: 'Expected employees cannot exceed 10,000',
        },
        {
          field: 'expectedLocations',
          type: 'required',
          message: 'Please enter expected number of locations',
        },
        {
          field: 'expectedLocations',
          type: 'min',
          value: 1,
          message: 'Expected locations must be at least 1',
        },
        {
          field: 'expectedMonthlyTransactions',
          type: 'min',
          value: 0,
          message: 'Expected transactions cannot be negative',
        },
        {
          field: 'expectedMonthlyRevenue',
          type: 'min',
          value: 0,
          message: 'Expected revenue cannot be negative',
        },
        {
          field: 'expectedMonthlyRevenue',
          type: 'custom',
          message: 'Revenue seems unusually high for the business size',
          customValidator: (data) => {
            const { expectedMonthlyRevenue, businessSize } = data;
            if (!expectedMonthlyRevenue || !businessSize) return true;
            
            const maxRevenueBySize = {
              solo: 50000,
              small: 500000,
              medium: 5000000,
              large: 50000000,
              enterprise: Infinity,
            };
            
            return expectedMonthlyRevenue <= maxRevenueBySize[businessSize as keyof typeof maxRevenueBySize];
          },
        },
      ],
    }],
    [OnboardingStep.PLAN_SELECTION, {
      id: OnboardingStep.PLAN_SELECTION,
      title: 'Plan Selection',
      description: 'Choose your subscription plan',
      isRequired: true,
      dependsOn: [OnboardingStep.USAGE_EXPECTATIONS],
      estimatedTime: 3,
      validationRules: [
        {
          field: 'selectedPlan',
          type: 'required',
          message: 'Please select a subscription plan',
        },
      ],
    }],
    [OnboardingStep.WELCOME, {
      id: OnboardingStep.WELCOME,
      title: 'Welcome',
      description: 'Welcome to your new business platform',
      isRequired: false,
      dependsOn: [OnboardingStep.PLAN_SELECTION],
      estimatedTime: 1,
      validationRules: [],
    }],
  ]);

  /**
   * Validate data for a specific step
   */
  validateStep(step: OnboardingStep, data: Partial<OnboardingData>): ValidationResult {
    const config = this.stepConfigs.get(step);
    if (!config) {
      return {
        isValid: false,
        errors: { general: ['Invalid step configuration'] },
      };
    }

    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    for (const rule of config.validationRules) {
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
          } else if (typeof fieldValue === 'string' && fieldValue.length < rule.value) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'max':
          if (typeof fieldValue === 'number' && fieldValue > rule.value) {
            fieldErrors.push(rule.message);
          } else if (typeof fieldValue === 'string' && fieldValue.length > rule.value) {
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
            // Check if this should be a warning instead of error
            if (rule.message.includes('seems') || rule.message.includes('unusual')) {
              if (!warnings[rule.field]) warnings[rule.field] = [];
              warnings[rule.field].push(rule.message);
            } else {
              fieldErrors.push(rule.message);
            }
          }
          break;
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings: Object.keys(warnings).length > 0 ? warnings : undefined,
    };
  }

  /**
   * Check if step dependencies are met
   */
  canAccessStep(step: OnboardingStep, completedSteps: OnboardingStep[]): boolean {
    const config = this.stepConfigs.get(step);
    if (!config) return false;

    if (!config.dependsOn) return true;

    return config.dependsOn.every(dependency => completedSteps.includes(dependency));
  }

  /**
   * Get next available step
   */
  getNextStep(completedSteps: OnboardingStep[]): OnboardingStep | null {
    const allSteps = [
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.BUSINESS_TYPE,
      OnboardingStep.USAGE_EXPECTATIONS,
      OnboardingStep.PLAN_SELECTION,
      OnboardingStep.WELCOME,
    ];

    for (const step of allSteps) {
      if (!completedSteps.includes(step) && this.canAccessStep(step, completedSteps)) {
        return step;
      }
    }

    return null;
  }

  /**
   * Calculate overall progress percentage
   */
  calculateProgress(completedSteps: OnboardingStep[]): number {
    const totalSteps = Array.from(this.stepConfigs.values()).filter(config => config.isRequired).length;
    const completedRequiredSteps = completedSteps.filter(step => {
      const config = this.stepConfigs.get(step);
      return config?.isRequired;
    }).length;

    return Math.round((completedRequiredSteps / totalSteps) * 100);
  }

  /**
   * Estimate remaining time
   */
  estimateRemainingTime(completedSteps: OnboardingStep[]): number {
    let remainingTime = 0;

    for (const [step, config] of this.stepConfigs.entries()) {
      if (!completedSteps.includes(step) && config.isRequired) {
        remainingTime += config.estimatedTime || 2;
      }
    }

    return remainingTime;
  }

  /**
   * Get step configuration
   */
  getStepConfig(step: OnboardingStep): StepConfig | null {
    return this.stepConfigs.get(step) || null;
  }

  /**
   * Get all step configurations
   */
  getAllStepConfigs(): StepConfig[] {
    return Array.from(this.stepConfigs.values());
  }

  /**
   * Validate all collected data for completion
   */
  validateForCompletion(data: OnboardingData): ValidationResult {
    const errors: Record<string, string[]> = {};

    // Check required fields across all steps
    const requiredFields = [
      'businessName',
      'businessIndustry', 
      'businessSize',
      'businessType',
      'expectedEmployees',
      'expectedLocations',
    ];

    for (const field of requiredFields) {
      const value = (data as any)[field];
      if (value === undefined || value === null || value === '') {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} is required for completion`);
      }
    }

    // Validate business logic consistency
    if (data.expectedEmployees && data.businessSize) {
      const employeeRanges = {
        solo: [1, 1],
        small: [2, 10],
        medium: [11, 50],
        large: [51, 200],
        enterprise: [201, Infinity],
      };

      const range = employeeRanges[data.businessSize as keyof typeof employeeRanges];
      if (range && (data.expectedEmployees < range[0] || data.expectedEmployees > range[1])) {
        if (!errors.expectedEmployees) errors.expectedEmployees = [];
        errors.expectedEmployees.push('Employee count doesn\'t match business size');
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Get validation summary for UI display
   */
  getValidationSummary(data: OnboardingData, completedSteps: OnboardingStep[]): {
    totalSteps: number;
    completedSteps: number;
    remainingSteps: number;
    estimatedTime: number;
    canComplete: boolean;
    issues: string[];
  } {
    const totalSteps = this.getAllStepConfigs().filter(config => config.isRequired).length;
    const completedCount = completedSteps.filter(step => {
      const config = this.getStepConfig(step);
      return config?.isRequired;
    }).length;
    const remainingSteps = totalSteps - completedCount;
    const estimatedTime = this.estimateRemainingTime(completedSteps);
    
    const completionValidation = this.validateForCompletion(data);
    const canComplete = completionValidation.isValid && remainingSteps === 0;
    
    const issues: string[] = [];
    for (const [field, fieldErrors] of Object.entries(completionValidation.errors)) {
      issues.push(...fieldErrors);
    }

    return {
      totalSteps,
      completedSteps: completedCount,
      remainingSteps,
      estimatedTime,
      canComplete,
      issues,
    };
  }
}

// Export singleton instance
export const onboardingValidationService = new OnboardingValidationService();
export default onboardingValidationService;