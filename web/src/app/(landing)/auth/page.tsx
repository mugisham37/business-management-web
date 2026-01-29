import { AuthPage } from '@/components/auth';

export const metadata = {
    title: 'Sign In | BizManager',
    description: 'Sign in to your BizManager account to access your business dashboard.',
};

export default function AuthRoute() {
    return <AuthPage defaultMode="login" redirectTo="/dashboard" />;
}
