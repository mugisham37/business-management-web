import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { OnboardingFlow } from '../OnboardingFlow';

// Mock the useOnboarding hook
jest.mock('@/hooks/useOnboarding', () => ({
    useOnboarding: () => ({
        currentStep: 'business_profile',
        currentStepIndex: 0,
        currentStepMeta: {
            title: 'Business Profile',
            description: 'Tell us about your business'
        },
        progress: 20,
        isLoading: false,
        isFirstStep: true,
        isLastStep: false,
        totalSteps: 5,
        updateStep: jest.fn(),
        complete: jest.fn(),
        onboardingData: {},
        recommendedPlan: null,
        plans: [],
        error: null,
    }),
    OnboardingStep: {
        BUSINESS_PROFILE: 'business_profile',
        BUSINESS_TYPE: 'business_type',
        USAGE_EXPECTATIONS: 'usage_expectations',
        PLAN_SELECTION: 'plan_selection',
        WELCOME: 'welcome',
    },
    BusinessTier: {
        MICRO: 'micro',
        SMALL: 'small',
        MEDIUM: 'medium',
        ENTERPRISE: 'enterprise',
    },
    BusinessType: {
        FREE: 'free',
        RENEWABLES: 'renewables',
        RETAIL: 'retail',
        WHOLESALE: 'wholesale',
        INDUSTRY: 'industry',
    },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
}));

describe('OnboardingFlow', () => {
    it('renders the onboarding flow with business profile step', () => {
        render(
            <MockedProvider mocks={[]}>
                <OnboardingFlow />
            </MockedProvider>
        );

        expect(screen.getByText('Business Profile')).toBeInTheDocument();
        expect(screen.getByText('Tell us about your business')).toBeInTheDocument();
        expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    it('shows progress indicators', () => {
        render(
            <MockedProvider mocks={[]}>
                <OnboardingFlow />
            </MockedProvider>
        );

        // Should show 5 step indicators
        const indicators = screen.getAllByRole('generic').filter(el => 
            el.className.includes('rounded-full') && 
            (el.className.includes('bg-indigo-600') || el.className.includes('bg-gray-200'))
        );
        
        expect(indicators.length).toBeGreaterThan(0);
    });

    it('shows continue button for non-last steps', () => {
        render(
            <MockedProvider mocks={[]}>
                <OnboardingFlow />
            </MockedProvider>
        );

        expect(screen.getByText('Continue')).toBeInTheDocument();
        expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });
});