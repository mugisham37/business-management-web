import { TenantIsolationGuard } from './tenant-isolation.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('TenantIsolationGuard', () => {
  let guard: TenantIsolationGuard;

  beforeEach(() => {
    guard = new TenantIsolationGuard();
  });

  describe('canActivate', () => {
    it('should return true when organization ID is present in request', () => {
      // Arrange
      const mockRequest = {
        organizationId: 'org-123',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when organization ID is missing', () => {
      // Arrange
      const mockRequest = {
        // No organizationId
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Organization context is required. Please ensure you are authenticated.',
      );
    });

    it('should throw ForbiddenException when organization ID is null', () => {
      // Arrange
      const mockRequest = {
        organizationId: null,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when organization ID is undefined', () => {
      // Arrange
      const mockRequest = {
        organizationId: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when organization ID is empty string', () => {
      // Arrange
      const mockRequest = {
        organizationId: '',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });
});
