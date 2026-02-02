import { AuthPage } from '@/components/auth';

export const metadata = {
    title: 'Sign In | Fizz Database',
    description: 'Sign in to your Fizz Database account to access your business dashboard.',
};

export default function AuthRoute() {
    return <AuthPage defaultMode="login" redirectTo="/dashboard" />;
}