import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { MFAService } from '../mfa/mfa.service';
import { PermissionsService } from '../permissions/permissions.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let security: SecurityService;
  let users: UsersService;
  let sessions: SessionsService;
  let mfa: MFAService;
  let permissions: PermissionsService;

  const mockUser = {
    id: 'user-1',
    organizationId: 'org-1',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    avatar: null,
    status: 'active' as const,
    emailVerified: true,
    lockedUntil: null,
    failedLoginAttempts: 0,
    lastLoginAt: null,
    mfaEnabled: false,
    mfaSecret: null,
    departmentId: null,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            userRole: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: SecurityService,
          useValue: {
            hashPassword: jest.fn(),
            verifyPassword: jest.fn(),
            generateSecureToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            lock: jest.fn(),
            unlock: jest.fn(),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            create: jest.fn(),
            rotateRefreshToken: jest.fn(),
          },
        },
        {
          provide: MFAService,
          useValue: {
            isMFAEnabled: jest.fn(),
            validateTOTP: jest.fn(),
            validateBackupCode: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            getUserPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    security = module.get<SecurityService>(SecurityService);
    users = module.get<UsersService>(UsersService);
    sessions = module.get<SessionsService>(SessionsService);
    mfa = module.get<MFAService>(MFAService);
    permissions = module.get<PermissionsService>(PermissionsService);

    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens with embedded permissions', async () => {
      const permissionCodes = ['users:read:user', 'users:create:user'];
      const roleCodes = ['ADMIN'];

      jest.spyOn(prisma.userRole, 'findMany').mockResolvedValue([
        {
          id: 'ur-1',
          userId: mockUser.id,
          roleId: 'role-1',
          scopeType: 'global',
          locationId: null,
          departmentId: null,
          assignedBy: 'admin-1',
          assignedAt: new Date(),
          role: {
            id: 'role-1',
            organizationId: 'org-1',
            name: 'Admin',
            code: 'ADMIN',
            description: 'Administrator role',
            isSystem: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ] as any);

      jest.spyOn(security, 'generateSecureToken').mockReturnValue('refresh-token-123');

      const result = await service.generateTokens(mockUser, permissionCodes);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).toBe('refresh-token-123');

      // Decode and verify JWT payload
      const decoded = jwt.decode(result.accessToken) as any;
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.organizationId).toBe(mockUser.organizationId);
      expect(decoded.roles).toEqual(roleCodes);
      expect(decoded.permissions).toEqual(permissionCodes);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', async () => {
      const token = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          organizationId: mockUser.organizationId,
          roles: ['ADMIN'],
          permissions: ['users:read:user'],
        },
        'test-secret',
        { expiresIn: '15m' }
      );

      jest.spyOn(users, 'findById').mockResolvedValue(mockUser);

      const result = await service.validateToken(token);

      expect(result.sub).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.organizationId).toBe(mockUser.organizationId);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const token = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          organizationId: mockUser.organizationId,
          roles: [],
          permissions: [],
        },
        'test-secret',
        { expiresIn: '-1s' } // Expired
      );

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(security, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(security.verifyPassword).toHaveBeenCalledWith('password123', mockUser.passwordHash);
    });

    it('should return null for invalid password', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(security, 'verifyPassword').mockResolvedValue(false);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ ...mockUser, failedLoginAttempts: 1 });

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedLoginAttempts: 1,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should throw ForbiddenException for unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(unverifiedUser);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for suspended account', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' as const };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(suspendedUser);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    const metadata = {
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('should login user without MFA', async () => {
      jest.spyOn(mfa, 'isMFAEnabled').mockResolvedValue(false);
      jest.spyOn(permissions, 'getUserPermissions').mockResolvedValue(['users:read:user']);
      jest.spyOn(prisma.userRole, 'findMany').mockResolvedValue([]);
      jest.spyOn(security, 'generateSecureToken').mockReturnValue('refresh-token');
      jest.spyOn(sessions, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

      const result = await service.login(mockUser, metadata);

      expect('requiresMFA' in result).toBe(false);
      if (!('requiresMFA' in result)) {
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user.id).toBe(mockUser.id);
      }
    });

    it('should return MFA required response when MFA is enabled', async () => {
      jest.spyOn(mfa, 'isMFAEnabled').mockResolvedValue(true);

      const result = await service.login(mockUser, metadata);

      expect('requiresMFA' in result).toBe(true);
      if ('requiresMFA' in result) {
        expect(result.requiresMFA).toBe(true);
        expect(result).toHaveProperty('tempToken');
        expect(result.userId).toBe(mockUser.id);
      }
    });
  });

  describe('loginWithMFA', () => {
    const metadata = {
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    };

    it('should complete login with valid TOTP code', async () => {
      const tempToken = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          organizationId: mockUser.organizationId,
          type: 'mfa-temp',
        },
        'test-secret',
        { expiresIn: '5m' }
      );

      jest.spyOn(users, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(mfa, 'validateTOTP').mockResolvedValue(true);
      jest.spyOn(permissions, 'getUserPermissions').mockResolvedValue(['users:read:user']);
      jest.spyOn(prisma.userRole, 'findMany').mockResolvedValue([]);
      jest.spyOn(security, 'generateSecureToken').mockReturnValue('refresh-token');
      jest.spyOn(sessions, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);

      const result = await service.loginWithMFA(tempToken, '123456', metadata);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException for invalid MFA code', async () => {
      const tempToken = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          organizationId: mockUser.organizationId,
          type: 'mfa-temp',
        },
        'test-secret',
        { expiresIn: '5m' }
      );

      jest.spyOn(users, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(mfa, 'validateTOTP').mockResolvedValue(false);
      jest.spyOn(mfa, 'validateBackupCode').mockResolvedValue(false);

      await expect(
        service.loginWithMFA(tempToken, 'invalid-code', metadata)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const session = {
        id: 'session-1',
        userId: mockUser.id,
        refreshToken: 'old-token',
        refreshTokenHash: 'hash',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        deviceFingerprint: null,
        location: null,
        isRevoked: false,
        revokedAt: null,
        revokedReason: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(),
        createdAt: new Date(),
      };

      jest.spyOn(sessions, 'rotateRefreshToken').mockResolvedValue({
        newToken: 'new-refresh-token',
        session,
      });
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(permissions, 'getUserPermissions').mockResolvedValue(['users:read:user']);
      jest.spyOn(prisma.userRole, 'findMany').mockResolvedValue([]);

      const result = await service.refreshTokens('old-token');

      expect(result).toHaveProperty('accessToken');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
  });
});
