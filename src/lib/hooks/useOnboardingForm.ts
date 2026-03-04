import { useState, useCallback } from 'react';

/**
 * Onboarding form data structure
 */
export interface OnboardingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  
  // Company Information (Step 1)
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  
  // Business Operations (Step 2)
  businessType: string;
  primaryActivities: string[];
  businessStage: string;
  
  // Business Goals (Step 3)
  selectedGoals: string[];
  timeline: string;
  
  // Auto-detected/Default Preferences
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  weeklyReports: boolean;
  marketingUpdates: boolean;
}

/**
 * Initial form data with default values
 */
const initialFormData: OnboardingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  businessType: '',
  primaryActivities: [],
  businessStage: '',
  selectedGoals: [],
  timeline: '',
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  emailNotifications: true,
  weeklyReports: true,
  marketingUpdates: false,
};

/**
 * Hook for managing onboarding form data across multiple steps
 * 
 * @returns Form data, update functions, and validation
 */
export function useOnboardingForm() {
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);

  /**
   * Update a single field in the form data
   */
  const updateField = useCallback((
    field: string,
    value: OnboardingFormData[keyof OnboardingFormData]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  /**
   * Validate step 1 (Company Information)
   */
  const validateStep1 = useCallback((): boolean => {
    return !!(
      formData.companyName &&
      formData.industry &&
      formData.companySize
    );
  }, [formData]);

  /**
   * Validate step 2 (Business Operations)
   */
  const validateStep2 = useCallback((): boolean => {
    return !!(
      formData.businessType &&
      formData.primaryActivities.length > 0 &&
      formData.businessStage
    );
  }, [formData]);

  /**
   * Validate step 3 (Business Goals)
   */
  const validateStep3 = useCallback((): boolean => {
    return formData.selectedGoals.length > 0 && !!formData.timeline;
  }, [formData]);

  /**
   * Validate all steps
   */
  const validateAll = useCallback((): boolean => {
    return validateStep1() && validateStep2() && validateStep3();
  }, [validateStep1, validateStep2, validateStep3]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    validateStep1,
    validateStep2,
    validateStep3,
    validateAll,
  };
}
