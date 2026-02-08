import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Department } from '@prisma/client';

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Departments Service for department management
 * 
 * Features:
 * - Department CRUD operations
 * - Organization-scoped department queries
 * - Department deletion with user assignment checks
 * 
 * Requirements: 20.1, 20.4
 */
@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new department for an organization
   * 
   * @param organizationId - Organization ID
   * @param dto - Department creation data
   * @returns Created department
   * 
   * Requirement 20.1: WHEN a department is created, THE Auth_System SHALL associate it with the organization
   */
  async create(organizationId: string, dto: CreateDepartmentDto): Promise<Department> {
    try {
      // Check if department code already exists in organization
      const existing = await this.prisma.department.findUnique({
        where: {
          organizationId_code: {
            organizationId,
            code: dto.code,
          },
        },
      });

      if (existing) {
        throw new ForbiddenException(`Department code '${dto.code}' already exists in this organization`);
      }

      const department = await this.prisma.department.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          description: dto.description,
        },
      });

      this.logger.log(`Department created: ${department.id} (${department.code}) for organization ${organizationId}`);

      return department;
    } catch (error) {
      this.logger.error('Failed to create department:', error);
      throw error;
    }
  }

  /**
   * Find department by ID within organization context
   * 
   * @param id - Department ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Department or null
   */
  async findById(id: string, organizationId: string): Promise<Department | null> {
    try {
      return await this.prisma.department.findFirst({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find department by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all departments for an organization
   * 
   * @param organizationId - Organization ID
   * @param includeInactive - Whether to include inactive departments
   * @returns Array of departments
   */
  async findByOrganization(organizationId: string, includeInactive = false): Promise<Department[]> {
    try {
      return await this.prisma.department.findMany({
        where: {
          organizationId,
          ...(includeInactive ? {} : { isActive: true }),
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find departments for organization: ${organizationId}`, error);
      throw error;
    }
  }

  /**
   * Update department
   * 
   * @param id - Department ID
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Update data
   * @returns Updated department
   */
  async update(id: string, organizationId: string, dto: UpdateDepartmentDto): Promise<Department> {
    try {
      // Verify department exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Department not found: ${id}`);
      }

      // If code is being changed, check for conflicts
      if (dto.code && dto.code !== existing.code) {
        const codeExists = await this.prisma.department.findUnique({
          where: {
            organizationId_code: {
              organizationId,
              code: dto.code,
            },
          },
        });

        if (codeExists) {
          throw new ForbiddenException(`Department code '${dto.code}' already exists in this organization`);
        }
      }

      const department = await this.prisma.department.update({
        where: { id },
        data: dto,
      });

      this.logger.log(`Department updated: ${id}`);

      return department;
    } catch (error) {
      this.logger.error(`Failed to update department: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete department
   * 
   * Requirement 20.4: WHEN a department is deleted, THE Auth_System SHALL require reassignment of all users in that department
   * 
   * This method checks if any users are assigned to the department before allowing deletion.
   * If users are assigned, it throws an error requiring reassignment first.
   * 
   * @param id - Department ID
   * @param organizationId - Organization ID for tenant isolation
   * @throws ForbiddenException if users are assigned to the department
   */
  async delete(id: string, organizationId: string): Promise<void> {
    try {
      // Verify department exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Department not found: ${id}`);
      }

      // Check if any users are assigned to this department
      const usersCount = await this.prisma.user.count({
        where: {
          departmentId: id,
        },
      });

      if (usersCount > 0) {
        throw new ForbiddenException(
          `Cannot delete department: ${usersCount} user(s) are assigned to this department. ` +
          `Please reassign users before deleting the department.`
        );
      }

      // Check if any roles are scoped to this department
      const rolesCount = await this.prisma.userRole.count({
        where: {
          departmentId: id,
        },
      });

      if (rolesCount > 0) {
        throw new ForbiddenException(
          `Cannot delete department: ${rolesCount} role assignment(s) are scoped to this department. ` +
          `Please remove or reassign role scopes before deleting the department.`
        );
      }

      // Check if any permissions are scoped to this department
      const permissionsCount = await this.prisma.userPermission.count({
        where: {
          departmentId: id,
        },
      });

      if (permissionsCount > 0) {
        throw new ForbiddenException(
          `Cannot delete department: ${permissionsCount} permission(s) are scoped to this department. ` +
          `Please remove or reassign permission scopes before deleting the department.`
        );
      }

      // Safe to delete - no dependencies
      await this.prisma.department.delete({
        where: { id },
      });

      this.logger.log(`Department deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete department: ${id}`, error);
      throw error;
    }
  }
}
