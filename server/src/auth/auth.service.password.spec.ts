import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { hashPassword } from '../common/utils/password.util';

describe('AuthService - Password Management', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let cacheService: CacheService;

  const mockPrismaService = {
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    refreshToken: {
      updateMany: jest.fn(),
    },
  };

  const mockUsersService = {
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockCacheService = {
    deleteAllSessions: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OrganizationsService, useValue: {} },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuditService, useValue: {} },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should create a password reset token for valid email', async () => {
      const email = 'test@example.com';
      const organizationId = 'org-123';
      const mockUser = {
        id: 'user-123',
        email,
        organizationId,
      };

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.create.mockResolvedValue({
        id: 'token-123',
        userId: mockUser.id,
        token: 'reset-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      });

      await service.requestPasswordReset(email, organizationId);

      expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(email, organizationId);
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should not reveal if email does not exist', async () => {
      const email = 'nonexistent@example.com';
      const organizationId = 'org-123';

      mockUsersService.getUserByEmail.mockResolvedValue(null);

      // Should not throw error
      await expect(service.requestPasswordReset(email, organizationId)).resolves.not.toThrow();
      
      // Should not create token
      expect(mockPrismaService.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';
      const mockUser = {
        id: 'user-123',
        passwordHash: await hashPassword('OldPassword123!'),
        passwordHistory: [],
      };
      const mockResetToken = {
        id: 'token-123',
        userId: mockUser.id,
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        usedAt: null,
        user: mockUser,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.passwordResetToken.update.mockResolvedValue({});

      await service.resetPassword(token, newPassword);

      expect(mockPrismaService.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token },
        include: { user: true },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: mockResetToken.id },
        data: { usedAt: expect.any(Date) },
      });
    });

    it('should reject expired token', async () => {
      const token = 'expired-token';
      const newPassword = 'NewPassword123!';
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        usedAt: null,
        user: { id: 'user-123', passwordHistory: [] },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject already used token', async () => {
      const token = 'used-token';
      const newPassword = 'NewPassword123!';
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(), // Already used
        user: { id: 'user-123', passwordHistory: [] },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject weak password', async () => {
      const token = 'valid-token';
      const weakPassword = 'weak';
      const mockResetToken = {
        id: 'token-123',
        userId: 'user-123',
        token,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: { id: 'user-123', passwordHistory: [] },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      await expect(service.resetPassword(token, weakPassword)).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const userId = 'user-123';
      const organizationId = 'org-123';
      const currentPassword = 'CurrentPassword123!';
      const newPassword = 'NewPassword123!';
      const mockUser = {
        id: userId,
        organizationId,
        passwordHash: await hashPassword(currentPassword),
        passwordHistory: [],
      };

      mockUsersService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 2 });
      mockCacheService.deleteAllSessions.mockResolvedValue(undefined);

      await service.changePassword(userId, organizationId, currentPassword, newPassword);

      expect(mockUsersService.getUserById).toHaveBeenCalledWith(userId, organizationId);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockCacheService.deleteAllSessions).toHaveBeenCalledWith(userId);
    });

    it('should reject incorrect current password', async () => {
      const userId = 'user-123';
      const organizationId = 'org-123';
      const currentPassword = 'WrongPassword123!';
      const newPassword = 'NewPassword123!';
      const mockUser = {
        id: userId,
        organizationId,
        passwordHash: await hashPassword('CurrentPassword123!'),
        passwordHistory: [],
      };

      mockUsersService.getUserById.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(userId, organizationId, currentPassword, newPassword)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject password in history', async () => {
      const userId = 'user-123';
      const organizationId = 'org-123';
      const currentPassword = 'CurrentPassword123!';
      const oldPassword = 'OldPassword123!';
      const mockUser = {
        id: userId,
        organizationId,
        passwordHash: await hashPassword(currentPassword),
        passwordHistory: [await hashPassword(oldPassword)],
      };

      mockUsersService.getUserById.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(userId, organizationId, currentPassword, oldPassword)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
