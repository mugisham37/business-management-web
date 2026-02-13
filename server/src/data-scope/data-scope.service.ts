import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { UserRole } from '../tenant/tenant-context.interface';

interface UserScope {
  branches: { id: string; name: string; location: string | null }[];
  departments: { id: string; name: string; description: string | null }[];
}

@Injectable()
export class DataScopeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Apply scope-based filtering to a query based on user's role and assignments
   * - Owners: No filtering (see all organization data)
   * - Managers/Workers: Filter by assigned branches and departments
   * 
   * @param baseQuery - The base Prisma query object to apply filters to
   * @returns The query object with scope filters applied
   */
  async applyScopeFilter<T extends { where?: any }>(
    baseQuery: T,
  ): Promise<T> {
    const context = this.tenantContext.getTenantContext();

    // Owners bypass all scope filtering - they see all organization data
    if (context.role === UserRole.OWNER) {
      return baseQuery;
    }

    // For Managers and Workers, apply scope filtering
    const userScope = await this.getUserScope(context.userId);

    // Initialize where clause if it doesn't exist
    if (!baseQuery.where) {
      baseQuery.where = {};
    }

    // Build scope filter conditions
    const scopeConditions: any[] = [];

    // Add branch filtering if user has branch assignments
    if (userScope.branches.length > 0) {
      scopeConditions.push({
        branchId: {
          in: userScope.branches.map((b) => b.id),
        },
      });
    }

    // Add department filtering if user has department assignments
    if (userScope.departments.length > 0) {
      scopeConditions.push({
        departmentId: {
          in: userScope.departments.map((d) => d.id),
        },
      });
    }

    // Apply scope conditions using OR logic (user can access data from any assigned branch OR department)
    if (scopeConditions.length > 0) {
      // If there's already an OR condition, merge with it
      if (baseQuery.where.OR) {
        baseQuery.where.OR = [
          ...baseQuery.where.OR,
          ...scopeConditions,
        ];
      } else {
        baseQuery.where.OR = scopeConditions;
      }
    }

    return baseQuery;
  }

  /**
   * Get the scope (branches and departments) for a specific user
   * @param userId - The user ID to get scope for
   * @returns UserScope containing branches and departments
   */
  private async getUserScope(userId: string): Promise<UserScope> {
    // Get branch assignments
    const branchAssignments = await this.prisma.userBranchAssignment.findMany({
      where: { userId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    // Get department assignments
    const departmentAssignments =
      await this.prisma.userDepartmentAssignment.findMany({
        where: { userId },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

    return {
      branches: branchAssignments.map((assignment) => assignment.branch),
      departments: departmentAssignments.map(
        (assignment) => assignment.department,
      ),
    };
  }
}
