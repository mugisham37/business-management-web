import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SegmentationService } from '../services/segmentation.service';
import { CreateSegmentInput, UpdateSegmentInput } from '../types/segmentation.input';
import { SegmentationType, SegmentMember, SegmentJobResponse } from '../types/segmentation.types';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver(() => SegmentationType)
@UseGuards(JwtAuthGuard, TenantGuard)
export class SegmentationResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly segmentationService: SegmentationService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => SegmentationType)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:read')
  async segment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentationType> {
    return this.segmentationService.getSegment(tenantId, id);
  }

  @Query(() => [SegmentationType])
  @UseGuards(PermissionsGuard)
  @Permissions('segments:read')
  async segments(
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @CurrentTenant() tenantId?: string,
  ): Promise<SegmentationType[]> {
    return this.segmentationService.getSegments(tenantId!, isActive);
  }

  @Query(() => [SegmentMember])
  @UseGuards(PermissionsGuard)
  @Permissions('segments:read')
  async getSegmentMembers(
    @Args('segmentId', { type: () => ID }) segmentId: string,
    @Args('limit', { nullable: true, defaultValue: 100 }) limit: number,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentMember[]> {
    return this.segmentationService.getSegmentMembers(tenantId, segmentId, limit);
  }

  @Query(() => Boolean)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:read')
  async evaluateSegmentMembership(
    @Args('segmentId', { type: () => ID }) segmentId: string,
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.segmentationService.evaluateSegmentMembership(tenantId, segmentId, customerId);
  }

  @Mutation(() => SegmentationType)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:create')
  async createSegment(
    @Args('input') input: CreateSegmentInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentationType> {
    return this.segmentationService.createSegment(tenantId, input, user.id);
  }

  @Mutation(() => SegmentationType)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:update')
  async updateSegment(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSegmentInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentationType> {
    return this.segmentationService.updateSegment(tenantId, id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:delete')
  async deleteSegment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.segmentationService.deleteSegment(tenantId, id, user.id);
    return true;
  }

  @Mutation(() => SegmentJobResponse)
  @UseGuards(PermissionsGuard)
  @Permissions('segments:update')
  async recalculateSegment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<SegmentJobResponse> {
    const result = await this.segmentationService.recalculateSegment(tenantId, id);
    return {
      jobId: result.jobId,
      status: 'processing',
      createdAt: new Date(),
    };
  }
}
