import { Resolver, Query, Mutation, Args, Subscription, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { LocationBasedService } from '../services/location-based.service';
import { TrackLocationInput, CreateGeofenceInput } from '../inputs/mobile.input';
import {
  TrackLocationResponse,
  CreateGeofenceResponse,
  LocationTrackingResult,
  GeofenceArea,
  LocationEvent,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class LocationResolver {
  private readonly logger = new Logger(LocationResolver.name);

  constructor(
    private readonly locationService: LocationBasedService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Mutation(() => TrackLocationResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:location:track')
  async trackLocation(
    @Args('input') input: TrackLocationInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<TrackLocationResponse> {
    try {
      const locationCoords: any = {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        timestamp: Date.now(),
      };
      
      if (input.location.accuracy !== undefined) locationCoords.accuracy = input.location.accuracy;
      if (input.location.altitude !== undefined) locationCoords.altitude = input.location.altitude;
      if (input.location.heading !== undefined) locationCoords.heading = input.location.heading;
      if (input.location.speed !== undefined) locationCoords.speed = input.location.speed;

      const result = await this.locationService.trackLocation(
        user.id,
        tenantId,
        input.deviceId,
        locationCoords,
      );

      // Convert timestamps from service format (number) to GraphQL format (Date)
      const convertedResult = {
        ...result,
        events: result.events.map(event => ({
          ...event,
          location: {
            ...event.location,
            timestamp: typeof event.location.timestamp === 'number' ? new Date(event.location.timestamp) : event.location.timestamp,
          },
          timestamp: typeof event.timestamp === 'number' ? new Date(event.timestamp) : event.timestamp,
        })),
        nearbyLocations: result.nearbyLocations.map(nl => ({
          ...nl,
          location: {
            ...nl.location,
            timestamp: typeof nl.location.timestamp === 'number' ? new Date(nl.location.timestamp) : nl.location.timestamp,
          },
        })),
      };

      // Publish location events
      for (const event of convertedResult.events) {
        await this.pubSubService.publish('locationEvent', {
          tenantId,
          userId: user.id,
          event,
        });
      }

      return {
        success: true,
        message: 'Location tracked successfully',
        result: convertedResult,
      };
    } catch (error) {
      this.logger.error(`Location tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Location tracking failed',
      };
    }
  }

  @Mutation(() => CreateGeofenceResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:location:manage')
  async createGeofence(
    @Args('input') input: CreateGeofenceInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CreateGeofenceResponse> {
    try {
      const geofence = await this.locationService.createGeofence(
        tenantId,
        input.name,
        {
          latitude: input.center.latitude,
          longitude: input.center.longitude,
          timestamp: Date.now(),
        },
        input.radius,
        input.type as any,
        input.metadata ? JSON.parse(input.metadata) : undefined,
      );

      // Convert center timestamp from number to Date for GraphQL type
      const convertedGeofence = {
        ...geofence,
        center: {
          ...geofence.center,
          timestamp: typeof geofence.center.timestamp === 'number' ? new Date(geofence.center.timestamp) : geofence.center.timestamp,
        },
      };

      return {
        success: true,
        message: 'Geofence created successfully',
        geofence: convertedGeofence,
      };
    } catch (error) {
      this.logger.error(`Geofence creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Geofence creation failed',
      };
    }
  }

  @Query(() => [GeofenceArea])
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:location:read')
  async getGeofences(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<GeofenceArea[]> {
    try {
      const geofences = await this.locationService.getGeofences(tenantId);
      // Convert all center timestamps from number to Date for GraphQL type
      return geofences.map(geofence => ({
        ...geofence,
        center: {
          ...geofence.center,
          timestamp: typeof geofence.center.timestamp === 'number' ? new Date(geofence.center.timestamp) : geofence.center.timestamp,
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to get geofences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:location:manage')
  async deleteGeofence(
    @Args('geofenceId') geofenceId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.locationService.deleteGeofence(tenantId, geofenceId);
    } catch (error) {
      this.logger.error(`Geofence deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  @Query(() => [LocationEvent])
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:location:read')
  async getLocationHistory(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<LocationEvent[]> {
    try {
      const events = await this.locationService.getLocationHistory(
        user.id,
        tenantId,
        startDate,
        endDate,
        limit || 100,
      );
      // Convert timestamps from number to Date for GraphQL type
      return events.map(event => ({
        ...event,
        location: {
          ...event.location,
          timestamp: typeof event.location.timestamp === 'number' ? new Date(event.location.timestamp) : event.location.timestamp,
        },
        timestamp: typeof event.timestamp === 'number' ? new Date(event.timestamp) : event.timestamp,
      }));
    } catch (error) {
      this.logger.error(`Failed to get location history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  @Subscription(() => LocationEvent, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.tenantId && payload.userId === context.req.user.id;
    },
    resolve: (payload) => {
      // Convert timestamps from number to Date if needed
      return {
        ...payload.event,
        location: {
          ...payload.event.location,
          timestamp: payload.event.location.timestamp instanceof Date ? payload.event.location.timestamp : new Date(payload.event.location.timestamp),
        },
        timestamp: payload.event.timestamp instanceof Date ? payload.event.timestamp : new Date(payload.event.timestamp),
      };
    },
  })
  locationEvent(@CurrentTenant() tenantId: string) {
    return this.pubSubService.asyncIterator('locationEvent', tenantId);
  }
}
