import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MFAService } from '../mfa/mfa.service';
import { PermissionsService } from '../permissions/permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { AuditService } from '../../common/audit/audit.service';

describe('AuthService - Primary Owner Registration', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let security: SecurityService;
  let organizations: OrganizationsService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    emailVerificationToken: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockSecurityService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
    generateSecureToken: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockOrganizationsService = {
    create: jest.fn(),
    incrementUserCount: jest.fn(),
    findById: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockSessionsService = {
    revokeAll: jest.fn(),
    revokeAllExcept: jest.fn(),
  };
  
  const mockMFAService = {};
  const mockPermissionsService = {};
  
  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: MFAService, useValue: mockMFAService },
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    security = module.get<SecurityService>(SecurityService);
    organizations = module.get<OrganizationsService>(OrganizationsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('registerPrimaryOwner', () => {
    const validDto = {
      email: 'owner@example.com',
      password: 'SecurePass123!',
      organizationName: 'Test Company',
    };

    it('should successfully register a primary owner with organization', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null); // Email not taken
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockSecurityService.hashPassword.mockResolvedValue('hashed_password');
      mockSecurityService.generateSecureToken.mockReturnValue('verification_token_123');

      const mockOrganization = {
        id: 'org-123',
        name: 'Test Company',
        companyCode: 'ABC123',
        email: 'owner@example.com',
      };

      const mockUser = {
        id: 'user-123',
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'Example',
        organizationId: 'org-123',
        passwordHash: 'hashed_password',
        status: 'active',
        emailVerified: false,
        createdById: null,
      };

      const mockRole = {
        id: 'role-123',
        code: 'SUPER_ADMIN',
        organizationId: 'org-123',
        isSystem: true,
      };

      mockOrganizationsService.create.mockResolvedValue(mockOrganization);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.role.findFirst.mockResolvedValue(mockRole);
      mockPrismaService.userRole.create.mockResolvedValue({});
      mockOrganizationsService.incrementUserCount.mockResolvedValue(undefined);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockPrismaService.emailVerificationToken.updateMany.mockResolvedValue({});
      mockPrismaService.emailVerificationToken.create.mockResolvedValue({});

      // Act
      const result = await service.registerPrimaryOwner(validDto);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'Example',
          organizationId: 'org-123',
        },
        organization: {
          id: 'org-123',
          name: 'Test Company',
          companyCode: 'ABC123',
        },
        message: 'Registration successful. Please check your email to verify your account.',
      });

      // Verify organization was created
      expect(mockOrganizationsService.create).toHaveBeenCalledWith({
        name: 'Test Company',
        email: 'owner@example.com',
      });

      // Verify password was hashed
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith('SecurePass123!');

      // Verify user was created
      expect(mockPrismaService.user.create).toHaveBeenCalled();

      // Verify SUPER_ADMIN role was assigned
      expect(mockPrismaService.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          roleId: 'role-123',
          scopeType: 'global',
          assignedById: 'user-123',
        },
      });

      // Verify verification email was sent
      expect(mockPrismaService.emailVerificationToken.create).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'owner@example.com',
      });

      // Act & Assert
      await expect(service.registerPrimaryOwner(validDto)).rejects.toThrow(ConflictException);
      await expect(service.registerPrimaryOwner(validDto)).rejects.toThrow(
        'Email address is already registered',
      );
    });

    it('should reject registration with weak password', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 12 characters'],
      });

      // Act & Assert
      await expect(service.registerPrimaryOwner(validDto)).rejects.toThrow(ForbiddenException);
      await expect(service.registerPrimaryOwner(validDto)).rejects.toThrow(
        'Password does not meet requirements',
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email and invalidate old tokens', async () => {
      // Arrange
      const userId = 'user-123';
      const organizationId = 'org-123';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        organizationId,
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockPrismaService.emailVerificationToken.updateMany.mockResolvedValue({});
      mockPrismaService.emailVerificationToken.create.mockResolvedValue({});
      mockSecurityService.generateSecureToken.mockReturnValue('new_token_123');

      // Act
      await service.sendVerificationEmail(userId, organizationId);

      // Assert
      // Verify old tokens were invalidated
      expect(mockPrismaService.emailVerificationToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: expect.any(Date),
        },
      });

      // Verify new token was created
      expect(mockPrismaService.emailVerificationToken.create).toHaveBeenCalledWith({
        data: {
          userId,
          token: 'new_token_123',
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // Arrange
      const token = 'valid_token_123';
      const mockToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        user: {
          id: 'user-123',
          email: 'user@example.com',
          organizationId: 'org-123',
          createdById: null, // Primary owner
        },
      };

      const mockOrganization = {
        id: 'org-123',
        onboardingCompleted: false,
      };

      mockPrismaService.emailVerificationToken.findUnique.mockResolvedValue(mockToken);
      mockPrismaService.emailVerificationToken.update.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});
      mockOrganizationsService.findById.mockResolvedValue(mockOrganization);

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(result).toEqual({
        message: 'Email verified successfully',
        shouldOnboard: true,
      });

      // Verify token was marked as used
      expect(mockPrismaService.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: 'token-123' },
        data: {
          isUsed: true,
          usedAt: expect.any(Date),
        },
      });

      // Verify user email was marked as verified
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerified: true,
        },
      });
    });

    it('should reject invalid token', async () => {
      // Arrange
      mockPrismaService.emailVerificationToken.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail('invalid_token')).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyEmail('invalid_token')).rejects.toThrow(
        'Invalid verification token',
      );
    });

    it('should reject expired token', async () => {
      // Arrange
      const token = 'expired_token';
      const mockToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() - 1000), // Expired
        user: {
          id: 'user-123',
          organizationId: 'org-123',
        },
      };

      mockPrismaService.emailVerificationToken.findUnique.mockResolvedValue(mockToken);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyEmail(token)).rejects.toThrow(
        'Verification token has expired',
      );
    });

    it('should reject already used token', async () => {
      // Arrange
      const token = 'used_token';
      const mockToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        isUsed: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: 'user-123',
          organizationId: 'org-123',
        },
      };

      mockPrismaService.emailVerificationToken.findUnique.mockResolvedValue(mockToken);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyEmail(token)).rejects.toThrow(
        'Verification token has already been used',
      );
    });

    it('should not trigger onboarding for team members', async () => {
      // Arrange
      const token = 'valid_token_123';
      const mockToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: 'user-123',
          email: 'user@example.com',
          organizationId: 'org-123',
          createdById: 'creator-123', // Team member (has creator)
        },
      };

      mockPrismaService.emailVerificationToken.findUnique.mockResolvedValue(mockToken);
      mockPrismaService.emailVerificationToken.update.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(result.shouldOnboard).toBe(false);
    });
  });
});


