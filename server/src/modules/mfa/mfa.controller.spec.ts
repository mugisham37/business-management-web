import { Test, TestingModule } from '@nestjs/testing';
import { MFAController } from './mfa.controller';
import { MFAService } from './mfa.service';
import { User } from '@prisma/client';

describe('MFAController', () => {
  let controller: MFAController;
  let mfaService: MFAService;

  const mockUser: User = {
    id: 'user-1',
    organizationId: 'org-1',
    email: 'test@example.com',
    username: null,
    passwordHash: 'hash',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    avatar: null,
    status: 'active',
    emailVerified: true,
    lockedUntil: null,
    failedLoginAttempts: 0,
    lastLoginAt: null,
    mfaEnabled: false,
    mfaSecret: null,
    departmentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: null,
  };

  const mockMfaService = {
    generateSecret: jest.fn(),
    enableTOTP: jest.fn(),
    disableTOTP: jest.fn(),
    getMFAStatus: jest.fn(),
    generateBackupCodes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MFAController],
      providers: [
        {
          provide: MFAService,
          useValue: mockMfaService,
        },
      ],
    }).compile();

    controller = module.get<MFAController>(MFAController);
    mfaService = module.get<MFAService>(MFAService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup', () => {
    it('should generate MFA secret and return setup data', async () => {
      const setupResult = {
        secret: 'SECRET123',
        qrCode: 'data:image/png;base64,abc',
        backupCodes: ['CODE1', 'CODE2'],
      };

      mockMfaService.generateSecret.mockResolvedValue(setupResult);

      const result = await controller.setup(mockUser);

      expect(result).toEqual({
        success: true,
        data: setupResult,
      });
      expect(mfaService.generateSecret).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId,
      );
    });
  });

  describe('enable', () => {
    it('should enable MFA with valid TOTP code', async () => {
      const dto = { token: '123456' };

      mockMfaService.enableTOTP.mockResolvedValue(undefined);

      const result = await controller.enable(mockUser, dto);

      expect(result).toEqual({
        success: true,
        message: 'MFA has been enabled successfully',
      });
      expect(mfaService.enableTOTP).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId,
        dto.token,
      );
    });
  });

  describe('disable', () => {
    it('should disable MFA with valid password and TOTP code', async () => {
      const dto = { password: 'Password123!', token: '123456' };

      mockMfaService.disableTOTP.mockResolvedValue(undefined);

      const result = await controller.disable(mockUser, dto);

      expect(result).toEqual({
        success: true,
        message: 'MFA has been disabled successfully',
      });
      expect(mfaService.disableTOTP).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId,
        dto.password,
        dto.token,
      );
    });
  });

  describe('getStatus', () => {
    it('should return MFA status', async () => {
      const status = {
        enabled: true,
        totpEnabled: true,
        backupCodesRemaining: 8,
      };

      mockMfaService.getMFAStatus.mockResolvedValue(status);

      const result = await controller.getStatus(mockUser);

      expect(result).toEqual({
        success: true,
        data: status,
      });
      expect(mfaService.getMFAStatus).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId,
      );
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes', async () => {
      const backupCodes = ['CODE1', 'CODE2', 'CODE3'];

      mockMfaService.generateBackupCodes.mockResolvedValue(backupCodes);

      const result = await controller.regenerateBackupCodes(mockUser);

      expect(result).toEqual({
        success: true,
        data: {
          backupCodes,
        },
        message: 'New backup codes have been generated. Please store them securely.',
      });
      expect(mfaService.generateBackupCodes).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId,
      );
    });
  });
});
