import { TenantValidator } from './tenant-validator';
import { ForbiddenException } from '@nestjs/common';

describe('TenantValidator', () => {
  describe('validateResourceAccess', () => {
    it('should not throw when organization IDs match', () => {
      // Arrange
      const resourceOrgId = 'org-123';
      const userOrgId = 'org-123';

      // Act & Assert
      expect(() => {
        TenantValidator.validateResourceAccess(
          resourceOrgId,
          userOrgId,
          'User',
          'user-456',
        );
      }).not.toThrow();
    });

    it('should throw ForbiddenException when organization IDs do not match', () => {
      // Arrange
      const resourceOrgId = 'org-123';
      const userOrgId = 'org-456';

      // Act & Assert
      expect(() => {
        TenantValidator.validateResourceAccess(
          resourceOrgId,
          userOrgId,
          'User',
          'user-789',
        );
      }).toThrow(ForbiddenException);

      expect(() => {
        TenantValidator.validateResourceAccess(
          resourceOrgId,
          userOrgId,
          'User',
          'user-789',
        );
      }).toThrow('Access denied: User does not belong to your organization');
    });

    it('should include resource type in error message', () => {
      // Arrange
      const resourceOrgId = 'org-123';
      const userOrgId = 'org-456';

      // Act & Assert
      expect(() => {
        TenantValidator.validateResourceAccess(
          resourceOrgId,
          userOrgId,
          'Location',
        );
      }).toThrow('Access denied: Location does not belong to your organization');
    });
  });

  describe('validateMultipleResourcesAccess', () => {
    it('should not throw when all resources belong to user organization', () => {
      // Arrange
      const resources = [
        { id: '1', organizationId: 'org-123', name: 'Resource 1' },
        { id: '2', organizationId: 'org-123', name: 'Resource 2' },
        { id: '3', organizationId: 'org-123', name: 'Resource 3' },
      ];
      const userOrgId = 'org-123';

      // Act & Assert
      expect(() => {
        TenantValidator.validateMultipleResourcesAccess(
          resources,
          userOrgId,
          'User',
        );
      }).not.toThrow();
    });

    it('should throw ForbiddenException when any resource does not belong to user organization', () => {
      // Arrange
      const resources = [
        { id: '1', organizationId: 'org-123', name: 'Resource 1' },
        { id: '2', organizationId: 'org-456', name: 'Resource 2' }, // Different org
        { id: '3', organizationId: 'org-123', name: 'Resource 3' },
      ];
      const userOrgId = 'org-123';

      // Act & Assert
      expect(() => {
        TenantValidator.validateMultipleResourcesAccess(
          resources,
          userOrgId,
          'Location',
        );
      }).toThrow(ForbiddenException);

      expect(() => {
        TenantValidator.validateMultipleResourcesAccess(
          resources,
          userOrgId,
          'Location',
        );
      }).toThrow('Access denied: Some Location resources do not belong to your organization');
    });

    it('should not throw when resources array is empty', () => {
      // Arrange
      const resources: any[] = [];
      const userOrgId = 'org-123';

      // Act & Assert
      expect(() => {
        TenantValidator.validateMultipleResourcesAccess(
          resources,
          userOrgId,
          'User',
        );
      }).not.toThrow();
    });
  });

  describe('enforceOrganizationFilter', () => {
    it('should add organization ID to empty filters', () => {
      // Arrange
      const filters = {};
      const organizationId = 'org-123';

      // Act
      const result = TenantValidator.enforceOrganizationFilter(filters, organizationId);

      // Assert
      expect(result).toEqual({ organizationId: 'org-123' });
    });

    it('should add organization ID to existing filters', () => {
      // Arrange
      const filters = {
        status: 'active',
        email: 'test@example.com',
      };
      const organizationId = 'org-123';

      // Act
      const result = TenantValidator.enforceOrganizationFilter(filters, organizationId);

      // Assert
      expect(result).toEqual({
        status: 'active',
        email: 'test@example.com',
        organizationId: 'org-123',
      });
    });

    it('should override organization ID if already present in filters', () => {
      // Arrange
      const filters = {
        status: 'active',
        organizationId: 'org-456', // Wrong org ID
      };
      const organizationId = 'org-123';

      // Act
      const result = TenantValidator.enforceOrganizationFilter(filters, organizationId);

      // Assert
      expect(result).toEqual({
        status: 'active',
        organizationId: 'org-123', // Overridden
      });
    });

    it('should preserve all other filter properties', () => {
      // Arrange
      const filters = {
        status: 'active',
        emailVerified: true,
        createdAt: { gte: new Date('2024-01-01') },
        roles: { some: { code: 'ADMIN' } },
      };
      const organizationId = 'org-123';

      // Act
      const result = TenantValidator.enforceOrganizationFilter(filters, organizationId);

      // Assert
      expect(result).toEqual({
        ...filters,
        organizationId: 'org-123',
      });
    });
  });

  describe('logCrossTenantAttempt', () => {
    it('should not throw when logging cross-tenant attempt', () => {
      // Arrange
      const userOrgId = 'org-123';
      const resourceOrgId = 'org-456';
      const resourceType = 'User';
      const action = 'read';
      const userId = 'user-789';

      // Act & Assert
      expect(() => {
        TenantValidator.logCrossTenantAttempt(
          userOrgId,
          resourceOrgId,
          resourceType,
          action,
          userId,
        );
      }).not.toThrow();
    });

    it('should handle missing userId', () => {
      // Arrange
      const userOrgId = 'org-123';
      const resourceOrgId = 'org-456';
      const resourceType = 'User';
      const action = 'read';

      // Act & Assert
      expect(() => {
        TenantValidator.logCrossTenantAttempt(
          userOrgId,
          resourceOrgId,
          resourceType,
          action,
        );
      }).not.toThrow();
    });
  });
});
