import { OnboardingFlow } from '@/components/onboarding';

export const metadata = {
    title: 'Welcome | BizManager',
    description: 'Complete your profile setup to get started with BizManager.',
};

export default function OnboardingRoute() {
    return <OnboardingFlow />;
}
