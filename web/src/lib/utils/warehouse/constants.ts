/**
 * Warehouse Constants and Configurations
 * Centralized constants for warehouse operations
 */

import {
  WarehouseStatus,
  WarehouseZoneType,
  BinLocationStatus,
  PickingWaveStatus,
  ShipmentStatus,
  LotStatus,
  AssemblyWorkOrderStatus,
  SecurityLevel,
  LayoutType,
} from '@/types/warehouse';

// ===== WAREHOUSE CONSTANTS =====

export const WAREHOUSE_DEFAULTS = {
  MAX_CAPACITY_UNITS: 100000,
  DEFAULT_CEILING_HEIGHT: 20, // feet
  DEFAULT_AISLE_WIDTH: 12, // feet
  MIN_SQUARE_FOOTAGE: 1000,
  MAX_SQUARE_FOOTAGE: 10000000,
  DEFAULT_SECURITY_LEVEL: SecurityLevel.STANDARD,
  DEFAULT_LAYOUT_TYPE: LayoutType.GRID,
} as const;

export const WAREHOUSE_LIMITS = {
  MAX_NAME_LENGTH: 255,
  MAX_CODE_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_CODE_LENGTH: 2,
  MAX_ZONES_PER_WAREHOUSE: 100,
  MAX_BINS_PER_ZONE: 10000,
} as const;

// ===== ZONE CONSTANTS =====

export const ZONE_DEFAULTS = {
  PRIORITY: {
    [WarehouseZoneType.RECEIVING]: 1,
    [WarehouseZoneType.SHIPPING]: 1,
    [WarehouseZoneType.PACKING]: 2,
    [WarehouseZoneType.PICKING]: 2,
    [WarehouseZoneType.STORAGE]: 3,
    [WarehouseZoneType.STAGING]: 3,
    [WarehouseZoneType.RETURNS]: 4,
    [WarehouseZoneType.QUARANTINE]: 5,
    [WarehouseZoneType.COLD_STORAGE]: 4,
    [WarehouseZoneType.HAZMAT]: 5,
  },
  TEMPERATURE_RANGES: {
    [WarehouseZoneType.COLD_STORAGE]: { min: 32, max: 40 }, // Fahrenheit
    [WarehouseZoneType.STORAGE]: { min: 60, max: 80 },
    [WarehouseZoneType.HAZMAT]: { min: 65, max: 75 },
  },
} as const;

export const ZONE_CONFIGURATIONS = {
  [WarehouseZoneType.RECEIVING]: {
    allowMixedProducts: true,
    allowMixedBatches: true,
    fifoEnforced: false,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.STORAGE]: {
    allowMixedProducts: true,
    allowMixedBatches: false,
    fifoEnforced: true,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.PICKING]: {
    allowMixedProducts: false,
    allowMixedBatches: false,
    fifoEnforced: true,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.PACKING]: {
    allowMixedProducts: true,
    allowMixedBatches: true,
    fifoEnforced: false,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.SHIPPING]: {
    allowMixedProducts: true,
    allowMixedBatches: true,
    fifoEnforced: false,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.STAGING]: {
    allowMixedProducts: true,
    allowMixedBatches: true,
    fifoEnforced: false,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.QUARANTINE]: {
    allowMixedProducts: false,
    allowMixedBatches: false,
    fifoEnforced: false,
    requiresAuthorization: true,
    accessLevel: 'high',
    temperatureControlled: false,
  },
  [WarehouseZoneType.RETURNS]: {
    allowMixedProducts: true,
    allowMixedBatches: true,
    fifoEnforced: false,
    requiresAuthorization: false,
    accessLevel: 'standard',
    temperatureControlled: false,
  },
  [WarehouseZoneType.COLD_STORAGE]: {
    allowMixedProducts: true,
    allowMixedBatches: false,
    fifoEnforced: true,
    requiresAuthorization: true,
    accessLevel: 'high',
    temperatureControlled: true,
  },
  [WarehouseZoneType.HAZMAT]: {
    allowMixedProducts: false,
    allowMixedBatches: false,
    fifoEnforced: false,
    requiresAuthorization: true,
    accessLevel: 'maximum',
    temperatureControlled: true,
  },
} as const;

// ===== BIN LOCATION CONSTANTS =====

