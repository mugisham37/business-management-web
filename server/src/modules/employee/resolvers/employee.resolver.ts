import { Resolver, Query, Mutation, Args, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
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
import { Employee, EmployeeConnection } from '../types/employee.types';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeQueryInput } from '../inputs/employee.input';

@Resolver(() => Employee)
@UseGuards(JwtAuthGuard, TenantGuard)
export class EmployeeResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly employeeService: EmployeeService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Employee, { description: 'Get employee by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employee(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    return this.employeeService.findEmployeeById(tenantId, id);
  }

  @Query(() => EmployeeConnection, { description: 'List employees with filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:read')
  async employees(
    @Args('query', { nullable: true }) query: EmployeeQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<EmployeeConnection> {
    const result = await this.employeeService.findEmployees(tenantId, query || {});
    return result;
  }

  @Mutation(() => Employee, { description: 'Create a new employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:create')
  async createEmployee(
    @Args('input') input: CreateEmployeeInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    return this.employeeService.createEmployee(tenantId, input as any, user.id);
  }

  @Mutation(() => Employee, { description: 'Update an employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:update')
  async updateEmployee(
    @Args('id') id: string,
    @Args('input') input: UpdateEmployeeInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee> {
    return this.employeeService.updateEmployee(tenantId, id, input as any, user.id);
  }

  @Mutation(() => MutationResponse, { description: 'Terminate an employee' })
  @UseGuards(PermissionsGuard)
  @Permissions('employees:delete')
  async terminateEmployee(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.employeeService.deleteEmployee(tenantId, id, user.id);
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

    return loader.load(employee.managerId);
  }

  @ResolveField(() => [Employee], { description: 'Direct reports' })
  async directReports(
    @Parent() employee: Employee,
    @CurrentTenant() tenantId: string,
  ): Promise<Employee[]> {
    const result = await this.employeeService.findEmployees(tenantId, {
      managerId: employee.id,
    } as any);
    return result.employees;
  }

  @Subscription(() => Employee, {
    description: 'Subscribe to employee status changes',
    filter: (payload, variables, context) => {
      return payload.employeeStatusChanged.tenantId === context.req.user.tenantId;
    },
  })
  employeeStatusChanged(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('EMPLOYEE_STATUS_CHANGED');
  }
}
