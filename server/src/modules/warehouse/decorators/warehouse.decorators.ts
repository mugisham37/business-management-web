import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Metadata keys
export const WAREHOUSE_PERMISSION_KEY = 'warehouse_permission';
export const WAREHOUSE_ZONE_ACCESS_KEY = 'warehouse_zone_access';
export const BIN_LOCATION_ACCESS_KEY = 'bin_location_access';
export const PICKING_PERMISSION_KEY = 'picking_permission';
export const ASSEMBLY_PERMISSION_KEY = 'assembly_permission';
export const SHIPPING_PERMISSION_KEY = 'shipping_permission';
export const LOT_TRACKING_PERMISSION_KEY = 'lot_tracking_permission';

// Permission decorators
export const RequireWarehousePermission = (permission: string) =>
  SetMetadata(WAREHOUSE_PERMISSION_KEY, permission);

export const RequireZoneAccess = (accessLevel: string) =>
  SetMetadata(WAREHOUSE_ZONE_ACCESS_KEY, accessLevel);

export const RequireBinLocationAccess = (accessType: 'read' | 'write' | 'admin') =>
  SetMetadata(BIN_LOCATION_ACCESS_KEY, accessType);

export const RequirePickingPermission = (permission: 'pick' | 'manage' | 'admin') =>
  SetMetadata(PICKING_PERMISSION_KEY, permission);

export const RequireAssemblyPermission = (permission: 'assemble' | 'manage' | 'admin') =>
  SetMetadata(ASSEMBLY_PERMISSION_KEY, permission);

export const RequireShippingPermission = (permission: 'ship' | 'manage' | 'admin') =>
  SetMetadata(SHIPPING_PERMISSION_KEY, permission);

export const RequireLotTrackingPermission = (permission: 'track' | 'manage' | 'admin') =>
  SetMetadata(LOT_TRACKING_PERMISSION_KEY, permission);

// Parameter decorators
export const CurrentWarehouse = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.warehouse;
  },
);

export const CurrentZone = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.zone;
  },
);

export const CurrentBinLocation = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.binLocation;
  },
);

export const CurrentPicker = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.picker;
  },
);

export const CurrentAssembler = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.assembler;
  },
);

export const CurrentShipper = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.shipper;
  },
);

// Warehouse context decorators
export const WarehouseContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const warehouseContext = request.warehouseContext || {};
    
    return data ? warehouseContext[data] : warehouseContext;
  },
);

export const PickingContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const pickingContext = request.pickingContext || {};
    
    return data ? pickingContext[data] : pickingContext;
  },
);

export const AssemblyContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const assemblyContext = request.assemblyContext || {};
    
    return data ? assemblyContext[data] : assemblyContext;
  },
);

export const ShippingContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const shippingContext = request.shippingContext || {};
    
    return data ? shippingContext[data] : shippingContext;
  },
);

// Validation decorators
export const ValidateWarehouseAccess = () =>
  SetMetadata('validate_warehouse_access', true);

export const ValidateZoneAccess = () =>
  SetMetadata('validate_zone_access', true);

export const ValidateBinLocationAccess = () =>
  SetMetadata('validate_bin_location_access', true);

export const ValidatePickingAccess = () =>
  SetMetadata('validate_picking_access', true);

export const ValidateAssemblyAccess = () =>
  SetMetadata('validate_assembly_access', true);

export const ValidateShippingAccess = () =>
  SetMetadata('validate_shipping_access', true);

export const ValidateLotTrackingAccess = () =>
  SetMetadata('validate_lot_tracking_access', true);

// Audit decorators
export const AuditWarehouseOperation = (operation: string) =>
  SetMetadata('audit_warehouse_operation', operation);

export const AuditPickingOperation = (operation: string) =>
  SetMetadata('audit_picking_operation', operation);

export const AuditAssemblyOperation = (operation: string) =>
  SetMetadata('audit_assembly_operation', operation);

export const AuditShippingOperation = (operation: string) =>
  SetMetadata('audit_shipping_operation', operation);

export const AuditLotTrackingOperation = (operation: string) =>
  SetMetadata('audit_lot_tracking_operation', operation);

// Cache decorators
export const CacheWarehouseData = (ttl: number = 300) =>
  SetMetadata('cache_warehouse_data', ttl);

export const CacheZoneData = (ttl: number = 300) =>
  SetMetadata('cache_zone_data', ttl);

