import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { PickListService } from '../services/pick-list.service';
import { 
  PickListType,
  PickListConnection,
  CreatePickListInput,
  UpdatePickListInput,
  RecordPickInput,
} from '../types/pick-list.types';

@Resolver(() => PickListType)
@UseGuards(JwtAuthGuard)
export class PickListResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly pickListService: PickListService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => PickListType, { name: 'pickList' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getPickList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.pickListService.getPickList(tenantId, id);
  }

  @Query(() => PickListConnection, { name: 'pickLists' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getPickLists(
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('warehouseId', { type: () => ID, nullable: true }) warehouseId: string,
    @Args('status', { type: () => String, nullable: true }) status: string,
    @Args('assignedTo', { type: () => ID, nullable: true }) assignedTo: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const { limit } = this.parsePaginationArgs({ first, after });
    
    const result = await this.pickListService.getPickLists(tenantId, {
      warehouseId,
      status,
      assignedTo,
      page: 1,
      limit,
    });
    
    return {
      edges: this.createEdges(result.pickLists, pl => pl.id),
      pageInfo: this.createPageInfo(
        result.page < result.totalPages,
        result.page > 1,
        result.pickLists[0]?.id,
        result.pickLists[result.pickLists.length - 1]?.id,
      ),
      totalCount: result.total,
    };
  }

  @Mutation(() => PickListType, { name: 'createPickList' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createPickList(
    @Args('input') input: CreatePickListInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.pickListService.createPickList(tenantId, input, user.id);
  }

  @Mutation(() => PickListType, { name: 'assignPickList' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async assignPickList(
    @Args('id', { type: () => ID }) id: string,
    @Args('pickerId', { type: () => ID }) pickerId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const pickList = await this.pickListService.updatePickList(tenantId, id, {
      assignedTo: pickerId,
      status: 'assigned' as any,
    }, user.id);

    // Publish subscription event
    this.pubSub.publish('PICK_LIST_ASSIGNED', {
      pickListAssigned: { ...pickList, tenantId },
    });

    return pickList;
  }

  @Mutation(() => PickListType, { name: 'recordPick' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async recordPick(
    @Args('pickListId', { type: () => ID }) pickListId: string,
    @Args('input') input: RecordPickInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.pickListService.recordPick(tenantId, pickListId, input, user.id);
  }

  @Mutation(() => PickListType, { name: 'completePickList' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async completePickList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const pickList = await this.pickListService.updatePickList(tenantId, id, {
      status: 'completed' as any,
    }, user.id);

    // Publish subscription event
    this.pubSub.publish('PICK_LIST_COMPLETED', {
      pickListCompleted: { ...pickList, tenantId },
    });

    return pickList;
  }

  @Subscription(() => PickListType, {
    name: 'pickListAssigned',
    filter: (payload, variables, context) => {
      return payload.pickListAssigned.tenantId === context.req.user.tenantId;
    },
  })
  pickListAssigned(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('PICK_LIST_ASSIGNED');
  }

  @Subscription(() => PickListType, {
    name: 'pickListCompleted',
    filter: (payload, variables, context) => {
      return payload.pickListCompleted.tenantId === context.req.user.tenantId;
    },
  })
  pickListCompleted(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('PICK_LIST_COMPLETED');
  }
}
