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

// Performance metric event classes
export class WarehousePerformanceMetric {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly resourceType: string,
    public readonly resourceId: string,
    public readonly duration: number,
    public readonly success: boolean,
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: any,
  ) {}
}

export class PickingPerformanceMetric {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly pickListId: string,
    public readonly warehouseId: string,
    public readonly duration: number,
    public readonly itemCount: number,
    public readonly success: boolean,
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: any,
  ) {}
}

export class AssemblyPerformanceMetric {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly workOrderId: string,
    public readonly kitId: string,
    public readonly duration: number,
    public readonly componentCount: number,
    public readonly success: boolean,
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: any,
  ) {}
}

export class ShippingPerformanceMetric {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly shipmentId: string,
    public readonly carrierId: string,
    public readonly duration: number,
    public readonly success: boolean,
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: any,
  ) {}
}

export class LotTrackingPerformanceMetric {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly operation: string,
    public readonly lotNumber: string,
    public readonly productId: string,
    public readonly duration: number,
    public readonly success: boolean,
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: any,
  ) {}
}

@Injectable()
export class WarehousePerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WarehousePerformanceInterceptor.name);

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

    // Check if performance monitoring is enabled
    const monitorWarehouse = this.reflector.get<boolean>(
      'monitor_warehouse_performance',
      context.getHandler(),
    );
    const monitorPicking = this.reflector.get<boolean>(
      'monitor_picking_performance',
      context.getHandler(),
    );
    const monitorAssembly = this.reflector.get<boolean>(
      'monitor_assembly_performance',
      context.getHandler(),
    );
    const monitorShipping = this.reflector.get<boolean>(
      'monitor_shipping_performance',
      context.getHandler(),
    );
    const monitorLotTracking = this.reflector.get<boolean>(
      'monitor_lot_tracking_performance',
      context.getHandler(),
    );

    if (!monitorWarehouse && !monitorPicking && !monitorAssembly && !monitorShipping && !monitorLotTracking) {
      return next.handle();
    }

    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    const args = ctx.getArgs();
    const info = ctx.getInfo();
    const operationName = info.fieldName;

    return next.handle().pipe(
      tap((result) => {
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        const memoryDelta = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
        };

        // Emit performance metrics
        if (monitorWarehouse) {
          this.emitWarehousePerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            result,
            duration,
            memoryDelta,
            true,
          );
        }

        if (monitorPicking) {
          this.emitPickingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            result,
            duration,
            memoryDelta,
            true,
          );
        }

        if (monitorAssembly) {
          this.emitAssemblyPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            result,
            duration,
            memoryDelta,
            true,
          );
        }

        if (monitorShipping) {
          this.emitShippingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            result,
            duration,
            memoryDelta,
            true,
          );
        }

        if (monitorLotTracking) {
          this.emitLotTrackingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            result,
            duration,
            memoryDelta,
            true,
          );
        }

        // Log slow operations
        if (duration > 5000) { // 5 seconds
          this.logger.warn(`Slow warehouse operation detected: ${operationName} took ${duration}ms`);
        }

        // Log high memory usage
        if (memoryDelta.heapUsed > 50 * 1024 * 1024) { // 50MB
          this.logger.warn(`High memory usage detected: ${operationName} used ${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`);
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Emit error performance metrics
        if (monitorWarehouse) {
          this.emitWarehousePerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            null,
            duration,
            null,
            false,
            error.message,
          );
        }

        if (monitorPicking) {
          this.emitPickingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            null,
            duration,
            null,
            false,
            error.message,
          );
        }

        if (monitorAssembly) {
          this.emitAssemblyPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            null,
            duration,
            null,
            false,
            error.message,
          );
        }

        if (monitorShipping) {
          this.emitShippingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            null,
            duration,
            null,
            false,
            error.message,
          );
        }

        if (monitorLotTracking) {
          this.emitLotTrackingPerformanceMetric(
            tenantId,
            user.id,
            operationName,
            args,
            null,
            duration,
            null,
            false,
            error.message,
          );
        }

        throw error;
      }),
    );
  }

  private emitWarehousePerformanceMetric(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    duration: number,
    memoryDelta: any,
    success: boolean,
    error?: string,
  ): void {
    try {
      const resourceId = this.extractResourceId(args, result, 'warehouse');
      const metadata = {
        memoryDelta,
        resultSize: this.calculateResultSize(result),
        argSize: this.calculateArgSize(args),
        error,
      };

      const metric = new WarehousePerformanceMetric(
        tenantId,
        userId,
        operation,
        'warehouse',
        resourceId,
        duration,
        success,
        new Date(),
        metadata,
      );

      this.eventEmitter.emit('warehouse.performance', metric);
    } catch (metricError: unknown) {
      this.logger.error(`Failed to emit warehouse performance metric: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`);
    }
  }

  private emitPickingPerformanceMetric(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    duration: number,
    memoryDelta: any,
    success: boolean,
    error?: string,
  ): void {
    try {
      const pickListId = this.extractResourceId(args, result, 'pickList');
      const warehouseId = this.extractResourceId(args, result, 'warehouse');
      const itemCount = this.extractItemCount(args, result);
      const metadata = {
        memoryDelta,
        resultSize: this.calculateResultSize(result),
        argSize: this.calculateArgSize(args),
        error,
        pickingRate: itemCount > 0 ? (itemCount / (duration / 1000 / 60)) : 0, // items per minute
      };

      const metric = new PickingPerformanceMetric(
        tenantId,
        userId,
        operation,
        pickListId,
        warehouseId,
        duration,
        itemCount,
        success,
        new Date(),
        metadata,
      );

      this.eventEmitter.emit('picking.performance', metric);
    } catch (metricError: unknown) {
      this.logger.error(`Failed to emit picking performance metric: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`);
    }
  }

  private emitAssemblyPerformanceMetric(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    duration: number,
    memoryDelta: any,
    success: boolean,
    error?: string,
  ): void {
    try {
      const workOrderId = this.extractResourceId(args, result, 'workOrder');
      const kitId = this.extractResourceId(args, result, 'kit');
      const componentCount = this.extractComponentCount(args, result);
      const metadata = {
        memoryDelta,
        resultSize: this.calculateResultSize(result),
        argSize: this.calculateArgSize(args),
        error,
        assemblyRate: componentCount > 0 ? (componentCount / (duration / 1000 / 60)) : 0, // components per minute
      };

      const metric = new AssemblyPerformanceMetric(
        tenantId,
        userId,
        operation,
        workOrderId,
        kitId,
        duration,
        componentCount,
        success,
        new Date(),
        metadata,
      );

      this.eventEmitter.emit('assembly.performance', metric);
    } catch (metricError: unknown) {
      this.logger.error(`Failed to emit assembly performance metric: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`);
    }
  }

  private emitShippingPerformanceMetric(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    duration: number,
    memoryDelta: any,
    success: boolean,
    error?: string,
  ): void {
    try {
      const shipmentId = this.extractResourceId(args, result, 'shipment');
      const carrierId = this.extractCarrierId(args, result);
      const metadata = {
        memoryDelta,
        resultSize: this.calculateResultSize(result),
        argSize: this.calculateArgSize(args),
        error,
        carrier: carrierId,
      };

      const metric = new ShippingPerformanceMetric(
        tenantId,
        userId,
        operation,
        shipmentId,
        carrierId,
        duration,
        success,
        new Date(),
        metadata,
      );

      this.eventEmitter.emit('shipping.performance', metric);
    } catch (metricError: unknown) {
      this.logger.error(`Failed to emit shipping performance metric: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`);
    }
  }

  private emitLotTrackingPerformanceMetric(
    tenantId: string,
    userId: string,
    operation: string,
    args: any,
    result: any,
    duration: number,
    memoryDelta: any,
    success: boolean,
    error?: string,
  ): void {
    try {
      const lotNumber = this.extractLotNumber(args, result);
      const productId = this.extractResourceId(args, result, 'product');
      const metadata = {
        memoryDelta,
        resultSize: this.calculateResultSize(result),
        argSize: this.calculateArgSize(args),
        error,
      };

      const metric = new LotTrackingPerformanceMetric(
        tenantId,
        userId,
        operation,
        lotNumber,
        productId,
        duration,
        success,
        new Date(),
        metadata,
      );

      this.eventEmitter.emit('lot_tracking.performance', metric);
    } catch (metricError: unknown) {
      this.logger.error(`Failed to emit lot tracking performance metric: ${metricError instanceof Error ? metricError.message : 'Unknown error'}`);
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

  private extractItemCount(args: any, result: any): number {
    if (result && result.totalItems) return result.totalItems;
    if (result && result.items && Array.isArray(result.items)) return result.items.length;
    if (args && args.input && args.input.items && Array.isArray(args.input.items)) return args.input.items.length;
    return 0;
  }

  private extractComponentCount(args: any, result: any): number {
    if (result && result.components && Array.isArray(result.components)) return result.components.length;
    if (args && args.input && args.input.components && Array.isArray(args.input.components)) return args.input.components.length;
    return 0;
  }

  private extractCarrierId(args: any, result: any): string {
    return args?.carrierId || args?.input?.carrierId || result?.carrierId || 'unknown';
  }

  private extractLotNumber(args: any, result: any): string {
    return args?.lotNumber || args?.input?.lotNumber || result?.lotNumber || 'unknown';
  }

  private calculateResultSize(result: any): number {
    if (!result) return 0;
    try {
      return JSON.stringify(result).length;
    } catch {
      return 0;
    }
  }

  private calculateArgSize(args: any): number {
    if (!args) return 0;
    try {
      return JSON.stringify(args).length;
    } catch {
      return 0;
    }
  }
}