export const BIN_DEFAULTS = {
  MAX_CAPACITY: 1000, // units
  MAX_WEIGHT: 2000, // pounds
  DEFAULT_LENGTH: 48, // inches
  DEFAULT_WIDTH: 40, // inches
  DEFAULT_HEIGHT: 42, // inches
  PICKING_SEQUENCE_INCREMENT: 10,
} as const;

export const BIN_LIMITS = {
  MAX_CODE_LENGTH: 50,
  MAX_DISPLAY_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_COORDINATE_VALUE: 99999,
  MIN_DIMENSION_VALUE: 1,
  MAX_DIMENSION_VALUE: 999,
} as const;

// ===== PICKING CONSTANTS =====

export const PICKING_DEFAULTS = {
  WAVE_SIZE: 50, // orders per wave
  MAX_WAVE_SIZE: 500,
  MIN_WAVE_SIZE: 1,
  DEFAULT_PRIORITY: 5,
  MAX_PRIORITY: 10,
  MIN_PRIORITY: 1,
  PICK_TIME_PER_ITEM: 2, // minutes
  TRAVEL_TIME_PER_AISLE: 1, // minutes
} as const;

export const PICKING_LIMITS = {
  MAX_WAVE_NAME_LENGTH: 255,
  MAX_WAVE_DESCRIPTION_LENGTH: 1000,
  MAX_PICKERS_PER_WAVE: 20,
  MAX_ITEMS_PER_PICK_LIST: 100,
  MAX_QUANTITY_PER_ITEM: 10000,
} as const;

export const PICKING_THRESHOLDS = {
  ACCURACY: {
    EXCELLENT: 99.5,
    GOOD: 98.0,
    ACCEPTABLE: 95.0,
    POOR: 90.0,
  },
  EFFICIENCY: {
    EXCELLENT: 120, // % of target
    GOOD: 100,
    ACCEPTABLE: 85,
    POOR: 70,
  },
} as const;

// ===== SHIPPING CONSTANTS =====

export const SHIPPING_DEFAULTS = {
  MAX_WEIGHT: 70000, // pounds
  MAX_DIMENSION: 999, // inches
  DIMENSIONAL_WEIGHT_DIVISOR: 139,
  DEFAULT_INSURANCE_RATE: 0.01, // 1% of declared value
  DELIVERY_CONFIRMATION_REQUIRED: true,
} as const;

export const SHIPPING_LIMITS = {
  MAX_SHIPMENT_NUMBER_LENGTH: 50,
  MAX_TRACKING_NUMBER_LENGTH: 50,
  MAX_DECLARED_VALUE: 100000, // dollars
  MIN_DECLARED_VALUE: 1,
  MAX_ADDRESS_LINE_LENGTH: 100,
  MAX_CITY_LENGTH: 50,
  MAX_STATE_LENGTH: 50,
  MAX_POSTAL_CODE_LENGTH: 20,
} as const;

export const CARRIER_CONFIGS = {
  UPS: {
    trackingNumberLength: 18,
    trackingNumberPattern: /^1Z[0-9A-Z]{16}$/,
    maxWeight: 150, // pounds
    maxDimension: 108, // inches
  },
  FEDEX: {
    trackingNumberLength: 12,
    trackingNumberPattern: /^[0-9]{12}$/,
    maxWeight: 150, // pounds
    maxDimension: 119, // inches
  },
  USPS: {
    trackingNumberLength: 22,
    trackingNumberPattern: /^[0-9]{22}$/,
    maxWeight: 70, // pounds
    maxDimension: 108, // inches
  },
} as const;

// ===== LOT TRACKING CONSTANTS =====

export const LOT_DEFAULTS = {
  EXPIRY_WARNING_DAYS: 30,
  CRITICAL_EXPIRY_DAYS: 7,
  MAX_LOT_NUMBER_LENGTH: 100,
  MAX_BATCH_NUMBER_LENGTH: 100,
  MAX_SERIAL_NUMBER_LENGTH: 100,
  FIFO_STRICT_MODE: true,
} as const;

export const LOT_LIMITS = {
  MAX_QUANTITY: 1000000,
  MIN_QUANTITY: 0.01,
  MAX_NOTES_LENGTH: 1000,
  MAX_REASON_LENGTH: 500,
} as const;

export const EXPIRY_THRESHOLDS = {
  CRITICAL: 7, // days
  WARNING: 30, // days
  NOTICE: 90, // days
} as const;

// ===== ASSEMBLY CONSTANTS =====

