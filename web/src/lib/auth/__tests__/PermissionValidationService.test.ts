/**
 * Permission Validation Service Tests
 * Tests for comprehensive permission validation system
 * Requirements: 10.3, 10.4, 10.5
 */

import { PermissionValidationService } from '../PermissionValidationService';
import { BusinessTier } from '@/hooks/useTierAccess';
import { permissionsManager } from '../permissions-manager';
import { GraphQLIntegrationService } from '../GraphQLIntegrationService';

// Mock dependencies
jest.mock('../permissions-manager');
jest.mock('../GraphQLIntegrationService');
jest.mock('@/lib/apollo/client');

const mockPermissionsManager = permissionsManager as jest.Mocked<typeof permissionsManager>;
const mockGraphQLService = GraphQLIntegrationService as jest.MockedClass<typeof GraphQLIntegrationService>;

describe('PermissionValidationService', () => {
  let service: PermissionValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PermissionValidationService();
  });

  describe('Feature Access Validation', () => {
    it('should grant access when user has required permissions and tier', async () => {
      // Mock user permissions and tier
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['dashboard:view']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('dashboard');

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny access when user lacks required permissions', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['pos:access']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('dashboard');

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain('Missing required permissions');
      expect(result.requiredPermissions).toEqual(['dashboard:view']);
    });

    it('should deny access when user tier is insufficient', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['crm:access']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('crm');

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain('Requires small tier or higher');
      expect(result.requiredTier).toBe(BusinessTier.SMALL);
    });

    it('should use fallback permissions when primary permissions are missing', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['customer:view']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.SMALL }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('crm');

      expect(result.hasAccess).toBe(true);
      expect(result.conflictResolution).toBeDefined();
      expect(result.conflictResolution?.resolvedBy).toBe('permission');
    });

    it('should handle wildcard permissions correctly', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['dashboard:*']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('dashboard');

      expect(result.hasAccess).toBe(true);
    });
  });

  describe('GraphQL Operation Validation', () => {
    it('should allow public operations without authentication', async () => {
      const result = await service.validateGraphQLOperation('login');

      expect(result.hasAccess).toBe(true);
    });

    it('should validate permissions for protected operations', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['permission:view_self']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateGraphQLOperation('getMyPermissions');

      expect(result.hasAccess).toBe(true);
    });

    it('should deny access for operations requiring higher tier', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['permission:grant']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.SMALL }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateGraphQLOperation('grantPermission');

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain('requires medium tier or higher');
    });

    it('should allow unknown operations by default', async () => {
      const result = await service.validateGraphQLOperation('unknownOperation');

      expect(result.hasAccess).toBe(true);
    });
  });

  describe('Permission Conflict Resolution', () => {
    it('should resolve conflicts through tier hierarchy', async () => {
      mockPermissionsManager.getPermissions.mockResolvedValue(['basic:permission']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.ENTERPRISE }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.resolvePermissionConflict(
        'user123',
        ['advanced:feature'],
        'access advanced feature'
      );

      expect(result.hasAccess).toBe(true);
      expect(result.conflictResolution?.resolvedBy).toBe('tier');
    });

    it('should resolve conflicts through wildcard permissions', async () => {
      mockPermissionsManager.getPermissions.mockResolvedValue(['reports:*']);
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.SMALL }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.resolvePermissionConflict(
        'user123',
        ['reports:advanced'],
        'access advanced reports'
      );

      expect(result.hasAccess).toBe(true);
      expect(result.conflictResolution?.resolvedBy).toBe('permission');
    });

    it('should resolve conflicts through inherited permissions', async () => {
      mockPermissionsManager.getPermissions.mockResolvedValue(['basic:permission']);
      mockPermissionsManager.getDetailedPermissions.mockResolvedValue({
        permissions: ['inherited:permission'],
        role: 'admin',
        detailedPermissions: [
          {
            id: '1',
            userId: 'user123',
            permission: 'inherited:permission',
            grantedBy: 'system',
            grantedAt: new Date(),
            isInherited: true,
          },
        ],
        includesInherited: true,
      });
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.SMALL }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.resolvePermissionConflict(
        'user123',
        ['inherited:permission'],
        'access inherited feature'
      );

      expect(result.hasAccess).toBe(true);
      expect(result.conflictResolution?.resolvedBy).toBe('hierarchy');
    });

    it('should fail to resolve unresolvable conflicts', async () => {
      mockPermissionsManager.getPermissions.mockResolvedValue(['basic:permission']);
      mockPermissionsManager.getDetailedPermissions.mockResolvedValue({
        permissions: ['basic:permission'],
        role: 'user',
        detailedPermissions: [],
        includesInherited: false,
      });
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.resolvePermissionConflict(
        'user123',
        ['admin:permission'],
        'access admin feature'
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain('Cannot resolve permission conflict');
    });
  });

  describe('Tier Hierarchy', () => {
    it('should correctly compare tier levels', async () => {
      // Test tier hierarchy through feature access
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['analytics:advanced']);
      
      // Test with insufficient tier
      let mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.SMALL }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };
      
      let result = await service.validateFeatureAccess('advanced_analytics');
      expect(result.hasAccess).toBe(false);
      
      // Clear cache to ensure fresh tier fetch
      service.clearCache();
      
      // Test with sufficient tier
      mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MEDIUM }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };
      
      result = await service.validateFeatureAccess('advanced_analytics');
      expect(result.hasAccess).toBe(true);
    });
  });

  describe('Caching', () => {
    it('should cache user tier information', async () => {
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MEDIUM }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['dashboard:view']);

      // First call
      await service.validateFeatureAccess('dashboard');
      expect(mockGetMyTier).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.validateFeatureAccess('dashboard');
      expect(mockGetMyTier).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', async () => {
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MEDIUM }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['dashboard:view']);

      // First call
      await service.validateFeatureAccess('dashboard');
      expect(mockGetMyTier).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Second call should fetch again
      await service.validateFeatureAccess('dashboard');
      expect(mockGetMyTier).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration Management', () => {
    it('should allow adding custom feature permissions', () => {
      const customFeature = {
        featureId: 'custom_feature',
        requiredPermissions: ['custom:access'],
        requiredTier: BusinessTier.ENTERPRISE,
      };

      service.addFeaturePermission(customFeature);
      const config = service.getFeatureConfig('custom_feature');

      expect(config).toEqual(customFeature);
    });

    it('should allow adding custom operation permissions', () => {
      const customOperation = {
        operationName: 'customOperation',
        operationType: 'mutation' as const,
        requiredPermissions: ['custom:execute'],
        requiredTier: BusinessTier.MEDIUM,
      };

      service.addOperationPermission(customOperation);
      const config = service.getOperationConfig('customOperation');

      expect(config).toEqual(customOperation);
    });
  });

  describe('Error Handling', () => {
    it('should handle permission manager errors gracefully', async () => {
      mockPermissionsManager.getMyPermissions.mockRejectedValue(new Error('Permission fetch failed'));
      const mockGetMyTier = jest.fn().mockResolvedValue({
        success: true,
        data: { tier: BusinessTier.MICRO }
      });
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('dashboard');

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('Validation error occurred');
    });

    it('should handle tier fetch errors gracefully', async () => {
      mockPermissionsManager.getMyPermissions.mockResolvedValue(['dashboard:view']);
      const mockGetMyTier = jest.fn().mockRejectedValue(new Error('Tier fetch failed'));
      (service as any).graphqlService = { getMyTier: mockGetMyTier };

      const result = await service.validateFeatureAccess('dashboard');

      // Should default to MICRO tier and still validate
      expect(result.hasAccess).toBe(true);
    });
  });
});