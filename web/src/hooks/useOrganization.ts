import { useAuth } from './useAuth';

export function useOrganization() {
  const { user } = useAuth();

  return {
    organization: user?.organization || null,
    organizationId: user?.organizationId || null,
    isOwner: user?.organization?.ownerId === user?.id,
  };
}
