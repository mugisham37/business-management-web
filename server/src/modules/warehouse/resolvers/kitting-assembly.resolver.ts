import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { KittingAssemblyService } from '../services/kitting-assembly.service';
import { 
  KitDefinitionType,
  KitDefinitionConnection,
  AssemblyWorkOrderType,
  AssemblyWorkOrderConnection,
  CreateKitInput,
  UpdateKitInput,
  CreateAssemblyWorkOrderInput,
  UpdateAssemblyWorkOrderInput,
} from '../types/kitting-assembly.types';

@Resolver(() => KitDefinitionType)
@UseGuards(JwtAuthGuard)
export class KittingAssemblyResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly kittingAssemblyService: KittingAssemblyService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => KitDefinitionType, { name: 'kitDefinition' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getKitDefinition(
    @Args('kitId', { type: () => ID }) kitId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.getKit(tenantId, kitId);
  }

  @Query(() => KitDefinitionConnection, { name: 'kitDefinitions' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getKitDefinitions(
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('kitType', { type: () => String, nullable: true }) kitType: string,
    @Args('isActive', { type: () => Boolean, nullable: true }) isActive: boolean,
    @Args('search', { type: () => String, nullable: true }) search: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const { limit } = this.parsePaginationArgs({ first, after });
    
    const result = await this.kittingAssemblyService.getKits(tenantId, {
      kitType,
      isActive,
      search,
      page: 1,
      limit,
    });
    
    return {
      edges: this.createEdges(result.kits, kit => kit.kitId),
      pageInfo: this.createPageInfo(
        result.page < result.totalPages,
        result.page > 1,
        result.kits[0]?.kitId,
        result.kits[result.kits.length - 1]?.kitId,
      ),
      totalCount: result.total,
    };
  }

  @Mutation(() => KitDefinitionType, { name: 'createKit' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createKit(
    @Args('input') input: CreateKitInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.createKit(tenantId, {
      tenantId,
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => KitDefinitionType, { name: 'updateKit' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async updateKit(
    @Args('kitId', { type: () => ID }) kitId: string,
    @Args('input') input: UpdateKitInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.updateKit(tenantId, kitId, {
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => Boolean, { name: 'disassembleKit' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async disassembleKit(
    @Args('workOrderId', { type: () => ID }) workOrderId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    // Enqueue disassembly operation to Bull queue
    await this.kittingAssemblyService['queueService'].add('disassemble-kit', {
      tenantId,
      workOrderId,
      userId: user.id,
    });
    return true;
  }

  @Query(() => AssemblyWorkOrderType, { name: 'assemblyWorkOrder' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getAssemblyWorkOrder(
    @Args('workOrderId', { type: () => ID }) workOrderId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.getAssemblyWorkOrder(tenantId, workOrderId);
  }

  @Query(() => AssemblyWorkOrderConnection, { name: 'assemblyWorkOrders' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getAssemblyWorkOrders(
    @Args('first', { type: () => Number, nullable: true }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string,
    @Args('warehouseId', { type: () => ID, nullable: true }) warehouseId: string,
    @Args('status', { type: () => String, nullable: true }) status: string,
    @Args('assignedTo', { type: () => ID, nullable: true }) assignedTo: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const { limit } = this.parsePaginationArgs({ first, after });
    
    const result = await this.kittingAssemblyService.getAssemblyWorkOrders(tenantId, {
      warehouseId,
      status,
      assignedTo,
      page: 1,
      limit,
    });
    
    return {
      edges: this.createEdges(result.workOrders, wo => wo.workOrderId),
      pageInfo: this.createPageInfo(
        result.page < result.totalPages,
        result.page > 1,
        result.workOrders[0]?.workOrderId,
        result.workOrders[result.workOrders.length - 1]?.workOrderId,
      ),
      totalCount: result.total,
    };
  }

  @Mutation(() => AssemblyWorkOrderType, { name: 'createAssemblyWorkOrder' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createAssemblyWorkOrder(
    @Args('input') input: CreateAssemblyWorkOrderInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.createAssemblyWorkOrder(tenantId, {
      tenantId,
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => AssemblyWorkOrderType, { name: 'updateAssemblyWorkOrder' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async updateAssemblyWorkOrder(
    @Args('workOrderId', { type: () => ID }) workOrderId: string,
    @Args('input') input: UpdateAssemblyWorkOrderInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.kittingAssemblyService.updateAssemblyWorkOrder(tenantId, workOrderId, {
      ...input,
      userId: user.id,
    });
  }

  @Mutation(() => AssemblyWorkOrderType, { name: 'assembleKit' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:update')
  async assembleKit(
    @Args('workOrderId', { type: () => ID }) workOrderId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    // Enqueue assembly operation to Bull queue
    await this.kittingAssemblyService['queueService'].add('assemble-kit', {
      tenantId,
      workOrderId,
      userId: user.id,
    });
    
    // Update work order status to in_progress
    return this.kittingAssemblyService.updateAssemblyWorkOrder(tenantId, workOrderId, {
      status: 'in_progress' as any,
      userId: user.id,
    });
  }
}
