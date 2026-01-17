import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/require-permission.decorator';
import { ProductBrandService } from '../services/product-brand.service';
import { ProductService } from '../services/product.service';
import { Brand } from '../types/brand.types';
import { CreateBrandInput, UpdateBrandInput, BrandFilterInput } from '../inputs/brand.input';
import { OffsetPaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => Brand)
@UseGuards(JwtAuthGuard)
export class BrandResolver extends BaseResolver {
  constructor(
    override readonly dataLoaderService: DataLoaderService,
    private readonly brandService: ProductBrandService,
    private readonly productService: ProductService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Brand, { description: 'Get brand by ID' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async brand(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<Brand> {
    return this.brandService.findById(tenantId || '', id);
  }

  @Query(() => Brand, { description: 'Get brand by slug' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async brandBySlug(
    @Args('slug') slug: string,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<Brand> {
    return this.brandService.findBySlug(tenantId || '', slug);
  }

  @Query(() => [Brand], { description: 'Get brands with optional filtering' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:read')
  async brands(
    @Args('filter', { type: () => BrandFilterInput, nullable: true }) filter?: BrandFilterInput,
    @Args('pagination', { type: () => OffsetPaginationArgs, nullable: true }) pagination?: OffsetPaginationArgs,
    @CurrentUser() user?: any,
    @CurrentTenant() tenantId?: string,
  ): Promise<Brand[]> {
    const query = {
      ...filter,
      offset: pagination?.offset || 0,
      limit: pagination?.limit || 20,
    };

    const result = await this.brandService.findMany(tenantId || '', query);
    return result.brands;
  }

  @Mutation(() => Brand, { description: 'Create new brand' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create')
  async createBrand(
    @Args('input') input: CreateBrandInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Brand> {
    return this.brandService.create(tenantId, input, user.id);
  }

  @Mutation(() => Brand, { description: 'Update brand' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:update')
  async updateBrand(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBrandInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Brand> {
    return this.brandService.update(tenantId, id, input, user.id);
  }

  @Mutation(() => Boolean, { description: 'Delete brand' })
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:delete')
  async deleteBrand(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.brandService.delete(tenantId, id, user.id);
    return true;
  }

  @ResolveField(() => [Object], { description: 'Products belonging to this brand' })
  async products(
    @Parent() brand: Brand,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    // Use DataLoader to batch load products by brand ID
    const loader = this.getDataLoader(
      'products_by_brand_id',
      async (brandIds: readonly string[]) => {
        const results = await Promise.all(
          brandIds.map(brandId =>
            this.productService.findMany(tenantId, { brandId, limit: 100 })
          )
        );
        return results.map(result => result.products);
      },
    );
    return loader.load(brand.id);
  }
}
