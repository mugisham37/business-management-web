import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { WarehouseService } from '../services/warehouse.service';
import { WarehouseZoneService } from '../services/warehouse-zone.service';
import { BinLocationService } from '../services/bin-location.service';
import {
  WAREHOUSE_PERMISSION_KEY,
  WAREHOUSE_ZONE_ACCESS_KEY,
  BIN_LOCATION_ACCESS_KEY,
  PICKING_PERMISSION_KEY,
  ASSEMBLY_PERMISSION_KEY,
  SHIPPING_PERMISSION_KEY,
  LOT_TRACKING_PERMISSION_KEY,
} from '../decorators/warehouse.decorators';

@Injectable()
export class WarehouseAccessGuard implements CanActivate {
  private readonly logger = new Logger(WarehouseAccessGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly warehouseService: WarehouseService,
    private readonly zoneService: WarehouseZoneService,
    private readonly binLocationService: BinLocationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;
    const tenantId = request.tenantId;

    if (!user || !tenantId) {
      throw new ForbiddenException('User and tenant information required');
    }

    // Check warehouse permission
    const warehousePermission = this.reflector.get<string>(
      WAREHOUSE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (warehousePermission) {
      const hasPermission = await this.checkWarehousePermission(
        user,
        tenantId,
        warehousePermission,
        request,
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient warehouse permission: ${warehousePermission}`);
      }
    }

    // Check zone access
    const zoneAccess = this.reflector.get<string>(
      WAREHOUSE_ZONE_ACCESS_KEY,
      context.getHandler(),
    );

    if (zoneAccess) {
      const hasAccess = await this.checkZoneAccess(
        user,
        tenantId,
        zoneAccess,
        request,
      );
      if (!hasAccess) {
        throw new ForbiddenException(`Insufficient zone access: ${zoneAccess}`);
      }
    }

    // Check bin location access
    const binLocationAccess = this.reflector.get<string>(
      BIN_LOCATION_ACCESS_KEY,
      context.getHandler(),
    );

    if (binLocationAccess) {
      const hasAccess = await this.checkBinLocationAccess(
        user,
        tenantId,
        binLocationAccess,
        request,
      );
      if (!hasAccess) {
        throw new ForbiddenException(`Insufficient bin location access: ${binLocationAccess}`);
      }
    }

    // Check picking permission
    const pickingPermission = this.reflector.get<string>(
      PICKING_PERMISSION_KEY,
      context.getHandler(),
    );

    if (pickingPermission) {
      const hasPermission = await this.checkPickingPermission(
        user,
        tenantId,
        pickingPermission,
        request,
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient picking permission: ${pickingPermission}`);
      }
    }

    // Check assembly permission
    const assemblyPermission = this.reflector.get<string>(
      ASSEMBLY_PERMISSION_KEY,
      context.getHandler(),
    );

    if (assemblyPermission) {
      const hasPermission = await this.checkAssemblyPermission(
        user,
        tenantId,
        assemblyPermission,
        request,
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient assembly permission: ${assemblyPermission}`);
      }
    }

    // Check shipping permission
    const shippingPermission = this.reflector.get<string>(
      SHIPPING_PERMISSION_KEY,
      context.getHandler(),
    );

    if (shippingPermission) {
      const hasPermission = await this.checkShippingPermission(
        user,
        tenantId,
        shippingPermission,
        request,
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient shipping permission: ${shippingPermission}`);
      }
    }

    // Check lot tracking permission
    const lotTrackingPermission = this.reflector.get<string>(
      LOT_TRACKING_PERMISSION_KEY,
      context.getHandler(),
    );

