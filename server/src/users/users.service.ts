import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { User, UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { UserRole } from '../tenant/tenant-context.interface';
import { AuditService } from '../audit/audit.service';
import { hashPassword } from '../common/utils/password.util';
import { CreateOwnerDto, CreateManagerDto, CreateWorkerDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create an Owner user (used during organization registration)
   * Requirements: 1.7
   */
  async createOwner(dto: CreateOwnerDto): Promise<User> {
    // Check email uniqueness within organization
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email_organizationId: {
          email: dto.email,
          organizationId: dto.organizationId,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists in this organization',
      );
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Create owner user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: PrismaUserRole.OWNER,
        organizationId: dto.organizationId,
        emailVerified: false,
        createdById: null, // Owner has no creator
      },
    });

    return user;
  }

  /**
   * Get user by ID
   * Requirements: 1.5
   */
  async getUserById(userId: string, organizationId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
      include: {
        branchAssignments: {
          include: {
            branch: true,
          },
        },
        deptAssignments: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  /**
   * Get user by email within organization
   * Requirements: 1.5
   */
  async getUserByEmail(email: string, organizationId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
      include: {
        branchAssignments: {
          include: {
            branch: true,
          },
        },
        deptAssignments: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  /**
   * Update user information
   * Requirements: 1.7
   */
  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const organizationId = this.tenantContext.getOrganizationId();

    // Verify user exists
    await this.getUserById(userId, organizationId);

    // Update user
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });

    return user;
  }

  /**
   * Delete user
   * Requirements: 1.7
   */
  async deleteUser(userId: string): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();

    // Verify user exists
    const user = await this.getUserById(userId, organizationId);

    // Prevent deletion of Owner users (handled by ownership transfer)
    if (user.role === PrismaUserRole.OWNER) {
      throw new BadRequestException(
        'Cannot delete Owner user. Transfer ownership first.',
      );
    }

    // Delete user (cascading deletes will handle related records)
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Create a Manager user (requires Owner role)
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   */
  async createManager(creatorId: string, dto: CreateManagerDto): Promise<User> {
    const organizationId = this.tenantContext.getOrganizationId();

    // Verify creator exists and has Owner role
    const creator = await this.getUserById(creatorId, organizationId);
    if (creator.role !== PrismaUserRole.OWNER) {
      throw new BadRequestException('Only Owners can create Managers');
    }

    // Validate that at least one branch or department is assigned
    if (
      (!dto.branchIds || dto.branchIds.length === 0) &&
      (!dto.departmentIds || dto.departmentIds.length === 0)
    ) {
      throw new BadRequestException(
        'Manager must be assigned to at least one Branch or Department',
      );
    }

    // Check email uniqueness within organization
    const existingUser = await this.getUserByEmail(dto.email, organizationId);
    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists in this organization',
      );
    }

    // Create manager user in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: PrismaUserRole.MANAGER,
          organizationId,
          createdById: creatorId,
          emailVerified: false,
          passwordHash: null, // Will be set when user accepts invitation
        },
      });

      // Assign branches
      if (dto.branchIds && dto.branchIds.length > 0) {
        await tx.userBranchAssignment.createMany({
          data: dto.branchIds.map((branchId) => ({
            userId: newUser.id,
            branchId,
          })),
        });
      }

      // Assign departments
      if (dto.departmentIds && dto.departmentIds.length > 0) {
        await tx.userDepartmentAssignment.createMany({
          data: dto.departmentIds.map((departmentId) => ({
            userId: newUser.id,
            departmentId,
          })),
        });
      }

      return newUser;
    });

    // Log user creation
    await this.auditService.logUserCreation(creatorId, user.id, UserRole.MANAGER);

    // TODO: Send invitation email (will be implemented in email service)
    // await this.emailService.sendInvitationEmail(user.email, invitationToken);

    return user;
  }

  /**
   * Create a Worker user (requires Owner or Manager role)
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7
   */
  async createWorker(creatorId: string, dto: CreateWorkerDto): Promise<User> {
    const organizationId = this.tenantContext.getOrganizationId();

    // Verify creator exists and has Owner or Manager role
    const creator = await this.getUserById(creatorId, organizationId);
    if (creator.role === PrismaUserRole.WORKER) {
      throw new BadRequestException('Workers cannot create other users');
    }

    // Check email uniqueness within organization
    const existingUser = await this.getUserByEmail(dto.email, organizationId);
    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists in this organization',
      );
    }

    // Get creator's branch and department assignments for inheritance
    const creatorWithScope = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        branchAssignments: true,
        deptAssignments: true,
      },
    });

    if (!creatorWithScope) {
      throw new NotFoundException('Creator not found');
    }

    // Create worker user in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: PrismaUserRole.WORKER,
          organizationId,
          createdById: creatorId,
          emailVerified: false,
          passwordHash: null, // Will be set when user accepts invitation
        },
      });

      // Inherit branches from creator
      if (creatorWithScope.branchAssignments.length > 0) {
        await tx.userBranchAssignment.createMany({
          data: creatorWithScope.branchAssignments.map((assignment) => ({
            userId: newUser.id,
            branchId: assignment.branchId,
          })),
        });
      }

      // Inherit departments from creator
      if (creatorWithScope.deptAssignments.length > 0) {
        await tx.userDepartmentAssignment.createMany({
          data: creatorWithScope.deptAssignments.map((assignment) => ({
            userId: newUser.id,
            departmentId: assignment.departmentId,
          })),
        });
      }

      return newUser;
    });

    // Log user creation
    await this.auditService.logUserCreation(creatorId, user.id, UserRole.WORKER);

    // TODO: Send invitation email (will be implemented in email service)
    // await this.emailService.sendInvitationEmail(user.email, invitationToken);

    return user;
  }

  /**
   * Assign branches to a user
   * Requirements: 6.6, 8.3
   */
  async assignBranches(userId: string, branchIds: string[]): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();
    const currentUserId = this.tenantContext.getUserId();

    // Verify user exists
    await this.getUserById(userId, organizationId);

    // Verify all branches exist and belong to the organization
    const branches = await this.prisma.branch.findMany({
      where: {
        id: { in: branchIds },
        organizationId,
      },
    });

    if (branches.length !== branchIds.length) {
      throw new BadRequestException('One or more branches not found');
    }

    // Remove existing assignments and create new ones in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Remove existing branch assignments
      await tx.userBranchAssignment.deleteMany({
        where: { userId },
      });

      // Create new assignments
      if (branchIds.length > 0) {
        await tx.userBranchAssignment.createMany({
          data: branchIds.map((branchId) => ({
            userId,
            branchId,
          })),
        });
      }
    });

    // Log scope changes
    for (const branchId of branchIds) {
      await this.auditService.logScopeChange(userId, 'BRANCH', branchId, 'ASSIGN');
    }
  }

  /**
   * Assign departments to a user
   * Requirements: 6.6, 8.4
   */
  async assignDepartments(userId: string, departmentIds: string[]): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();
    const currentUserId = this.tenantContext.getUserId();

    // Verify user exists
    await this.getUserById(userId, organizationId);

    // Verify all departments exist and belong to the organization
    const departments = await this.prisma.department.findMany({
      where: {
        id: { in: departmentIds },
        organizationId,
      },
    });

    if (departments.length !== departmentIds.length) {
      throw new BadRequestException('One or more departments not found');
    }

    // Remove existing assignments and create new ones in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Remove existing department assignments
      await tx.userDepartmentAssignment.deleteMany({
        where: { userId },
      });

      // Create new assignments
      if (departmentIds.length > 0) {
        await tx.userDepartmentAssignment.createMany({
          data: departmentIds.map((departmentId) => ({
            userId,
            departmentId,
          })),
        });
      }
    });

    // Log scope changes
    for (const departmentId of departmentIds) {
      await this.auditService.logScopeChange(
        userId,
        'DEPARTMENT',
        departmentId,
        'ASSIGN',
      );
    }
  }

  /**
   * Get user's scope (branches and departments)
   * Requirements: 6.7, 8.3, 8.4
   */
  async getUserScope(userId: string): Promise<{
    branches: any[];
    departments: any[];
  }> {
    const organizationId = this.tenantContext.getOrganizationId();

    // Verify user exists
    await this.getUserById(userId, organizationId);

    // Get branch assignments
    const branchAssignments = await this.prisma.userBranchAssignment.findMany({
      where: { userId },
      include: {
        branch: true,
      },
    });

    // Get department assignments
    const departmentAssignments = await this.prisma.userDepartmentAssignment.findMany({
      where: { userId },
      include: {
        department: true,
      },
    });

    return {
      branches: branchAssignments.map((assignment) => assignment.branch),
      departments: departmentAssignments.map((assignment) => assignment.department),
    };
  }
}