describe('AuthService - Password Management', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let security: SecurityService;
  let users: UsersService;
  let sessions: SessionsService;
  let audit: AuditService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockSecurityService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
    generateSecureToken: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockSessionsService = {
    revokeAll: jest.fn(),
    revokeAllExcept: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockOrganizationsService = {};
  const mockMFAService = {};
  const mockPermissionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: MFAService, useValue: mockMFAService },
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    security = module.get<SecurityService>(SecurityService);
    users = module.get<UsersService>(UsersService);
    sessions = module.get<SessionsService>(SessionsService);
    audit = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for existing user', async () => {
      // Arrange
      const email = 'user@example.com';
      const mockUser = {
        id: 'user-123',
        email,
        organizationId: 'org-123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.updateMany.mockResolvedValue({});
      mockPrismaService.passwordResetToken.create.mockResolvedValue({});
      mockSecurityService.generateSecureToken.mockReturnValue('reset_token_123');
      mockAuditService.log.mockResolvedValue({});

      // Act
      const result = await service.requestPasswordReset(email, '192.168.1.1');

      // Assert
      expect(result.message).toContain('password reset link has been sent');

      // Verify old tokens were invalidated
      expect(mockPrismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: expect.any(Date),
        },
      });

      // Verify new token was created
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          token: 'reset_token_123',
          expiresAt: expect.any(Date),
        },
      });

      // Verify audit log
      expect(mockAuditService.log).toHaveBeenCalledWith({
        organizationId: 'org-123',
        userId: 'user-123',
        action: 'password_reset_requested',
        resource: 'user',
        resourceId: 'user-123',
        outcome: 'success',
        ipAddress: '192.168.1.1',
        metadata: {
          email: 'user@example.com',
        },
      });
    });

    it('should return generic message for non-existent email', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.requestPasswordReset('nonexistent@example.com');

      // Assert
      expect(result.message).toContain('password reset link has been sent');
      expect(mockPrismaService.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      organizationId: 'org-123',
      passwordHash: 'old_hash',
    };

    it('should reset password with valid token', async () => {
      // Arrange
      const token = 'valid_reset_token';
      const newPassword = 'NewSecurePass123!';
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        isUsed: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        user: mockUser,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockPrismaService.passwordHistory.findMany.mockResolvedValue([]);
      mockSecurityService.hashPassword.mockResolvedValue('new_hash');
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.passwordHistory.create.mockResolvedValue({});
      mockPrismaService.passwordResetToken.update.mockResolvedValue({});
      mockSessionsService.revokeAll.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue({});

      // Act
      const result = await service.resetPassword(token, newPassword, '192.168.1.1', 'Mozilla/5.0');

      // Assert
      expect(result.message).toContain('Password has been reset successfully');

      // Verify password was updated
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          passwordHash: 'new_hash',
          failedLoginAttempts: 0,
        },
      });

      // Verify old password added to history
      expect(mockPrismaService.passwordHistory.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          passwordHash: 'old_hash',
        },
      });

      // Verify token marked as used
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'token-123' },
        data: {
          isUsed: true,
          usedAt: expect.any(Date),
        },
      });

      // Verify all sessions invalidated
      expect(mockSessionsService.revokeAll).toHaveBeenCalledWith('user-123');

      // Verify audit log
      expect(mockAuditService.log).toHaveBeenCalledWith({
        organizationId: 'org-123',
        userId: 'user-123',
        action: 'password_reset_completed',
        resource: 'user',
        resourceId: 'user-123',
        outcome: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: {
          email: 'user@example.com',
          sessionsInvalidated: true,
        },
      });
    });

    it('should reject invalid token', async () => {
      // Arrange
      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.resetPassword('invalid_token', 'NewPass123!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject expired token', async () => {
      // Arrange
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'expired_token',
        isUsed: false,
        expiresAt: new Date(Date.now() - 1000), // Expired
        user: mockUser,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      // Act & Assert
      await expect(
        service.resetPassword('expired_token', 'NewPass123!'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.resetPassword('expired_token', 'NewPass123!'),
      ).rejects.toThrow('Password reset token has expired');
    });

    it('should reject already used token', async () => {
      // Arrange
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'used_token',
        isUsed: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: mockUser,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      // Act & Assert
      await expect(
        service.resetPassword('used_token', 'NewPass123!'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.resetPassword('used_token', 'NewPass123!'),
      ).rejects.toThrow('Password reset token has already been used');
    });

    it('should reject weak password', async () => {
      // Arrange
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'valid_token',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: mockUser,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 12 characters'],
      });

      // Act & Assert
      await expect(
        service.resetPassword('valid_token', 'weak'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password matching recent history', async () => {
      // Arrange
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token: 'valid_token',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: mockUser,
      };

      const mockHistory = [
        { passwordHash: 'hash1' },
        { passwordHash: 'hash2' },
      ];

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockPrismaService.passwordHistory.findMany.mockResolvedValue(mockHistory);
      // First call returns true (matches history)
      mockSecurityService.verifyPassword.mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.resetPassword('valid_token', 'OldPassword123!'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      organizationId: 'org-123',
      passwordHash: 'current_hash',
    };

    it('should change password successfully', async () => {
      // Arrange
      const oldPassword = 'OldPass123!';
      const newPassword = 'NewSecurePass123!';
      const currentSessionId = 'session-123';

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockSecurityService.verifyPassword
        .mockResolvedValueOnce(true) // Old password valid
        .mockResolvedValueOnce(false); // New password different from old
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockPrismaService.passwordHistory.findMany.mockResolvedValue([]);
      mockSecurityService.hashPassword.mockResolvedValue('new_hash');
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.passwordHistory.create.mockResolvedValue({});
      mockSessionsService.revokeAllExcept.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue({});

      // Act
      const result = await service.changePassword(
        'user-123',
        'org-123',
        oldPassword,
        newPassword,
        currentSessionId,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      // Assert
      expect(result.message).toContain('Password has been changed successfully');

      // Verify old password was checked
      expect(mockSecurityService.verifyPassword).toHaveBeenCalledWith(
        oldPassword,
        'current_hash',
      );

      // Verify password was updated
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          passwordHash: 'new_hash',
        },
      });

      // Verify sessions invalidated except current
      expect(mockSessionsService.revokeAllExcept).toHaveBeenCalledWith(
        'user-123',
        currentSessionId,
      );

      // Verify audit log
      expect(mockAuditService.log).toHaveBeenCalledWith({
        organizationId: 'org-123',
        userId: 'user-123',
        action: 'password_changed',
        resource: 'user',
        resourceId: 'user-123',
        outcome: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: {
          email: 'user@example.com',
          sessionsInvalidated: true,
          currentSessionPreserved: true,
        },
      });
    });

    it('should reject incorrect old password', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockSecurityService.verifyPassword.mockResolvedValue(false);
      mockAuditService.log.mockResolvedValue({});

      // Act & Assert
      await expect(
        service.changePassword('user-123', 'org-123', 'WrongPass123!', 'NewPass123!'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword('user-123', 'org-123', 'WrongPass123!', 'NewPass123!'),
      ).rejects.toThrow('Current password is incorrect');

      // Verify failed attempt was logged
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'password_change_failed',
          outcome: 'failure',
        }),
      );
    });

    it('should reject new password same as old password', async () => {
      // Arrange
      const samePassword = 'SamePass123!';

      mockUsersService.findById.mockResolvedValue(mockUser);
      // First call: old password verification (true)
      // Second call: check if new password same as old (true)
      mockSecurityService.verifyPassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });

      // Act & Assert
      await expect(
        service.changePassword('user-123', 'org-123', samePassword, samePassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password matching recent history', async () => {
      // Arrange
      const mockHistory = [
        { passwordHash: 'hash1' },
        { passwordHash: 'hash2' },
      ];

      mockUsersService.findById.mockResolvedValue(mockUser);
      // First call: old password verification (true)
      // Second call: check if new password same as current (false)
      // Third call: check against history (true - matches)
      mockSecurityService.verifyPassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockPrismaService.passwordHistory.findMany.mockResolvedValue(mockHistory);

      // Act & Assert
      await expect(
        service.changePassword('user-123', 'org-123', 'OldPass123!', 'HistoryPass123!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should revoke all sessions when no current session provided', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockSecurityService.verifyPassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockPrismaService.passwordHistory.findMany.mockResolvedValue([]);
      mockSecurityService.hashPassword.mockResolvedValue('new_hash');
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.passwordHistory.create.mockResolvedValue({});
      mockSessionsService.revokeAll.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue({});

      // Act
      await service.changePassword(
        'user-123',
        'org-123',
        'OldPass123!',
        'NewPass123!',
        undefined, // No current session
      );

      // Assert
      expect(mockSessionsService.revokeAll).toHaveBeenCalledWith('user-123');
      expect(mockSessionsService.revokeAllExcept).not.toHaveBeenCalled();
    });
  });
});
