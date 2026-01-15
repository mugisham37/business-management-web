import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { ShippingIntegrationService } from '../services/shipping-integration.service';
import { 
  ShippingRateType,
  ShipmentType,
  TrackingInfoType,
  GetShippingRatesInput,
  CreateShipmentInput,
  SchedulePickupInput,
} from '../types/shipping.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ShippingIntegrationResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly shippingIntegrationService: ShippingIntegrationService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [ShippingRateType], { name: 'shippingRates' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async getShippingRates(
    @Args('input') input: GetShippingRatesInput,
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    return this.shippingIntegrationService.getShippingRates(tenantId, input);
  }

  @Query(() => TrackingInfoType, { name: 'trackShipment' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async trackShipment(
    @Args('trackingNumber') trackingNumber: string,
    @Args('carrier') carrier: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.shippingIntegrationService.trackShipment(tenantId, trackingNumber, carrier);
  }

  @Mutation(() => ShipmentType, { name: 'createShipment' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async createShipment(
    @Args('input') input: CreateShipmentInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    return this.shippingIntegrationService.createShipment(tenantId, input, user.id);
  }

  @Mutation(() => String, { name: 'printShippingLabel', description: 'Returns label URL' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:read')
  async printShippingLabel(
    @Args('shipmentId', { type: () => ID }) shipmentId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    const shipment = await this.shippingIntegrationService.getShipment(tenantId, shipmentId);
    return shipment.labelUrl || '';
  }

  @Mutation(() => Boolean, { name: 'schedulePickup' })
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:create')
  async schedulePickup(
    @Args('input') input: SchedulePickupInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.shippingIntegrationService.schedulePickup(tenantId, input, user.id);
    return true;
  }
}
