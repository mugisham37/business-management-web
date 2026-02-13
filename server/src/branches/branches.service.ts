import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async createBranch(dto: CreateBranchDto): Promise<Branch> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Validate uniqueness within organization
    const existing = await this.prisma.branch.findFirst({
      where: {
        organizationId: context.organizationId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Branch with name "${dto.name}" already exists in this organization`,
      );
    }

    return this.prisma.branch.create({
      data: {
        name: dto.name,
        location: dto.location,
        organizationId: context.organizationId,
      },
    });
  }

  async getBranch(id: string): Promise<Branch> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const branch = await this.prisma.branch.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }

    return branch;
  }

  async getBranches(): Promise<Branch[]> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    return this.prisma.branch.findMany({
      where: {
        organizationId: context.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Check if branch exists
    const branch = await this.getBranch(id);

    // If name is being updated, check uniqueness
    if (dto.name && dto.name !== branch.name) {
      const existing = await this.prisma.branch.findFirst({
        where: {
          organizationId: context.organizationId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Branch with name "${dto.name}" already exists in this organization`,
        );
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBranch(id: string): Promise<void> {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Check if branch exists
    await this.getBranch(id);

    // Prevent deletion if users are assigned
    const assignedUsers = await this.prisma.userBranchAssignment.count({
      where: { branchId: id },
    });

    if (assignedUsers > 0) {
      throw new BadRequestException(
        `Cannot delete branch "${id}" because ${assignedUsers} user(s) are assigned to it`,
      );
    }

    await this.prisma.branch.delete({
      where: { id },
    });
  }
}
