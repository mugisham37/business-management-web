import { useAuth } from './useAuth';
import { checkPermission, checkAnyPermission, checkAllPermissions } from '@/lib/auth/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    hasPermission: (permission: string) => checkPermission(user, permission),
    hasAnyPermission: (permissions: string[]) => checkAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => checkAllPermissions(user, permissions),
    permissions: user?.role?.permissions?.map(p => p.name) || [],
  };
}