export const CacheBinLocationData = (ttl: number = 60) =>
  SetMetadata('cache_bin_location_data', ttl);

export const CachePickingData = (ttl: number = 30) =>
  SetMetadata('cache_picking_data', ttl);

export const CacheAssemblyData = (ttl: number = 60) =>
  SetMetadata('cache_assembly_data', ttl);

export const CacheShippingData = (ttl: number = 120) =>
  SetMetadata('cache_shipping_data', ttl);

export const CacheLotTrackingData = (ttl: number = 300) =>
  SetMetadata('cache_lot_tracking_data', ttl);

// Rate limiting decorators
export const RateLimitWarehouseOperations = (limit: number = 100) =>
  SetMetadata('rate_limit_warehouse', limit);

export const RateLimitPickingOperations = (limit: number = 200) =>
  SetMetadata('rate_limit_picking', limit);

export const RateLimitAssemblyOperations = (limit: number = 50) =>
  SetMetadata('rate_limit_assembly', limit);

export const RateLimitShippingOperations = (limit: number = 100) =>
  SetMetadata('rate_limit_shipping', limit);

export const RateLimitLotTrackingOperations = (limit: number = 150) =>
  SetMetadata('rate_limit_lot_tracking', limit);

// Performance monitoring decorators
export const MonitorWarehousePerformance = () =>
  SetMetadata('monitor_warehouse_performance', true);

export const MonitorPickingPerformance = () =>
  SetMetadata('monitor_picking_performance', true);

export const MonitorAssemblyPerformance = () =>
  SetMetadata('monitor_assembly_performance', true);

export const MonitorShippingPerformance = () =>
  SetMetadata('monitor_shipping_performance', true);

export const MonitorLotTrackingPerformance = () =>
  SetMetadata('monitor_lot_tracking_performance', true);

// Real-time update decorators
export const EnableRealtimeUpdates = (channel: string) =>
  SetMetadata('realtime_updates_channel', channel);

export const EnablePickingUpdates = () =>
  SetMetadata('enable_picking_updates', true);

export const EnableAssemblyUpdates = () =>
  SetMetadata('enable_assembly_updates', true);

export const EnableShippingUpdates = () =>
  SetMetadata('enable_shipping_updates', true);

export const EnableLotTrackingUpdates = () =>
  SetMetadata('enable_lot_tracking_updates', true);

// Batch operation decorators
export const EnableBatchOperations = () =>
  SetMetadata('enable_batch_operations', true);

export const BatchSize = (size: number) =>
  SetMetadata('batch_size', size);

// Transaction decorators
export const RequireTransaction = () =>
  SetMetadata('require_transaction', true);

export const TransactionIsolation = (level: 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE') =>
  SetMetadata('transaction_isolation', level);

// Workflow decorators
export const WorkflowStep = (step: string) =>
  SetMetadata('workflow_step', step);

export const RequireWorkflowValidation = () =>
  SetMetadata('require_workflow_validation', true);

// Integration decorators
export const RequireWMSIntegration = () =>
  SetMetadata('require_wms_integration', true);

export const RequireERPIntegration = () =>
  SetMetadata('require_erp_integration', true);

export const RequireCarrierIntegration = () =>
  SetMetadata('require_carrier_integration', true);

// Quality control decorators
export const RequireQualityCheck = () =>
  SetMetadata('require_quality_check', true);

export const QualityCheckLevel = (level: 'basic' | 'standard' | 'strict') =>
  SetMetadata('quality_check_level', level);

// Compliance decorators
export const RequireComplianceCheck = () =>
  SetMetadata('require_compliance_check', true);

export const ComplianceStandard = (standard: string) =>
  SetMetadata('compliance_standard', standard);

// Notification decorators
export const NotifyOnCompletion = () =>
  SetMetadata('notify_on_completion', true);

export const NotifyOnError = () =>
  SetMetadata('notify_on_error', true);

export const NotifyOnException = () =>
  SetMetadata('notify_on_exception', true);

// Metrics collection decorators
export const CollectMetrics = () =>
  SetMetadata('collect_metrics', true);

export const MetricsCategory = (category: string) =>
  SetMetadata('metrics_category', category);

// Feature flag decorators
export const RequireFeatureFlag = (flag: string) =>
  SetMetadata('require_feature_flag', flag);

export const FeatureGate = (feature: string) =>
  SetMetadata('feature_gate', feature);