export const ASSEMBLY_DEFAULTS = {
  MAX_COMPONENTS_PER_KIT: 50,
  DEFAULT_ASSEMBLY_TIME: 30, // minutes
  MAX_ASSEMBLY_TIME: 480, // 8 hours
  DEFAULT_QUALITY_CHECKS: 3,
  MAX_QUALITY_CHECKS: 10,
  COMPONENT_SHORTAGE_THRESHOLD: 0.1, // 10%
} as const;

export const ASSEMBLY_LIMITS = {
  MAX_KIT_SKU_LENGTH: 100,
  MAX_KIT_NAME_LENGTH: 255,
  MAX_KIT_DESCRIPTION_LENGTH: 1000,
  MAX_WORK_ORDER_NUMBER_LENGTH: 50,
  MAX_QUANTITY_TO_ASSEMBLE: 100000,
  MIN_QUANTITY_TO_ASSEMBLE: 1,
  MAX_ASSEMBLY_INSTRUCTIONS_LENGTH: 5000,
} as const;

export const QUALITY_THRESHOLDS = {
  EXCELLENT: 99.0, // % pass rate
  GOOD: 95.0,
  ACCEPTABLE: 90.0,
  POOR: 85.0,
} as const;

// ===== PERFORMANCE CONSTANTS =====

export const PERFORMANCE_THRESHOLDS = {
  UTILIZATION: {
    CRITICAL: 95, // %
    HIGH: 85,
    MEDIUM: 70,
    LOW: 50,
  },
  ACCURACY: {
    EXCELLENT: 99.5, // %
    GOOD: 98.0,
    ACCEPTABLE: 95.0,
    POOR: 90.0,
  },
  EFFICIENCY: {
    EXCELLENT: 120, // % of target
    GOOD: 100,
    ACCEPTABLE: 85,
    POOR: 70,
  },
  THROUGHPUT: {
    HIGH: 100, // items per hour
    MEDIUM: 50,
    LOW: 25,
  },
} as const;

// ===== CACHE CONSTANTS =====

export const CACHE_KEYS = {
  WAREHOUSE: 'warehouse',
  WAREHOUSE_LIST: 'warehouse_list',
  WAREHOUSE_CAPACITY: 'warehouse_capacity',
  WAREHOUSE_ZONES: 'warehouse_zones',
  BIN_LOCATIONS: 'bin_locations',
  PICKING_WAVES: 'picking_waves',
  PICK_LISTS: 'pick_lists',
  SHIPMENTS: 'shipments',
  LOTS: 'lots',
  KIT_DEFINITIONS: 'kit_definitions',
  ASSEMBLY_WORK_ORDERS: 'assembly_work_orders',
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// ===== POLLING INTERVALS =====

export const POLLING_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FREQUENT: 30000, // 30 seconds
  NORMAL: 60000, // 1 minute
  SLOW: 300000, // 5 minutes
  VERY_SLOW: 900000, // 15 minutes
} as const;

// ===== STATUS COLORS =====

export const STATUS_COLORS = {
  WAREHOUSE_STATUS: {
    [WarehouseStatus.ACTIVE]: '#10B981', // green
    [WarehouseStatus.INACTIVE]: '#6B7280', // gray
    [WarehouseStatus.MAINTENANCE]: '#F59E0B', // yellow
    [WarehouseStatus.CLOSED]: '#EF4444', // red
  },
  BIN_STATUS: {
    [BinLocationStatus.AVAILABLE]: '#10B981', // green
    [BinLocationStatus.OCCUPIED]: '#3B82F6', // blue
    [BinLocationStatus.RESERVED]: '#F59E0B', // yellow
    [BinLocationStatus.BLOCKED]: '#EF4444', // red
    [BinLocationStatus.MAINTENANCE]: '#F59E0B', // yellow
    [BinLocationStatus.DAMAGED]: '#EF4444', // red
  },
  WAVE_STATUS: {
    [PickingWaveStatus.PLANNING]: '#6B7280', // gray
    [PickingWaveStatus.PLANNED]: '#3B82F6', // blue
    [PickingWaveStatus.RELEASED]: '#F59E0B', // yellow
    [PickingWaveStatus.READY]: '#10B981', // green
    [PickingWaveStatus.IN_PROGRESS]: '#8B5CF6', // purple
    [PickingWaveStatus.COMPLETED]: '#10B981', // green
    [PickingWaveStatus.CANCELLED]: '#EF4444', // red
  },
  SHIPMENT_STATUS: {
    [ShipmentStatus.PENDING]: '#6B7280', // gray
    [ShipmentStatus.PROCESSING]: '#3B82F6', // blue
    [ShipmentStatus.SHIPPED]: '#F59E0B', // yellow
    [ShipmentStatus.IN_TRANSIT]: '#8B5CF6', // purple
    [ShipmentStatus.DELIVERED]: '#10B981', // green
    [ShipmentStatus.EXCEPTION]: '#EF4444', // red
    [ShipmentStatus.CANCELLED]: '#EF4444', // red
  },
  LOT_STATUS: {
    [LotStatus.ACTIVE]: '#10B981', // green
    [LotStatus.CONSUMED]: '#6B7280', // gray
    [LotStatus.EXPIRED]: '#EF4444', // red
    [LotStatus.RECALLED]: '#EF4444', // red
    [LotStatus.QUARANTINE]: '#F59E0B', // yellow
  },
  ASSEMBLY_STATUS: {
    [AssemblyWorkOrderStatus.PENDING]: '#6B7280', // gray
    [AssemblyWorkOrderStatus.PLANNED]: '#3B82F6', // blue
    [AssemblyWorkOrderStatus.IN_PROGRESS]: '#8B5CF6', // purple
    [AssemblyWorkOrderStatus.COMPLETED]: '#10B981', // green
    [AssemblyWorkOrderStatus.CANCELLED]: '#EF4444', // red
    [AssemblyWorkOrderStatus.ON_HOLD]: '#F59E0B', // yellow
  },
} as const;

