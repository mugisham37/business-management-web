import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { SupplierService } from '../services/supplier.service';
import { SupplierContact } from '../entities/supplier.entity';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierContactInput, UpdateSupplierContactInput } from '../inputs/supplier.input';

@Resolver(() => SupplierContact)
@UseGuards(GraphQLJwtAuthGuard)
export class SupplierContactResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly supplierService: SupplierService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => SupplierContact, { name: 'supplierContact' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:read')
  async getSupplierContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.supplierService.getSupplierContact(tenantId, id);
  }

  @Query(() => [SupplierContact], { name: 'supplierContacts' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:read')
  async getSupplierContacts(
    @Args('supplierId', { type: () => ID }) supplierId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.supplierService.getSupplierContacts(tenantId, supplierId);
  }

  @Query(() => SupplierContact, { name: 'primarySupplierContact', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:read')
  async getPrimaryContact(
    @Args('supplierId', { type: () => ID }) supplierId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.supplierService.getPrimaryContact(tenantId, supplierId);
  }

  @Mutation(() => SupplierContact, { name: 'createSupplierContact' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:create')
  async createSupplierContact(
    @Args('supplierId', { type: () => ID }) supplierId: string,
    @Args('input') input: CreateSupplierContactInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.supplierService.createSupplierContact(tenantId, supplierId, input, user.id);
  }

  @Mutation(() => SupplierContact, { name: 'updateSupplierContact' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:update')
  async updateSupplierContact(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSupplierContactInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.supplierService.updateSupplierContact(tenantId, id, input, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteSupplierContact' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:delete')
  async deleteSupplierContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.supplierService.deleteSupplierContact(tenantId, id, user.id);
    return true;
  }

  @Mutation(() => SupplierContact, { name: 'setPrimaryContact' })
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:update')
  async setPrimaryContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.supplierService.setPrimaryContact(tenantId, id, user.id);
  }

  @ResolveField(() => Supplier, { name: 'supplier' })
  async supplier(
    @Parent() contact: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    const loader = this.getDataLoader(
      'supplier_by_id',
      async (supplierIds: readonly string[]) => {
        const suppliers = await Promise.all(
          supplierIds.map(id => 
            this.supplierService.getSupplier(tenantId, id).catch(() => null)
          )
        );
        return suppliers.map(s => s || new Error('Supplier not found'));
      },
    );
    return loader.load(contact.supplierId);
  }
}
