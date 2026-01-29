/**
 * Mobile Permission Guard Component
 * Role and permission-based rendering with mobile-optimized UI
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string | string[];
  requireAll?: boolean;
  fallback?: React.ComponentType<PermissionGuardFallbackProps>;
  loading?: React.ComponentType;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
  resource?: string;
  resourceId?: string;
}

interface PermissionGuardFallbackProps {
  reason?: string;
  requiredPermissions?: string[];
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
  userRole?: string;
}

/**
 * Default loading component
 */
const DefaultLoading: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingSpinner} />
    <Text style={styles.loadingText}>Checking permissions...</Text>
  </View>
);

/**
 * Default fallback component for permission denied
 */
const DefaultFallback: React.FC<PermissionGuardFallbackProps> = ({
  reason,
  requiredPermissions,
  showUpgradePrompt,
  onUpgrade,
  userRole,
}) => {
  return (
    <Card style={styles.fallbackCard}>
      <View style={styles.fallbackHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={32} color="#dc3545" />
        </View>
        <Text style={styles.fallbackTitle}>Access Restricted</Text>
      </View>
      
      <Text style={styles.fallbackMessage}>
        {reason || 'You do not have permission to access this feature.'}
      </Text>
      
      {userRole && (
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Your Role:</Text>
          <Text style={styles.roleValue}>{userRole}</Text>
        </View>
      )}
      
      {requiredPermissions && requiredPermissions.length > 0 && (
        <View style={styles.permissionsContainer}>
          <Text style={styles.permissionsLabel}>Required Permissions:</Text>
          {requiredPermissions.map((permission, index) => (
            <View key={index} style={styles.permissionItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
              <Text style={styles.permissionText}>{permission}</Text>
            </View>
          ))}
        </View>
      )}

      {showUpgradePrompt && onUpgrade && (
        <View style={styles.upgradeContainer}>
          <Text style={styles.upgradeText}>
            Upgrade your account to access this feature
          </Text>
          <Button
            title="Upgrade Now"
            onPress={onUpgrade}
            style={styles.upgradeButton}
            variant="primary"
          />
        </View>
      )}
    </Card>
  );
};

/**
 * Permission Guard Component
 */
export function PermissionGuard({
  children,
  requiredPermissions,
  requireAll = false,
  fallback: FallbackComponent = DefaultFallback,
  loading: LoadingComponent = DefaultLoading,
  showUpgradePrompt = false,
  onUpgrade,
  resource,
  resourceId,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { state, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Show loading state
  if (state.isLoading) {
    return <LoadingComponent />;
  }

  // No permissions required - allow access
  if (!requiredPermissions) {
    return <>{children}</>;
  }

  // Normalize permissions to array
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Check permissions
  let hasAccess = false;
  
  if (resource || resourceId) {
    // Check resource-specific permissions
    hasAccess = permissions.some(permission => 
      hasPermission(permission, resource, resourceId)
    );
  } else {
    // Check general permissions
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Grant access if user has required permissions
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback for denied access
  return (
    <FallbackComponent
      reason={`Access denied. ${requireAll ? 'All' : 'One or more'} of the required permissions are missing.`}
      requiredPermissions={permissions}
      showUpgradePrompt={showUpgradePrompt}
      onUpgrade={onUpgrade}
      userRole={user?.role}
    />
  );
}

/**
 * Role Guard Component
 * Simplified component for role-based access control
 */
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string | string[];
  fallback?: React.ComponentType<PermissionGuardFallbackProps>;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback: FallbackComponent = DefaultFallback,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <FallbackComponent
        reason="You must be logged in to access this feature."
      />
    );
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRole = roles.includes(user.role);

  if (hasRole) {
    return <>{children}</>;
  }

  return (
    <FallbackComponent
      reason={`Access denied. Required role: ${roles.join(' or ')}`}
      userRole={user.role}
    />
  );
}

/**
 * Feature Guard Component
 * Guards based on feature flags and tier access
 */
interface FeatureGuardProps {
  children: React.ReactNode;
  featureId: string;
  fallback?: React.ComponentType<PermissionGuardFallbackProps>;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export function FeatureGuard({
  children,
  featureId,
  fallback: FallbackComponent = DefaultFallback,
  showUpgradePrompt = true,
  onUpgrade,
}: FeatureGuardProps) {
  const { user } = useAuth();
  
  // This would typically check feature flags from user context
  // For now, we'll use a simple check based on user tier
  const hasFeatureAccess = user?.featureFlags?.includes(featureId) || false;

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  return (
    <FallbackComponent
      reason={`This feature is not available in your current plan.`}
      showUpgradePrompt={showUpgradePrompt}
      onUpgrade={onUpgrade}
      userRole={user?.role}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderTopColor: 'transparent',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  fallbackCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    borderWidth: 1,
  },
  fallbackHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    textAlign: 'center',
  },
  fallbackMessage: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  roleLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  permissionsContainer: {
    marginBottom: 16,
  },
  permissionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  upgradeContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderColor: '#ffeaa7',
    borderWidth: 1,
  },
  upgradeText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
  },
});