import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

describe('BranchesService', () => {
  let service: BranchesService;
  let prisma: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantContext = {
    organizationId: 'org-123',
    userId: 'user-123',
    role: 'OWNER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: PrismaService,
          useValue: {
            branch: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userBranchAssignment: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getTenantContext: jest.fn().mockReturnValue(mockTenantContext),
          },
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
    prisma = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);
  });

  describe('createBranch', () => {
    it('should create a branch successfully', async () => {
      const dto = { name: 'Main Office', location: 'New York' };
      const expectedBranch = {
        id: 'branch-123',
        ...dto,
        organizationId: mockTenantContext.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.branch, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.branch, 'create').mockResolvedValue(expectedBranch);

      const result = await service.createBranch(dto);

      expect(result).toEqual(expectedBranch);
      expect(prisma.branch.findFirst).toHaveBeenCalledWith({
        where: {
          organizationId: mockTenantContext.organizationId,
          name: dto.name,
        },
      });
    });

    it('should throw ConflictException if branch name already exists', async () => {
      const dto = { name: 'Main Office' };
      const existingBranch = {
        id: 'branch-123',
        name: dto.name,
        organizationId: mockTenantContext.organizationId,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.branch, 'findFirst').mockResolvedValue(existingBranch);

      await expect(service.createBranch(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteBranch', () => {
    it('should throw BadRequestException if users are assigned', async () => {
      const branchId = 'branch-123';
      const existingBranch = {
        id: branchId,
        name: 'Main Office',
        organizationId: mockTenantContext.organizationId,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.branch, 'findFirst').mockResolvedValue(existingBranch);
      jest.spyOn(prisma.userBranchAssignment, 'count').mockResolvedValue(5);

      await expect(service.deleteBranch(branchId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete branch if no users are assigned', async () => {
      const branchId = 'branch-123';
      const existingBranch = {
        id: branchId,
        name: 'Main Office',
        organizationId: mockTenantContext.organizationId,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.branch, 'findFirst').mockResolvedValue(existingBranch);
      jest.spyOn(prisma.userBranchAssignment, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.branch, 'delete').mockResolvedValue(existingBranch);

      await service.deleteBranch(branchId);

      expect(prisma.branch.delete).toHaveBeenCalledWith({
        where: { id: branchId },
      });
    });
  });
});
