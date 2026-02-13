import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { Department } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Validate uniqueness within organization
    const existing = await this.prisma.department.findFirst({
      where: {
        organizationId: context.organizationId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Department with name "${dto.name}" already exists in this organization`,
      );
    }

    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId: context.organizationId,
      },
    });
  }

  async getDepartment(id: string): Promise<Department> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const department = await this.prisma.department.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    return department;
  }

  async getDepartments(): Promise<Department[]> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    return this.prisma.department.findMany({
      where: {
        organizationId: context.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Check if department exists
    const department = await this.getDepartment(id);

    // If name is being updated, check uniqueness
    if (dto.name && dto.name !== department.name) {
      const existing = await this.prisma.department.findFirst({
        where: {
          organizationId: context.organizationId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Department with name "${dto.name}" already exists in this organization`,
        );
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDepartment(id: string): Promise<void> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Check if department exists
    await this.getDepartment(id);

    // Prevent deletion if users are assigned
    const assignedUsers = await this.prisma.userDepartmentAssignment.count({
      where: { departmentId: id },
    });

    if (assignedUsers > 0) {
      throw new BadRequestException(
        `Cannot delete department "${id}" because ${assignedUsers} user(s) are assigned to it`,
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });
  }
}
