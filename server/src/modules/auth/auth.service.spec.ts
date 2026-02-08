import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MFAService } from '../mfa/mfa.service';
import { PermissionsService } from '../permissions/permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';

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
  };

  const mockSecurityService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
    generateSecureToken: jest.fn(),
  };

  const mockOrganizationsService = {
    create: jest.fn(),
    incrementUserCount: jest.fn(),
    findById: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockSessionsService = {};
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
