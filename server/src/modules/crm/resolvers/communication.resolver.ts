import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CommunicationService, CreateCommunicationDto, ScheduleCommunicationDto } from '../services/communication.service';
import { CustomerService } from '../services/customer.service';
import { CommunicationType } from '../types/communication.types';
import { Customer } from '../entities/customer.entity';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { SUBSCRIPTION_EVENTS } from '../../../common/graphql/pubsub.service';

@Resolver(() => CommunicationType)
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommunicationResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly communicationService: CommunicationService,
    private readonly customerService: CustomerService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [CommunicationType])
  @UseGuards(PermissionsGuard)
  @Permissions('communications:read')
  async getCommunications(
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('type', { nullable: true }) type?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @CurrentTenant() tenantId?: string,
  ): Promise<CommunicationType[]> {
    return this.communicationService.getCommunications(
      tenantId!,
      customerId,
      employeeId,
      type,
      startDate,
      endDate,
    );
  }

  @Query(() => [CommunicationType])
  @UseGuards(PermissionsGuard)
  @Permissions('communications:read')
  async getCommunicationTimeline(
    @Args('customerId', { type: () => ID }) customerId: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit: number,
    @CurrentTenant() tenantId: string,
  ): Promise<CommunicationType[]> {
    return this.communicationService.getCommunicationTimeline(tenantId, customerId, limit);
  }

  @Mutation(() => CommunicationType)
  @UseGuards(PermissionsGuard)
  @Permissions('communications:create')
  async recordCommunication(
    @Args('input') input: CreateCommunicationDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<CommunicationType> {
    return this.communicationService.recordCommunication(tenantId, input, user.id);
  }

  @Mutation(() => CommunicationType)
  @UseGuards(PermissionsGuard)
  @Permissions('communications:create')
  async scheduleCommunication(
    @Args('input') input: ScheduleCommunicationDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<CommunicationType> {
    return this.communicationService.scheduleCommunication(tenantId, input, user.id);
  }

  @Subscription(() => CommunicationType, {
    filter: (payload, variables, context) => {
      // Filter by tenant
      return payload.communicationScheduled.tenantId === context.req.user.tenantId;
    },
  })
  communicationScheduled(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator(SUBSCRIPTION_EVENTS.COMMUNICATION_SCHEDULED);
  }

  @ResolveField(() => Customer)
  async customer(
    @Parent() communication: CommunicationType,
    @CurrentTenant() tenantId: string,
  ): Promise<Customer> {
    const loader = this.getDataLoader<string, Customer>(
      `customer_by_id_${tenantId}`,
      async (customerIds: readonly string[]) => {
        const customers = await Promise.all(
          [...customerIds].map(id => 
            this.customerService.findById(tenantId, id).catch(() => null)
          )
        );
        return customers.map(c => c || new Error('Customer not found'));
      },
    );

    return loader.load(communication.customerId);
  }

  @ResolveField(() => Object, { nullable: true })
  async employee(
    @Parent() communication: CommunicationType,
    @CurrentTenant() tenantId: string,
  ): Promise<any | null> {
    if (!communication.employeeId) {
      return null;
    }

    // Load employee using DataLoader
    const loader = this.getDataLoader<string, any>(
      `employee_by_id_${tenantId}`,
      async (employeeIds: readonly string[]) => {
        // This would call the employee service
        // For now, return mock data
        return employeeIds.map(id => ({ id, name: 'Employee' }));
      },
    );

    return loader.load(communication.employeeId);
  }
}
