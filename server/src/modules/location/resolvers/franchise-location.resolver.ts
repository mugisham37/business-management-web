import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { FranchiseService } from '../services/franchise.service';
import { LocationService } from '../services/location.service';
import { 
  FranchiseType, 
  LocationType, 
  FranchiseLocationInput,
  FranchiseLocationUpdateInput 
} from '../types/location.types';

@Resolver(() => FranchiseType)
@UseGuards(JwtAuthGuard)
export class FranchiseLocationResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly franchiseService: FranchiseService,
    private readonly locationService: LocationService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [FranchiseType], { name: 'getFranchiseLocations' })
  @UseGuards(PermissionsGuard)
  @Permissions('franchise:read')
  async getFranchiseLocations(
    @Args('franchiseId', { type: () => ID }) franchiseId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.franchiseService.getFranchiseLocations(tenantId, franchiseId);
  }

  @Query(() => FranchiseType, { name: 'getFranchiseLocation', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('franchise:read')
  async getFranchiseLocation(
    @Args('franchiseId', { type: () => ID }) franchiseId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.franchiseService.getFranchiseLocation(tenantId, franchiseId, locationId);
  }

  @Mutation(() => FranchiseType, { name: 'createFranchiseLocation' })
  @UseGuards(PermissionsGuard)
  @Permissions('franchise:create')
  async createFranchiseLocation(
    @Args('franchiseId', { type: () => ID }) franchiseId: string,
    @Args('input', { type: () => FranchiseLocationInput }) input: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.franchiseService.createFranchiseLocation(tenantId, franchiseId, input, user.id);
  }

  @Mutation(() => FranchiseType, { name: 'updateFranchiseLocation' })
  @UseGuards(PermissionsGuard)
  @Permissions('franchise:update')
  async updateFranchiseLocation(
    @Args('franchiseId', { type: () => ID }) franchiseId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @Args('input', { type: () => FranchiseLocationUpdateInput }) input: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.franchiseService.updateFranchiseLocation(tenantId, franchiseId, locationId, input, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteFranchiseLocation' })
  @UseGuards(PermissionsGuard)
  @Permissions('franchise:delete')
  async deleteFranchiseLocation(
    @Args('franchiseId', { type: () => ID }) franchiseId: string,
    @Args('locationId', { type: () => ID }) locationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.franchiseService.deleteFranchiseLocation(tenantId, franchiseId, locationId, user.id);
    return true;
  }

  @ResolveField(() => [LocationType], { name: 'locations' })
  async locations(@Parent() franchise: any): Promise<any[]> {
    return this.dataLoaderService.createDataLoader(
      'franchise-locations',
      async (franchiseIds: string[]) => {
        const results = await Promise.all(
          franchiseIds.map(id => 
            this.franchiseService.getFranchiseLocations(franchise.tenantId, id)
          )
        );
        return results;
      }
    ).load(franchise.id);
  }

  @ResolveField(() => LocationType, { name: 'primaryLocation', nullable: true })
  async primaryLocation(@Parent() franchise: any): Promise<any> {
    const locations = await this.locations(franchise);
    return locations.find(location => location.isPrimary) || null;
  }

  @ResolveField(() => Number, { name: 'totalLocations' })
  async totalLocations(@Parent() franchise: any): Promise<number> {
    const locations = await this.locations(franchise);
    return locations.length;
  }

  @ResolveField(() => Number, { name: 'activeLocations' })
  async activeLocations(@Parent() franchise: any): Promise<number> {
    const locations = await this.locations(franchise);
    return locations.filter(location => location.status === 'active').length;
  }
}