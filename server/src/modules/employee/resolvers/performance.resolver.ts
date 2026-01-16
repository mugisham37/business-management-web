import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { EmployeeService } from '../services/employee.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission, CurrentUser } from '../../auth/decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  PerformanceReviewType,
  EmployeeGoalType,
  PerformanceFeedbackType,
  PerformanceReviewConnection,
  EmployeeGoalConnection,
} from '../types/performance.types';
import {
  CreatePerformanceReviewInput,
  UpdatePerformanceReviewInput,
  CreateEmployeeGoalInput,
  UpdateEmployeeGoalInput,
  CreatePerformanceFeedbackInput,
  PerformanceReviewQueryInput,
  EmployeeGoalQueryInput,
} from '../inputs/performance.input';
import { Employee } from '../types/employee.types';

@Resolver(() => PerformanceReviewType)
@UseGuards(JwtAuthGuard, TenantGuard)
export class PerformanceResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly performanceService: PerformanceService,
    private readonly employeeService: EmployeeService,
  ) {
    super(dataLoaderService);
  }

  // Performance Review Operations
  @Query(() => PerformanceReviewType, { description: 'Get performance review by ID' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:read')
  async performanceReview(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<PerformanceReviewType> {
    // Mock implementation - in production, fetch from repository
    const review: PerformanceReviewType = {
      id,
      tenantId,
      employeeId: 'emp-1',
      reviewerId: 'emp-2',
      reviewPeriodStart: new Date('2024-01-01'),
      reviewPeriodEnd: new Date('2024-12-31'),
      status: 'completed' as any,
      overallRating: 'exceeds_expectations',
      strengths: 'Strong technical skills and team collaboration',
      areasForImprovement: 'Time management could be improved',
      goals: 'Lead a major project in Q1 2025',
      comments: 'Excellent performance overall',
      completedAt: new Date(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return review;
  }

  @Query(() => PerformanceReviewConnection, { description: 'List performance reviews with filtering' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:read')
  async performanceReviews(
    @Args('query', { nullable: true }) query: PerformanceReviewQueryInput,
  ): Promise<PerformanceReviewConnection> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    // Mock implementation - in production, fetch from repository
    return {
      reviews: [],
      total: 0,
      page,
      limit,
    };
  }

  @Mutation(() => PerformanceReviewType, { description: 'Create performance review' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:create')
  async createPerformanceReview(
    @Args('input') input: CreatePerformanceReviewInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PerformanceReviewType> {
    const review = await this.performanceService.createPerformanceReview(
      tenantId,
      input as any,
      user.id,
    );

    return review as any;
  }

  @Mutation(() => PerformanceReviewType, { description: 'Update performance review' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:update')
  async updatePerformanceReview(
    @Args('id') id: string,
    @Args('input') input: UpdatePerformanceReviewInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PerformanceReviewType> {
    const review = await this.performanceService.updatePerformanceReview(
      tenantId,
      id,
      input as any,
      user.id,
    );

    return review as any;
  }

  @Mutation(() => MutationResponse, { description: 'Complete performance review' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:update')
  async completePerformanceReview(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.performanceService.completePerformanceReview(tenantId, id, user.id);

      return {
        success: true,
        message: 'Performance review completed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to complete performance review',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  @Mutation(() => MutationResponse, { description: 'Acknowledge performance review' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:read')
  async acknowledgePerformanceReview(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.performanceService.acknowledgePerformanceReview(tenantId, id, user.id);

      return {
        success: true,
        message: 'Performance review acknowledged successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to acknowledge performance review',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  // Goal Management Operations
  @Query(() => EmployeeGoalType, { description: 'Get employee goal by ID' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:read')
  async employeeGoal(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType> {
    // Mock implementation - in production, fetch from repository
    const goal: EmployeeGoalType = {
      id,
      tenantId,
      employeeId: 'emp-1',
      title: 'Complete Project X',
      description: 'Lead and complete Project X by Q2',
      status: 'active' as any,
      priority: 'high' as any,
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-06-30'),
      progress: 50,
      lastReviewDate: new Date(),
      notes: 'On track',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return goal;
  }

  @Query(() => EmployeeGoalConnection, { description: 'List employee goals with filtering' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:read')
  async employeeGoals(
    @Args('query', { nullable: true }) query: EmployeeGoalQueryInput,
  ): Promise<EmployeeGoalConnection> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    // Mock implementation - in production, fetch from repository
    return {
      goals: [],
      total: 0,
      page,
      limit,
    };
  }

  @Mutation(() => EmployeeGoalType, { description: 'Create employee goal' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:create')
  async createEmployeeGoal(
    @Args('input') input: CreateEmployeeGoalInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType> {
    const goal = await this.performanceService.createEmployeeGoal(
      tenantId,
      input as any,
      user.id,
    );

    return goal as any;
  }

  @Mutation(() => EmployeeGoalType, { description: 'Update employee goal' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:update')
  async updateEmployeeGoal(
    @Args('id') id: string,
    @Args('input') input: UpdateEmployeeGoalInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType> {
    const goal = await this.performanceService.updateEmployeeGoal(
      tenantId,
      id,
      input as any,
      user.id,
    );

    return goal as any;
  }

  @Mutation(() => EmployeeGoalType, { description: 'Update goal progress' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:update')
  async updateGoalProgress(
    @Args('goalId') goalId: string,
    @Args('progress') progress: number,
    @Args('notes', { nullable: true }) notes: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType> {
    const goal = await this.performanceService.updateGoalProgress(
      tenantId,
      goalId,
      progress,
      user.id,
      notes,
    );

    return goal as any;
  }

  @Mutation(() => MutationResponse, { description: 'Complete employee goal' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:update')
  async completeEmployeeGoal(
    @Args('goalId') goalId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.performanceService.completeEmployeeGoal(tenantId, goalId, user.id);

      return {
        success: true,
        message: 'Goal completed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to complete goal',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  // Feedback Operations
  @Mutation(() => PerformanceFeedbackType, { description: 'Create performance feedback' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('performance:create')
  async createPerformanceFeedback(
    @Args('input') input: CreatePerformanceFeedbackInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<PerformanceFeedbackType> {
    // Mock implementation - in production, create feedback record
    const feedback: PerformanceFeedbackType = {
      id: `feedback-${Date.now()}`,
      tenantId,
      employeeId: input.employeeId,
      providedBy: input.isAnonymous ? 'anonymous' : user.id,
      feedbackDate: new Date(),
      feedbackType: input.feedbackType,
      content: input.content,
      isAnonymous: input.isAnonymous || false,
      isAcknowledged: false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return feedback;
  }

  // Field Resolvers
  @ResolveField(() => Employee, { nullable: true, description: 'Performance review reviewer' })
  async reviewer(
    @Parent() review: PerformanceReviewType,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee | null> {
    if (!review.reviewerId) return null;

    const loader = this.getDataLoader(
      'employee_by_id',
      async (ids: readonly string[]) => {
        const employees = await Promise.all(
          ids.map(id => this.employeeService.findEmployeeById(tenantId, id).catch(() => null))
        );
        return employees.map(emp => emp || new Error('Employee not found'));
      },
    );

    return loader.load(review.reviewerId) as any;
  }

  @ResolveField(() => [EmployeeGoalType], { description: 'Goals associated with review' })
  async goals(
    @Parent() _review: PerformanceReviewType,
  ): Promise<EmployeeGoalType[]> {
    // Mock implementation - in production, fetch goals for the review period
    return [];
  }
}
