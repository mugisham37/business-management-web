import { Resolver, Query, Mutation, Args, ResolveField, Parent, Subscription, ID, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { EmployeeService } from '../services/employee.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import { 
  Employee, 
  EmployeeConnection, 
  EmployeeScheduleType, 
  TimeEntryType, 
  TrainingRecordType, 
  EmployeeGoalType 
} from '../types/employee.types';
import { 
  CreateEmployeeInput, 
  UpdateEmployeeInput, 
  EmployeeQueryInput,
  CreateEmployeeScheduleInput,
  UpdateEmployeeScheduleInput,
  CreateTimeEntryInput,
  ClockInInput,
  ClockOutInput,
  TimeEntryQueryInput,
  CreateTrainingRecordInput,
  UpdateTrainingRecordInput,
  CreateEmployeeGoalInput,
  UpdateEmployeeGoalInput
} from '../inputs/employee.input';

@Resolver(() => Employee)
@UseGuards(JwtAuthGuard, TenantGuard)
export class EmployeeEnhancedResolver extends BaseResolver {
  constructor(
    override readonly dataLoaderService: DataLoaderService,
    private readonly employeeService: EmployeeService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {
    super(dataLoaderService);
  }

  // ==================== SUBSCRIPTION HELPERS ====================

  /**
   * Safe async iterator wrapper for RedisPubSub
   * Handles type compatibility issues with PubSub implementation
   */
  private subscribeToEvent<T>(triggerName: string): AsyncIterableIterator<T> {
    return (this.pubSub as any).asyncIterator(triggerName);
  }

  // ==================== EMPLOYEE CRUD ====================
  
  @Query(() => Employee, { description: 'Get employee by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employee(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    return this.employeeService.findEmployeeById(tenantId, id) as any;
  }

  @Query(() => Employee, { description: 'Get employee by employee number' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employeeByNumber(
    @Args('employeeNumber') employeeNumber: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    return this.employeeService.findEmployeeByNumber(tenantId, employeeNumber) as any;
  }

  @Query(() => EmployeeConnection, { description: 'List employees with filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employees(
    @Args('query', { nullable: true }) query: EmployeeQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeConnection> {
    const result = await this.employeeService.findEmployees(tenantId, query || {});
    return {
      employees: result.employees as any,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Mutation(() => Employee, { description: 'Create a new employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:create')
  async createEmployee(
    @Args('input') input: CreateEmployeeInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    const employee = await this.employeeService.createEmployee(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_CREATED', {
      employeeCreated: employee,
      tenantId,
    });

    return employee as any;
  }

  @Mutation(() => Employee, { description: 'Update an employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    const employee = await this.employeeService.updateEmployee(tenantId, id, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_UPDATED', {
      employeeUpdated: employee,
      tenantId,
    });

    return employee as any;
  }

  @Mutation(() => MutationResponse, { description: 'Terminate an employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:delete')
  async terminateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.employeeService.deleteEmployee(tenantId, id, user.id);
      
      // Publish to subscription
      this.pubSub.publish('EMPLOYEE_TERMINATED', {
        employeeTerminated: { id, tenantId },
        tenantId,
      });

      return {
        success: true,
        message: 'Employee terminated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to terminate employee',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  // ==================== SCHEDULE OPERATIONS ====================
  
  @Query(() => [EmployeeScheduleType], { description: 'Get employee schedules' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employeeSchedules(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @CurrentTenant() tenantId?: string,
  ): Promise<EmployeeScheduleType[]> {
    return this.employeeService.findSchedulesByEmployee(tenantId!, employeeId, startDate, endDate) as any;
  }

  @Mutation(() => EmployeeScheduleType, { description: 'Create employee schedule' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async createEmployeeSchedule(
    @Args('input') input: CreateEmployeeScheduleInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeScheduleType> {
    const schedule = await this.employeeService.createSchedule(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_SCHEDULE_CREATED', {
      employeeScheduleCreated: schedule,
      tenantId,
    });

    return schedule as any;
  }

  @Mutation(() => EmployeeScheduleType, { description: 'Update employee schedule' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async updateEmployeeSchedule(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeScheduleInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeScheduleType> {
    const schedule = await this.employeeService.updateSchedule(tenantId, id, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_SCHEDULE_UPDATED', {
      employeeScheduleUpdated: schedule,
      tenantId,
    });

    return schedule as any;
  }

  // ==================== TIME ENTRY OPERATIONS ====================
  
  @Query(() => [TimeEntryType], { description: 'Get time entries' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async timeEntries(
    @Args('query', { nullable: true }) query: TimeEntryQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<TimeEntryType[]> {
    const result = await this.employeeService.findTimeEntries(tenantId, query || {});
    return result.timeEntries as any;
  }

  @Mutation(() => TimeEntryType, { description: 'Clock in employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async clockIn(
    @Args('input') input: ClockInInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<TimeEntryType> {
    const timeEntry = await this.employeeService.clockIn(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_CLOCKED_IN', {
      employeeClockedIn: timeEntry,
      tenantId,
    });

    return timeEntry as any;
  }

  @Mutation(() => TimeEntryType, { description: 'Clock out employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async clockOut(
    @Args('input') input: ClockOutInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<TimeEntryType> {
    const timeEntry = await this.employeeService.clockOut(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('EMPLOYEE_CLOCKED_OUT', {
      employeeClockedOut: timeEntry,
      tenantId,
    });

    return timeEntry as any;
  }

  @Mutation(() => TimeEntryType, { description: 'Approve time entry' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:approve')
  async approveTimeEntry(
    @Args('timeEntryId', { type: () => ID }) timeEntryId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<TimeEntryType> {
    const timeEntry = await this.employeeService.approveTimeEntry(tenantId, timeEntryId, user.id);
    
    // Publish to subscription
    this.pubSub.publish('TIME_ENTRY_APPROVED', {
      timeEntryApproved: timeEntry,
      tenantId,
    });

    return timeEntry as any;
  }

  // ==================== TRAINING OPERATIONS ====================
  
  @Query(() => [TrainingRecordType], { description: 'Get employee training records' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employeeTraining(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<TrainingRecordType[]> {
    return this.employeeService.findTrainingRecordsByEmployee(tenantId, employeeId) as any;
  }

  @Mutation(() => TrainingRecordType, { description: 'Create training record' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async createTrainingRecord(
    @Args('input') input: CreateTrainingRecordInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<TrainingRecordType> {
    const training = await this.employeeService.createTrainingRecord(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('TRAINING_CREATED', {
      trainingCreated: training,
      tenantId,
    });

    return training as any;
  }

  // ==================== GOAL OPERATIONS ====================
  
  @Query(() => [EmployeeGoalType], { description: 'Get employee goals' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employeeGoals(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType[]> {
    return this.employeeService.findGoalsByEmployee(tenantId, employeeId) as any;
  }

  @Mutation(() => EmployeeGoalType, { description: 'Create employee goal' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async createEmployeeGoal(
    @Args('input') input: CreateEmployeeGoalInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType> {
    const goal = await this.employeeService.createEmployeeGoal(tenantId, input as any, user.id);
    
    // Publish to subscription
    this.pubSub.publish('GOAL_CREATED', {
      goalCreated: goal,
      tenantId,
    });

    return goal as any;
  }

  // ==================== ANALYTICS OPERATIONS ====================
  
  @Query(() => Object, { description: 'Get employee analytics' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read', 'analytics:read')
  async employeeAnalytics(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.employeeService.getEmployeeAnalytics(tenantId, employeeId, startDate, endDate);
  }

  // ==================== FIELD RESOLVERS ====================
  
  @ResolveField(() => Employee, { nullable: true, description: 'Employee manager' })
  async manager(
    @Parent() employee: Employee,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee | null> {
    if (!employee.managerId) return null;

    const loader = this.getDataLoader(
      'employee_by_id',
      async (ids: readonly string[]) => {
        const employees = await Promise.all(
          ids.map(id => this.employeeService.findEmployeeById(tenantId, id).catch(() => null))
        );
        return employees.map(emp => emp || new Error('Employee not found'));
      },
    );

    return loader.load(employee.managerId) as any;
  }

  @ResolveField(() => [Employee], { description: 'Direct reports' })
  async directReports(
    @Parent() employee: Employee,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee[]> {
    const result = await this.employeeService.findEmployees(tenantId, {
      managerId: employee.id,
    } as any);
    return result.employees as any;
  }

  @ResolveField(() => [EmployeeScheduleType], { description: 'Employee schedules' })
  async schedules(
    @Parent() employee: Employee,
    @Args('startDate', { nullable: true }) startDate: Date | undefined,
    @Args('endDate', { nullable: true }) endDate: Date | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeScheduleType[]> {
    return this.employeeService.findSchedulesByEmployee(tenantId, employee.id, startDate, endDate) as any;
  }

  @ResolveField(() => [TimeEntryType], { description: 'Employee time entries' })
  async timeEntriesForEmployee(
    @Parent() employee: Employee,
    @Args('startDate', { nullable: true }) startDate: string | undefined,
    @Args('endDate', { nullable: true }) endDate: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<TimeEntryType[]> {
    const result = await this.employeeService.findTimeEntries(tenantId, {
      employeeId: employee.id,
      startDate,
      endDate,
    } as any);
    return result.timeEntries as any;
  }

  @ResolveField(() => [TrainingRecordType], { description: 'Employee training records' })
  async training(
    @Parent() employee: Employee,
    @CurrentTenant() tenantId: string,
  ): Promise<TrainingRecordType[]> {
    return this.employeeService.findTrainingRecordsByEmployee(tenantId, employee.id) as any;
  }

  @ResolveField(() => [EmployeeGoalType], { description: 'Employee goals' })
  async goals(
    @Parent() employee: Employee,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeGoalType[]> {
    return this.employeeService.findGoalsByEmployee(tenantId, employee.id) as any;
  }

  // ==================== SUBSCRIPTIONS ====================
  
  @Subscription(() => Employee, {
    description: 'Subscribe to employee creation events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeCreated() {
    return this.subscribeToEvent<Employee>('EMPLOYEE_CREATED');
  }

  @Subscription(() => Employee, {
    description: 'Subscribe to employee update events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeUpdated() {
    return this.subscribeToEvent<Employee>('EMPLOYEE_UPDATED');
  }

  @Subscription(() => Object, {
    description: 'Subscribe to employee termination events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeTerminated() {
    return this.subscribeToEvent<Object>('EMPLOYEE_TERMINATED');
  }

  @Subscription(() => TimeEntryType, {
    description: 'Subscribe to employee clock in events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeClockedIn() {
    return this.subscribeToEvent<TimeEntryType>('EMPLOYEE_CLOCKED_IN');
  }

  @Subscription(() => TimeEntryType, {
    description: 'Subscribe to employee clock out events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeClockedOut() {
    return this.subscribeToEvent<TimeEntryType>('EMPLOYEE_CLOCKED_OUT');
  }

  @Subscription(() => TimeEntryType, {
    description: 'Subscribe to time entry approval events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  timeEntryApproved() {
    return this.subscribeToEvent<TimeEntryType>('TIME_ENTRY_APPROVED');
  }

  @Subscription(() => EmployeeScheduleType, {
    description: 'Subscribe to schedule creation events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeScheduleCreated() {
    return this.subscribeToEvent<EmployeeScheduleType>('EMPLOYEE_SCHEDULE_CREATED');
  }

  @Subscription(() => EmployeeScheduleType, {
    description: 'Subscribe to schedule update events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  employeeScheduleUpdated() {
    return this.subscribeToEvent<EmployeeScheduleType>('EMPLOYEE_SCHEDULE_UPDATED');
  }

  @Subscription(() => TrainingRecordType, {
    description: 'Subscribe to training creation events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  trainingCreated() {
    return this.subscribeToEvent<TrainingRecordType>('TRAINING_CREATED');
  }

  @Subscription(() => EmployeeGoalType, {
    description: 'Subscribe to goal creation events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  goalCreated() {
    return this.subscribeToEvent<EmployeeGoalType>('GOAL_CREATED');
  }
}
