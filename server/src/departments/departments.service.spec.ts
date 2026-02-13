import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
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
        DepartmentsService,
        {
          provide: PrismaService,
          useValue: {
            department: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userDepartmentAssignment: {
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

    service = module.get<DepartmentsService>(DepartmentsService);
    prisma = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);
  });

  describe('createDepartment', () => {
    it('should create a department successfully', async () => {
      const dto = { name: 'Engineering', description: 'Tech team' };
      const expectedDepartment = {
        id: 'dept-123',
        ...dto,
        organizationId: mockTenantContext.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.department, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.department, 'create')
        .mockResolvedValue(expectedDepartment);

      const result = await service.createDepartment(dto);

      expect(result).toEqual(expectedDepartment);
      expect(prisma.department.findFirst).toHaveBeenCalledWith({
        where: {
          organizationId: mockTenantContext.organizationId,
          name: dto.name,
        },
      });
    });

    it('should throw ConflictException if department name already exists', async () => {
      const dto = { name: 'Engineering' };
      const existingDepartment = {
        id: 'dept-123',
        name: dto.name,
        organizationId: mockTenantContext.organizationId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.department, 'findFirst')
        .mockResolvedValue(existingDepartment);

      await expect(service.createDepartment(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteDepartment', () => {
    it('should throw BadRequestException if users are assigned', async () => {
      const deptId = 'dept-123';
      const existingDepartment = {
        id: deptId,
        name: 'Engineering',
        organizationId: mockTenantContext.organizationId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.department, 'findFirst')
        .mockResolvedValue(existingDepartment);
      jest.spyOn(prisma.userDepartmentAssignment, 'count').mockResolvedValue(3);

      await expect(service.deleteDepartment(deptId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete department if no users are assigned', async () => {
      const deptId = 'dept-123';
      const existingDepartment = {
        id: deptId,
        name: 'Engineering',
        organizationId: mockTenantContext.organizationId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.department, 'findFirst')
        .mockResolvedValue(existingDepartment);
      jest.spyOn(prisma.userDepartmentAssignment, 'count').mockResolvedValue(0);
      jest
        .spyOn(prisma.department, 'delete')
        .mockResolvedValue(existingDepartment);

      await service.deleteDepartment(deptId);

      expect(prisma.department.delete).toHaveBeenCalledWith({
        where: { id: deptId },
      });
    });
  });
});
