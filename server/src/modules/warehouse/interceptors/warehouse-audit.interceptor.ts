import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Audit event classes
export class WarehouseAuditEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly resourceType: string,
    public readonly resourceId: string,
    public readonly details: any,
    public readonly timestamp: Date = new Date(),
    public readonly success: boolean = true,
    public readonly error?: string,
  ) {}
}

export class PickingAuditEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly pickListId: string,
    public readonly waveId: string | null,
    public readonly details: any,
    public readonly timestamp: Date = new Date(),
    public readonly success: boolean = true,
    public readonly error?: string,
  ) {}
}

export class AssemblyAuditEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly workOrderId: string,
    public readonly kitId: string,
    public readonly details: any,
    public readonly timestamp: Date = new Date(),
    public readonly success: boolean = true,
    public readonly error?: string,
  ) {}
}

export class ShippingAuditEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly shipmentId: string,
    public readonly trackingNumber: string | null,
    public readonly details: any,
    public readonly timestamp: Date = new Date(),
    public readonly success: boolean = true,
    public readonly error?: string,
  ) {}
}

export class LotTrackingAuditEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly lotNumber: string,
    public readonly productId: string,
    public readonly details: any,
    public readonly timestamp: Date = new Date(),
    public readonly success: boolean = true,
    public readonly error?: string,
  ) {}
}