// ===== PRIORITY COLORS =====

export const PRIORITY_COLORS = {
  1: '#6B7280', // gray - lowest
  2: '#6B7280', // gray - low
  3: '#3B82F6', // blue - low
  4: '#3B82F6', // blue - medium
  5: '#F59E0B', // yellow - medium
  6: '#F59E0B', // yellow - high
  7: '#EF4444', // red - high
  8: '#EF4444', // red - urgent
  9: '#DC2626', // dark red - urgent
  10: '#DC2626', // dark red - critical
} as const;

// ===== UTILIZATION COLORS =====

export const UTILIZATION_COLORS = {
  LOW: '#10B981', // green (0-50%)
  MEDIUM: '#F59E0B', // yellow (50-85%)
  HIGH: '#EF4444', // red (85-95%)
  CRITICAL: '#DC2626', // dark red (95%+)
} as const;

// ===== MEASUREMENT UNITS =====

export const UNITS = {
  WEIGHT: ['lbs', 'kg', 'oz', 'g', 'tons'],
  LENGTH: ['in', 'ft', 'cm', 'm', 'mm'],
  AREA: ['sq ft', 'sq m', 'sq in'],
  VOLUME: ['cu ft', 'cu m', 'cu in', 'liters', 'gallons'],
  TEMPERATURE: ['°F', '°C'],
  CURRENCY: ['USD', 'EUR', 'GBP', 'CAD'],
} as const;

// ===== REGEX PATTERNS =====

export const PATTERNS = {
  WAREHOUSE_CODE: /^[A-Z0-9_-]+$/i,
  BIN_CODE: /^[A-Z0-9_-]+$/i,
  LOT_NUMBER: /^[A-Z0-9_-]+$/i,
  KIT_SKU: /^[A-Z0-9_-]+$/i,
  POSTAL_CODE_US: /^\d{5}(-\d{4})?$/,
  POSTAL_CODE_CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  PHONE_NUMBER: /^\+?[\d\s\-\(\)]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ===== ERROR CODES =====

export const ERROR_CODES = {
  VALIDATION: {
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',
    OUT_OF_RANGE: 'OUT_OF_RANGE',
    DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  },
  BUSINESS_RULE: {
    INSUFFICIENT_CAPACITY: 'INSUFFICIENT_CAPACITY',
    INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
    OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  },
  SYSTEM: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
  },
} as const;

// ===== FEATURE FLAGS =====

export const FEATURE_FLAGS = {
  ADVANCED_PICKING: 'advanced_picking',
  LOT_TRACKING: 'lot_tracking',
  KIT_ASSEMBLY: 'kit_assembly',
  REAL_TIME_UPDATES: 'real_time_updates',
  PERFORMANCE_MONITORING: 'performance_monitoring',
  MOBILE_SCANNING: 'mobile_scanning',
  VOICE_PICKING: 'voice_picking',
  AUTOMATED_REPLENISHMENT: 'automated_replenishment',
} as const;