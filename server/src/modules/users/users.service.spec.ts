import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { LocationsService } from '../locations/locations.service';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let security: SecurityService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    department: {
      findFirst: jest.fn(),
    },
    session: {
      updateMany: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    invitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userLocation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userHierarchy: {
      create: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    permission: {
      findUnique: jest.fn(),
    },
    userPermission: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  } as any;

  const mockSecurityService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: PermissionsService,
          useValue: {
            validateDelegation: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findById: jest.fn(),
            getRolePermissions: jest.fn(),
          },
        },
        {
          provide: LocationsService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    security = module.get<SecurityService>(SecurityService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const organizationId = 'org-123';
    const creatorId = 'creator-123';
    const createDto: CreateUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashed-password';
      const createdUser = {
        id: 'user-123',
        organizationId,
        ...createDto,
        passwordHash: hashedPassword,
        status: 'active',
        emailVerified: false,
        createdById: creatorId,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null); // No existing user
      mockSecurityService.validatePasswordStrength.mockReturnValue({ isValid: true, errors: [] });
      mockSecurityService.hashPassword.mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(organizationId, createDto, creatorId);

      expect(result).toEqual(createdUser);
      expect(mockSecurityService.validatePasswordStrength).toHaveBeenCalledWith(createDto.password);
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(createDto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          organizationId,
          email: createDto.email,
          username: createDto.username,
          passwordHash: hashedPassword,
          firstName: createDto.firstName,
          lastName: createDto.lastName,
          phone: undefined,
          avatar: undefined,
          departmentId: undefined,
          status: 'active',
          emailVerified: false,
          createdById: creatorId,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce({ id: 'existing-user' });

      await expect(service.create(organizationId, createDto, creatorId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already exists', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce({ id: 'existing-user' }); // Username check

      await expect(service.create(organizationId, createDto, creatorId)).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if password is weak', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockSecurityService.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ['Password too short'],
      });

      await expect(service.create(organizationId, createDto, creatorId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findById', () => {
    it('should find user by ID with organization context', async () => {
      const userId = 'user-123';
      const organizationId = 'org-123';
      const user = { id: userId, organizationId, email: 'test@example.com' };

      mockPrismaService.user.findFirst.mockResolvedValue(user);

      const result = await service.findById(userId, organizationId);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: userId, organizationId },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.findById('non-existent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email with organization context', async () => {
      const email = 'test@example.com';
      const organizationId = 'org-123';
      const user = { id: 'user-123', organizationId, email };

      mockPrismaService.user.findFirst.mockResolvedValue(user);

      const result = await service.findByEmail(email, organizationId);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email, organizationId },
      });
    });
  });

  describe('findByUsername', () => {
    it('should find user by username with organization context', async () => {
      const username = 'testuser';
      const organizationId = 'org-123';
      const user = { id: 'user-123', organizationId, username };

      mockPrismaService.user.findFirst.mockResolvedValue(user);

      const result = await service.findByUsername(username, organizationId);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username, organizationId },
      });
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user successfully', async () => {
      const existingUser = { id: userId, organizationId, email: 'test@example.com' };
      const updatedUser = { ...existingUser, ...updateDto };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, organizationId, updateDto, actorId);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.update(userId, organizationId, updateDto, actorId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';

    it('should delete user successfully', async () => {
      const existingUser = { id: userId, organizationId };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.delete.mockResolvedValue(existingUser);

      await service.delete(userId, organizationId, actorId);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.delete(userId, organizationId, actorId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspend', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';

    it('should suspend user and invalidate sessions', async () => {
      const existingUser = { id: userId, organizationId, status: 'active' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, status: 'suspended' });
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

      await service.suspend(userId, organizationId, actorId, 'Policy violation');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: 'suspended' },
      });
      expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
        where: { userId, isRevoked: false },
        data: {
          isRevoked: true,
          revokedAt: expect.any(Date),
          revokedReason: 'User status changed',
        },
      });
    });
  });

  describe('reactivate', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';

    it('should reactivate user', async () => {
      const existingUser = { id: userId, organizationId, status: 'suspended' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, status: 'active' });

      await service.reactivate(userId, organizationId, actorId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: 'active' },
      });
    });
  });

  describe('deactivate', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';

    it('should deactivate user and invalidate sessions', async () => {
      const existingUser = { id: userId, organizationId, status: 'active' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, status: 'deactivated' });
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

      await service.deactivate(userId, organizationId, actorId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: 'deactivated' },
      });
      expect(mockPrismaService.session.updateMany).toHaveBeenCalled();
    });
  });

  describe('lock', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';

    it('should lock user for specified duration', async () => {
      const existingUser = { id: userId, organizationId, status: 'active' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, status: 'locked' });

      await service.lock(userId, organizationId, 'Too many failed attempts', 30);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          status: 'locked',
          lockedUntil: expect.any(Date),
        },
      });
    });
  });

  describe('unlock', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';

    it('should unlock user and reset failed attempts', async () => {
      const existingUser = { id: userId, organizationId, status: 'locked' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, status: 'active' });

      await service.unlock(userId, organizationId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          status: 'active',
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
    });
  });

  describe('assignDepartment', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const departmentId = 'dept-123';
    const actorId = 'actor-123';

    it('should assign user to department', async () => {
      const existingUser = { id: userId, organizationId };
      const department = { id: departmentId, organizationId };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.department.findFirst.mockResolvedValue(department);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, departmentId });

      await service.assignDepartment(userId, organizationId, departmentId, actorId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { departmentId },
      });
    });

    it('should throw NotFoundException if department not found', async () => {
      const existingUser = { id: userId, organizationId };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.department.findFirst.mockResolvedValue(null);

      await expect(
        service.assignDepartment(userId, organizationId, departmentId, actorId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeDepartment', () => {
    const userId = 'user-123';
    const organizationId = 'org-123';
    const actorId = 'actor-123';

    it('should remove user from department', async () => {
      const existingUser = { id: userId, organizationId, departmentId: 'dept-123' };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({ ...existingUser, departmentId: null });

      await service.removeDepartment(userId, organizationId, actorId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { departmentId: null },
      });
    });
  });

  describe('Invitation System', () => {
    let permissionsService: any;
    let rolesService: any;
    let locationsService: any;

    beforeEach(() => {
      // Mock the additional services needed for invitation system
      permissionsService = {
        validateDelegation: jest.fn(),
      };

      rolesService = {
        findById: jest.fn(),
        getRolePermissions: jest.fn(),
      };

      locationsService = {
        findById: jest.fn(),
      };

      // Inject mocked services
      (service as any).permissions = permissionsService;
      (service as any).roles = rolesService;
      (service as any).locations = locationsService;
    });

    describe('createInvitation', () => {
      const organizationId = 'org-123';
      const creatorId = 'creator-123';
      const inviteDto = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        roles: [
          {
            roleId: 'role-123',
            scope: {
              type: 'global' as const,
            },
          },
        ],
        permissions: [],
        locationIds: ['loc-123'],
        departmentId: undefined,
      };

      it('should create invitation successfully', async () => {
        const creator = { id: creatorId, organizationId };
        const organization = { id: organizationId, companyCode: 'ABC123' };
        const role = { id: 'role-123', organizationId, name: 'Manager' };
        const location = { id: 'loc-123', organizationId, name: 'HQ' };
        const invitation = {
          id: 'inv-123',
          organizationId,
          email: inviteDto.email,
          token: 'generated-token',
          status: 'pending',
        };

        mockPrismaService.user.findFirst
          .mockResolvedValueOnce(creator) // findById for creator
          .mockResolvedValueOnce(null); // findByEmail - no existing user
        mockPrismaService.organization.findUnique.mockResolvedValue(organization);
        mockPrismaService.invitation.findFirst.mockResolvedValue(null); // No pending invitation
        locationsService.findById.mockResolvedValue(location);
        mockPrismaService.userLocation.findFirst.mockResolvedValue({ userId: creatorId, locationId: 'loc-123' });
        rolesService.findById.mockResolvedValue(role);
        rolesService.getRolePermissions.mockResolvedValue(['users:read:user']);
        permissionsService.validateDelegation.mockResolvedValue(true);
        mockSecurityService.generateToken = jest.fn().mockReturnValue('generated-token');
        mockPrismaService.invitation.create.mockResolvedValue(invitation);

        const result = await service.createInvitation(organizationId, inviteDto, creatorId);

        expect(result).toEqual(invitation);
        expect(permissionsService.validateDelegation).toHaveBeenCalledWith(
          creatorId,
          ['users:read:user']
        );
        expect(mockPrismaService.invitation.create).toHaveBeenCalled();
      });

      it('should throw ConflictException if email already exists', async () => {
        const creator = { id: creatorId, organizationId };
        const existingUser = { id: 'existing-123', email: inviteDto.email };

        mockPrismaService.user.findFirst
          .mockResolvedValueOnce(creator)
          .mockResolvedValueOnce(existingUser);
        mockPrismaService.organization.findUnique.mockResolvedValue({ id: organizationId });

        await expect(
          service.createInvitation(organizationId, inviteDto, creatorId)
        ).rejects.toThrow(ConflictException);
      });

      it('should throw ConflictException if pending invitation exists', async () => {
        const creator = { id: creatorId, organizationId };
        const pendingInvitation = { id: 'inv-123', email: inviteDto.email, status: 'pending' };

        mockPrismaService.user.findFirst
          .mockResolvedValueOnce(creator)
          .mockResolvedValueOnce(null);
        mockPrismaService.organization.findUnique.mockResolvedValue({ id: organizationId });
        mockPrismaService.invitation.findFirst.mockResolvedValue(pendingInvitation);

        await expect(
          service.createInvitation(organizationId, inviteDto, creatorId)
        ).rejects.toThrow(ConflictException);
      });

      it('should throw ForbiddenException if creator lacks location access', async () => {
        const creator = { id: creatorId, organizationId };
        const organization = { id: organizationId, companyCode: 'ABC123' };
        const location = { id: 'loc-123', organizationId, name: 'HQ' };

        mockPrismaService.user.findFirst
          .mockResolvedValueOnce(creator)
          .mockResolvedValueOnce(null);
        mockPrismaService.organization.findUnique.mockResolvedValue(organization);
        mockPrismaService.invitation.findFirst.mockResolvedValue(null);
        locationsService.findById.mockResolvedValue(location);
        mockPrismaService.userLocation.findFirst.mockResolvedValue(null); // Creator doesn't have access

        await expect(
          service.createInvitation(organizationId, inviteDto, creatorId)
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException if creator lacks delegated permissions', async () => {
        const creator = { id: creatorId, organizationId };
        const organization = { id: organizationId, companyCode: 'ABC123' };
        const role = { id: 'role-123', organizationId, name: 'Manager' };
        const location = { id: 'loc-123', organizationId, name: 'HQ' };

        mockPrismaService.user.findFirst
          .mockResolvedValueOnce(creator)
          .mockResolvedValueOnce(null);
        mockPrismaService.organization.findUnique.mockResolvedValue(organization);
        mockPrismaService.invitation.findFirst.mockResolvedValue(null);
        locationsService.findById.mockResolvedValue(location);
        mockPrismaService.userLocation.findFirst.mockResolvedValue({ userId: creatorId, locationId: 'loc-123' });
        rolesService.findById.mockResolvedValue(role);
        rolesService.getRolePermissions.mockResolvedValue(['users:create:user']);
        permissionsService.validateDelegation.mockResolvedValue(false); // Creator lacks permissions

        await expect(
          service.createInvitation(organizationId, inviteDto, creatorId)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('validateInvitation', () => {
      const token = 'valid-token';

      it('should validate invitation successfully', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000), // 1 day from now
          organization: { id: 'org-123', companyCode: 'ABC123' },
          createdBy: { id: 'creator-123' },
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);

        const result = await service.validateInvitation(token);

        expect(result).toEqual(invitation);
      });

      it('should throw NotFoundException if token not found', async () => {
        mockPrismaService.invitation.findUnique.mockResolvedValue(null);

        await expect(service.validateInvitation(token)).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if invitation expired', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          status: 'pending',
          expiresAt: new Date(Date.now() - 86400000), // 1 day ago
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);

        await expect(service.validateInvitation(token)).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException if invitation already accepted', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          status: 'accepted',
          expiresAt: new Date(Date.now() + 86400000),
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);

        await expect(service.validateInvitation(token)).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException if invitation revoked', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          status: 'revoked',
          expiresAt: new Date(Date.now() + 86400000),
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);

        await expect(service.validateInvitation(token)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('acceptInvitation', () => {
      const token = 'valid-token';
      const acceptDto = {
        password: 'SecurePass123!',
        username: 'newuser',
      };

      it('should accept invitation and create user successfully', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          organizationId: 'org-123',
          email: 'newuser@example.com',
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000),
          createdById: 'creator-123',
          roles: [{ roleId: 'role-123', scope: { type: 'global' } }],
          permissions: [],
          locations: ['loc-123'],
          departmentId: null,
          organization: { id: 'org-123' },
          createdBy: { id: 'creator-123' },
        };

        const newUser = {
          id: 'user-123',
          organizationId: invitation.organizationId,
          email: invitation.email,
          username: acceptDto.username,
          status: 'active',
          emailVerified: true,
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);
        mockSecurityService.validatePasswordStrength.mockReturnValue({ isValid: true, errors: [] });
        mockSecurityService.hashPassword.mockResolvedValue('hashed-password');
        mockPrismaService.user.create.mockResolvedValue(newUser);
        mockPrismaService.userHierarchy.create.mockResolvedValue({});
        mockPrismaService.userRole.create.mockResolvedValue({});
        mockPrismaService.userLocation.create.mockResolvedValue({});
        mockPrismaService.invitation.update.mockResolvedValue({ ...invitation, status: 'accepted' });

        const result = await service.acceptInvitation(token, acceptDto);

        expect(result).toEqual(newUser);
        expect(mockPrismaService.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            organizationId: invitation.organizationId,
            email: invitation.email,
            username: acceptDto.username,
            emailVerified: true,
            createdById: invitation.createdById,
          }),
        });
        expect(mockPrismaService.userHierarchy.create).toHaveBeenCalledWith({
          data: {
            userId: newUser.id,
            parentId: invitation.createdById,
            depth: 0,
          },
        });
      });

      it('should throw ForbiddenException if password is weak', async () => {
        const invitation = {
          id: 'inv-123',
          token,
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000),
          organization: { id: 'org-123' },
          createdBy: { id: 'creator-123' },
        };

        mockPrismaService.invitation.findUnique.mockResolvedValue(invitation);
        mockSecurityService.validatePasswordStrength.mockReturnValue({
          isValid: false,
          errors: ['Password too short'],
        });

        await expect(service.acceptInvitation(token, acceptDto)).rejects.toThrow(ForbiddenException);
      });
    });
  });
});