@Injectable()
export class WarehouseAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WarehouseAuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;
    const tenantId = request.tenantId;

    if (!user || !tenantId) {
      return next.handle();
    }

    // Get audit metadata
    const warehouseOperation = this.reflector.get<string>(
      'audit_warehouse_operation',
      context.getHandler(),
    );
    const pickingOperation = this.reflector.get<string>(
      'audit_picking_operation',
      context.getHandler(),
    );
    const assemblyOperation = this.reflector.get<string>(
      'audit_assembly_operation',
      context.getHandler(),
    );
    const shippingOperation = this.reflector.get<string>(
      'audit_shipping_operation',
      context.getHandler(),
    );
    const lotTrackingOperation = this.reflector.get<string>(
      'audit_lot_tracking_operation',
      context.getHandler(),
    );

    const startTime = Date.now();
    const args = ctx.getArgs();
    const info = ctx.getInfo();

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        
        // Emit warehouse audit events
        if (warehouseOperation) {
          this.emitWarehouseAuditEvent(
            tenantId,
            user.id,
            warehouseOperation,
            args,
            result,
            true,
            duration,
          );
        }

        if (pickingOperation) {
          this.emitPickingAuditEvent(
            tenantId,
            user.id,
            pickingOperation,
            args,
            result,
            true,
            duration,
          );
        }

        if (assemblyOperation) {
          this.emitAssemblyAuditEvent(
            tenantId,
            user.id,
            assemblyOperation,
            args,
            result,
            true,
            duration,
          );
        }

        if (shippingOperation) {
          this.emitShippingAuditEvent(
            tenantId,
            user.id,
            shippingOperation,
            args,
            result,
            true,
            duration,
          );
        }

        if (lotTrackingOperation) {
          this.emitLotTrackingAuditEvent(
            tenantId,
            user.id,
            lotTrackingOperation,
            args,
            result,
            true,
            duration,
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Emit error audit events
        if (warehouseOperation) {
          this.emitWarehouseAuditEvent(
            tenantId,
            user.id,
            warehouseOperation,
            args,
            null,
            false,
            duration,
            error.message,
          );
        }

        if (pickingOperation) {
          this.emitPickingAuditEvent(
            tenantId,
            user.id,
            pickingOperation,
            args,
            null,
            false,
            duration,
            error.message,
          );
        }

        if (assemblyOperation) {
          this.emitAssemblyAuditEvent(
            tenantId,
            user.id,
            assemblyOperation,
            args,
            null,
            false,
            duration,
            error.message,
          );
        }

        if (shippingOperation) {
          this.emitShippingAuditEvent(
            tenantId,
            user.id,
            shippingOperation,
            args,
            null,
            false,
            duration,
            error.message,
          );
        }

        if (lotTrackingOperation) {
          this.emitLotTrackingAuditEvent(
            tenantId,
            user.id,
            lotTrackingOperation,
            args,
            null,
            false,
            duration,
            error.message,
          );
        }

        throw error;
      }),
    );
  }

  private emitWarehouseAuditEvent(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    success: boolean,
    duration: number,
    error?: string,
  ): void {
    try {
      const resourceId = this.extractResourceId(args, result, 'warehouse');
      const details = {
        operation,
        args: this.sanitizeArgs(args),
        result: success ? this.sanitizeResult(result) : null,
        duration,
        timestamp: new Date(),
      };

      const auditEvent = new WarehouseAuditEvent(
        tenantId,
        userId,
        operation,
        'warehouse',
        resourceId,
        details,
        new Date(),
        success,
        error,
      );

      this.eventEmitter.emit('warehouse.audit', auditEvent);
    } catch (auditError: unknown) {
      this.logger.error(`Failed to emit warehouse audit event: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`);
    }
  }

  private emitPickingAuditEvent(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    success: boolean,
    duration: number,
    error?: string,
  ): void {
    try {
      const pickListId = this.extractResourceId(args, result, 'pickList');
      const waveId = this.extractResourceId(args, result, 'wave');
      const details = {
        operation,
        args: this.sanitizeArgs(args),
        result: success ? this.sanitizeResult(result) : null,
        duration,
        timestamp: new Date(),
      };

      const auditEvent = new PickingAuditEvent(
        tenantId,
        userId,
        operation,
        pickListId,
        waveId,
        details,
        new Date(),
        success,
        error,
      );

      this.eventEmitter.emit('picking.audit', auditEvent);
    } catch (auditError: unknown) {
      this.logger.error(`Failed to emit picking audit event: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`);
    }
  }

  private emitAssemblyAuditEvent(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    success: boolean,
    duration: number,
    error?: string,
  ): void {
    try {
      const workOrderId = this.extractResourceId(args, result, 'workOrder');
      const kitId = this.extractResourceId(args, result, 'kit');
      const details = {
        operation,
        args: this.sanitizeArgs(args),
        result: success ? this.sanitizeResult(result) : null,
        duration,
        timestamp: new Date(),
      };

      const auditEvent = new AssemblyAuditEvent(
        tenantId,
        userId,
        operation,
        workOrderId,
        kitId,
        details,
        new Date(),
        success,
        error,
      );

      this.eventEmitter.emit('assembly.audit', auditEvent);
    } catch (auditError: unknown) {
      this.logger.error(`Failed to emit assembly audit event: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`);
    }
  }

  private emitShippingAuditEvent(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    success: boolean,
    duration: number,
    error?: string,
  ): void {
    try {
      const shipmentId = this.extractResourceId(args, result, 'shipment');
      const trackingNumber = this.extractTrackingNumber(args, result);
      const details = {
        operation,
        args: this.sanitizeArgs(args),
        result: success ? this.sanitizeResult(result) : null,
        duration,
        timestamp: new Date(),
      };

      const auditEvent = new ShippingAuditEvent(
        tenantId,
        userId,
        operation,
        shipmentId,
        trackingNumber,
        details,
        new Date(),
        success,
        error,
      );

      this.eventEmitter.emit('shipping.audit', auditEvent);
    } catch (auditError: unknown) {
      this.logger.error(`Failed to emit shipping audit event: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`);
    }
  }

  private emitLotTrackingAuditEvent(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    success: boolean,
    duration: number,
    error?: string,
  ): void {
    try {
      const lotNumber = this.extractLotNumber(args, result);
      const productId = this.extractResourceId(args, result, 'product');
      const details = {
        operation,
        args: this.sanitizeArgs(args),
        result: success ? this.sanitizeResult(result) : null,
        duration,
        timestamp: new Date(),
      };

      const auditEvent = new LotTrackingAuditEvent(
        tenantId,
        userId,
        operation,
        lotNumber,
        productId,
        details,
        new Date(),
        success,
        error,
      );

      this.eventEmitter.emit('lot_tracking.audit', auditEvent);
    } catch (auditError: unknown) {
      this.logger.error(`Failed to emit lot tracking audit event: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`);
    }
  }

  private extractResourceId(args: any, result: any, resourceType: string): string {
    // Try to extract ID from args
    if (args && args.id) return args.id;
    if (args && args.input && args.input.id) return args.input.id;
    
    // Try to extract ID from result
    if (result && result.id) return result.id;
    
    // Try resource-specific extraction
    switch (resourceType) {
      case 'warehouse':
        return args?.warehouseId || args?.input?.warehouseId || result?.warehouseId || 'unknown';
      case 'pickList':
        return args?.pickListId || args?.input?.pickListId || result?.pickListId || 'unknown';
      case 'wave':
        return args?.waveId || args?.input?.waveId || result?.waveId || null;
      case 'workOrder':
        return args?.workOrderId || args?.input?.workOrderId || result?.workOrderId || 'unknown';
      case 'kit':
        return args?.kitId || args?.input?.kitId || result?.kitId || 'unknown';
      case 'shipment':
        return args?.shipmentId || args?.input?.shipmentId || result?.shipmentId || 'unknown';
      case 'product':
        return args?.productId || args?.input?.productId || result?.productId || 'unknown';
      default:
        return 'unknown';
    }
  }

  private extractTrackingNumber(args: any, result: any): string | null {
    return args?.trackingNumber || args?.input?.trackingNumber || result?.trackingNumber || null;
  }

  private extractLotNumber(args: any, result: any): string {
    return args?.lotNumber || args?.input?.lotNumber || result?.lotNumber || 'unknown';
  }

  private sanitizeArgs(args: any): any {
    if (!args) return {};
    
    // Remove sensitive information
    const sanitized = { ...args };
    
    // Remove password fields
    if (sanitized.password) delete sanitized.password;
    if (sanitized.input?.password) delete sanitized.input.password;
    
    // Remove large binary data
    if (sanitized.labelData) sanitized.labelData = '[BINARY_DATA]';
    if (sanitized.input?.labelData) sanitized.input.labelData = '[BINARY_DATA]';
    
    return sanitized;
  }

  private sanitizeResult(result: any): any {
    if (!result) return null;
    
    // For large results, only keep essential fields
    if (Array.isArray(result)) {
      return {
        type: 'array',
        count: result.length,
        sample: result.slice(0, 3).map(item => ({ id: item?.id, type: typeof item })),
      };
    }
    
    if (typeof result === 'object') {
      return {
        id: result.id,
        type: typeof result,
        keys: Object.keys(result).slice(0, 10),
      };
    }
    
    return result;
  }
}