    if (lotTrackingPermission) {
      const hasPermission = await this.checkLotTrackingPermission(
        user,
        tenantId,
        lotTrackingPermission,
        request,
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Insufficient lot tracking permission: ${lotTrackingPermission}`);
      }
    }

    return true;
  }

  private async checkWarehousePermission(
    user: any,
    tenantId: string,
    permission: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Extract warehouse ID from request arguments
      const warehouseId = this.extractWarehouseId(request);
      
      if (warehouseId) {
        // Verify warehouse exists and user has access
        const warehouse = await this.warehouseService.getWarehouse(tenantId, warehouseId);
        if (!warehouse) {
          return false;
        }

        // Store warehouse in request for later use
        request.warehouse = warehouse;
      }

      // Check user permissions
      const userPermissions = user.permissions || [];
      const warehousePermissions = userPermissions.filter((p: any) => 
        p.resource === 'warehouse' || p.resource === 'warehouse:*'
      );

      return warehousePermissions.some((p: any) => 
        p.action === permission || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking warehouse permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkZoneAccess(
    user: any,
    tenantId: string,
    accessLevel: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Extract zone ID from request arguments
      const zoneId = this.extractZoneId(request);
      
      if (zoneId) {
        // Verify zone exists and user has access
        const zone = await this.zoneService.getZone(tenantId, zoneId);
        if (!zone) {
          return false;
        }

        // Check zone access level requirements
        if (zone.requiresAuthorization && zone.accessLevel) {
          const userAccessLevel = user.warehouseAccessLevel || 'basic';
          const requiredLevel = zone.accessLevel;
          
          const accessLevels = ['basic', 'standard', 'high', 'maximum'];
          const userLevelIndex = accessLevels.indexOf(userAccessLevel);
          const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
          
          if (userLevelIndex < requiredLevelIndex) {
            return false;
          }
        }

        // Store zone in request for later use
        request.zone = zone;
      }

      return true;
    } catch (error: unknown) {
      this.logger.error(`Error checking zone access: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkBinLocationAccess(
    user: any,
    tenantId: string,
    accessType: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Extract bin location ID from request arguments
      const binLocationId = this.extractBinLocationId(request);
      
      if (binLocationId) {
        // Verify bin location exists and user has access
        const binLocation = await this.binLocationService.getBinLocation(tenantId, binLocationId);
        if (!binLocation) {
          return false;
        }

        // Check access equipment requirements
        if (binLocation.accessEquipment && binLocation.accessEquipment.length > 0) {
          const userEquipmentCertifications = user.equipmentCertifications || [];
          const hasRequiredEquipment = binLocation.accessEquipment.every((equipment: string) =>
            userEquipmentCertifications.includes(equipment)
          );
          
          if (!hasRequiredEquipment) {
            return false;
          }
        }

        // Store bin location in request for later use
        request.binLocation = binLocation;
      }

      // Check access type permissions
      const userPermissions = user.permissions || [];
      const binPermissions = userPermissions.filter((p: any) => 
        p.resource === 'bin_location' || p.resource === 'warehouse:bin_location'
      );

      return binPermissions.some((p: any) => 
        p.action === accessType || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking bin location access: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkPickingPermission(
    user: any,
    tenantId: string,
    permission: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Check if user is certified for picking
      const userCertifications = user.certifications || [];
      const hasPickingCertification = userCertifications.includes('picking') || 
                                     userCertifications.includes('warehouse_operations');

      if (!hasPickingCertification && permission !== 'admin') {
        return false;
      }

      // Check user permissions
      const userPermissions = user.permissions || [];
      const pickingPermissions = userPermissions.filter((p: any) => 
        p.resource === 'picking' || p.resource === 'warehouse:picking'
      );

      return pickingPermissions.some((p: any) => 
        p.action === permission || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking picking permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkAssemblyPermission(
    user: any,
    tenantId: string,
    permission: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Check if user is certified for assembly
      const userCertifications = user.certifications || [];
      const hasAssemblyCertification = userCertifications.includes('assembly') || 
                                      userCertifications.includes('manufacturing');

      if (!hasAssemblyCertification && permission !== 'admin') {
        return false;
      }

      // Check user permissions
      const userPermissions = user.permissions || [];
      const assemblyPermissions = userPermissions.filter((p: any) => 
        p.resource === 'assembly' || p.resource === 'warehouse:assembly'
      );

      return assemblyPermissions.some((p: any) => 
        p.action === permission || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking assembly permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkShippingPermission(
    user: any,
    tenantId: string,
    permission: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Check if user is certified for shipping
      const userCertifications = user.certifications || [];
      const hasShippingCertification = userCertifications.includes('shipping') || 
                                      userCertifications.includes('logistics');

      if (!hasShippingCertification && permission !== 'admin') {
        return false;
      }

      // Check user permissions
      const userPermissions = user.permissions || [];
      const shippingPermissions = userPermissions.filter((p: any) => 
        p.resource === 'shipping' || p.resource === 'warehouse:shipping'
      );

      return shippingPermissions.some((p: any) => 
        p.action === permission || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking shipping permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async checkLotTrackingPermission(
    user: any,
    tenantId: string,
    permission: string,
    request: any,
  ): Promise<boolean> {
    try {
      // Check if user is certified for lot tracking
      const userCertifications = user.certifications || [];
      const hasLotTrackingCertification = userCertifications.includes('lot_tracking') || 
                                         userCertifications.includes('quality_control');

      if (!hasLotTrackingCertification && permission !== 'admin') {
        return false;
      }

      // Check user permissions
      const userPermissions = user.permissions || [];
      const lotTrackingPermissions = userPermissions.filter((p: any) => 
        p.resource === 'lot_tracking' || p.resource === 'warehouse:lot_tracking'
      );

      return lotTrackingPermissions.some((p: any) => 
        p.action === permission || p.action === '*'
      );
    } catch (error: unknown) {
      this.logger.error(`Error checking lot tracking permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private extractWarehouseId(request: any): string | null {
    const args = request.body?.variables || {};
    return args.warehouseId || args.id || args.input?.warehouseId || null;
  }

  private extractZoneId(request: any): string | null {
    const args = request.body?.variables || {};
    return args.zoneId || args.id || args.input?.zoneId || null;
  }

  private extractBinLocationId(request: any): string | null {
    const args = request.body?.variables || {};
    return args.binLocationId || args.id || args.input?.binLocationId || null;
  }
}