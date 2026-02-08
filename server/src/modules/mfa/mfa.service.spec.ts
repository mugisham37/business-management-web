import { Test, TestingModule } from '@nestjs/testing';
import { MFAService } from './mfa.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('MFAService', () => {
  let service: MFAService;
  let prisma: PrismaService;
  let security: SecurityService;

  const mockUser = {
    id: 'user-123',
    organizationId: 'org-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    mfaEnabled: false,
    mfaSecret: null,
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    mFABackupCode: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockSecurityService = {
    encrypt: jest.fn((data) => `encrypted:${data}`),
    decrypt: jest.fn((data) => data.replace('encrypted:', '')),
    hashPassword: jest.fn((password) => Promise.resolve(`hashed:${password}`)),
    verifyPassword: jest.fn((password, hash) => Promise.resolve(hash === `hashed:${password}`)),
    generateToken: jest.fn(() => 'ABCD1234'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MFAService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<MFAService>(MFAService);
    prisma = module.get<PrismaService>(PrismaService);
    security = module.get<SecurityService>(SecurityService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate TOTP secret, QR code, and backup codes', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, mfaSecret: 'encrypted:secret' });
      mockPrismaService.mFABackupCode.createMany.mockResolvedValue({ count: 10 });

      const result = await service.generateSecret('user-123', 'org-123');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { mfaSecret: expect.any(String) },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.generateSecret('user-123', 'org-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if MFA already enabled', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ ...mockUser, mfaEnabled: true });

      await expect(service.generateSecret('user-123', 'org-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('isMFAEnabled', () => {
    it('should return true if MFA is enabled', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ mfaEnabled: true });

      const result = await service.isMFAEnabled('user-123', 'org-123');

      expect(result).toBe(true);
    });

    it('should return false if MFA is not enabled', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ mfaEnabled: false });

      const result = await service.isMFAEnabled('user-123', 'org-123');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.isMFAEnabled('user-123', 'org-123');

      expect(result).toBe(false);
    });
  });

  describe('getMFAStatus', () => {
    it('should return MFA status with backup codes count', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ mfaEnabled: true });
      mockPrismaService.mFABackupCode.count.mockResolvedValue(8);

      const result = await service.getMFAStatus('user-123', 'org-123');

      expect(result).toEqual({
        enabled: true,
        totpEnabled: true,
        backupCodesRemaining: 8,
      });
    });

    it('should return disabled status if MFA not enabled', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ mfaEnabled: false });

      const result = await service.getMFAStatus('user-123', 'org-123');

      expect(result).toEqual({
        enabled: false,
        totpEnabled: false,
        backupCodesRemaining: 0,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.getMFAStatus('user-123', 'org-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRemainingBackupCodes', () => {
    it('should return count of unused backup codes', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.mFABackupCode.count.mockResolvedValue(7);

      const result = await service.getRemainingBackupCodes('user-123', 'org-123');

      expect(result).toBe(7);
      expect(mockPrismaService.mFABackupCode.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', isUsed: false },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.getRemainingBackupCodes('user-123', 'org-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 new backup codes', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ ...mockUser, mfaEnabled: true });
      mockPrismaService.mFABackupCode.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.mFABackupCode.createMany.mockResolvedValue({ count: 10 });

      const result = await service.generateBackupCodes('user-123', 'org-123');

      expect(result).toHaveLength(10);
      expect(mockPrismaService.mFABackupCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(mockPrismaService.mFABackupCode.createMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if MFA not enabled', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.generateBackupCodes('user-123', 'org-123')).rejects.toThrow(BadRequestException);
    });
  });
});
