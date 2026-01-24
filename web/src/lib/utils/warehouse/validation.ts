/**
 * Warehouse Validation Utilities
 * Business rule validations for warehouse operations
 */

import {
  Warehouse,
  WarehouseStatus,
  WarehouseZoneType,
  PickingWaveStatus,
  CreateWarehouseInput,
  Address,
} from '@/types/warehouse';

// ===== VALIDATION RESULT TYPES =====

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ===== WAREHOUSE VALIDATIONS =====

/**
 * Validate warehouse code format
 */
export function validateWarehouseCode(code: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!code) {
    errors.push({ field: 'warehouseCode', message: 'Warehouse code is required' });
    return errors;
  }

  if (code.length < 2) {
    errors.push({ field: 'warehouseCode', message: 'Warehouse code must be at least 2 characters' });
  }

  if (code.length > 50) {
    errors.push({ field: 'warehouseCode', message: 'Warehouse code must be less than 50 characters' });
  }

  if (!/^[A-Z0-9_-]+$/i.test(code)) {
    errors.push({ 
      field: 'warehouseCode', 
      message: 'Warehouse code can only contain letters, numbers, hyphens, and underscores' 
    });
  }

  return errors;
}

/**
 * Validate warehouse name
 */
export function validateWarehouseName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Warehouse name is required' });
    return errors;
  }

  if (name.length > 255) {
    errors.push({ field: 'name', message: 'Warehouse name must be less than 255 characters' });
  }

  return errors;
}

/**
 * Validate warehouse dimensions
 */
export function validateWarehouseDimensions(
  totalSquareFootage?: number,
  storageSquareFootage?: number,
  ceilingHeight?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (totalSquareFootage !== undefined) {
    if (totalSquareFootage <= 0) {
      errors.push({ field: 'totalSquareFootage', message: 'Total square footage must be greater than 0' });
    }
    if (totalSquareFootage > 10000000) {
      errors.push({ field: 'totalSquareFootage', message: 'Total square footage seems unreasonably large' });
    }
  }

  if (storageSquareFootage !== undefined && totalSquareFootage !== undefined) {
    if (storageSquareFootage > totalSquareFootage) {
      errors.push({ 
        field: 'storageSquareFootage', 
        message: 'Storage square footage cannot exceed total square footage' 
      });
    }
  }

  if (ceilingHeight !== undefined) {
    if (ceilingHeight <= 0) {
      errors.push({ field: 'ceilingHeight', message: 'Ceiling height must be greater than 0' });
    }
    if (ceilingHeight > 100) {
      errors.push({ field: 'ceilingHeight', message: 'Ceiling height seems unreasonably high' });
    }
  }

  return errors;
}

/**
 * Validate warehouse capacity
 */
export function validateWarehouseCapacity(
  maxCapacityUnits?: number,
  currentCapacityUnits?: number,
  totalBinLocations?: number,
  occupiedBinLocations?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (maxCapacityUnits !== undefined && maxCapacityUnits < 0) {
    errors.push({ field: 'maxCapacityUnits', message: 'Max capacity cannot be negative' });
  }

  if (currentCapacityUnits !== undefined && currentCapacityUnits < 0) {
    errors.push({ field: 'currentCapacityUnits', message: 'Current capacity cannot be negative' });
  }

  if (maxCapacityUnits !== undefined && currentCapacityUnits !== undefined) {
    if (currentCapacityUnits > maxCapacityUnits) {
      errors.push({ 
        field: 'currentCapacityUnits', 
        message: 'Current capacity cannot exceed max capacity' 
      });
    }
  }

  if (totalBinLocations !== undefined && totalBinLocations < 0) {
    errors.push({ field: 'totalBinLocations', message: 'Total bin locations cannot be negative' });
  }

  if (occupiedBinLocations !== undefined && occupiedBinLocations < 0) {
    errors.push({ field: 'occupiedBinLocations', message: 'Occupied bin locations cannot be negative' });
  }

  if (totalBinLocations !== undefined && occupiedBinLocations !== undefined) {
    if (occupiedBinLocations > totalBinLocations) {
      errors.push({ 
        field: 'occupiedBinLocations', 
        message: 'Occupied bin locations cannot exceed total bin locations' 
      });
    }
  }

  return errors;
}

/**
 * Validate create warehouse input
 */
export function validateCreateWarehouseInput(input: CreateWarehouseInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!input.locationId) {
    errors.push({ field: 'locationId', message: 'Location is required' });
  }

  // Warehouse code validation
  errors.push(...validateWarehouseCode(input.warehouseCode));

  // Warehouse name validation
  errors.push(...validateWarehouseName(input.name));

  // Dimensions validation
  errors.push(...validateWarehouseDimensions(
    input.totalSquareFootage,
    input.storageSquareFootage,
    input.ceilingHeight
  ));

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ===== WAREHOUSE ZONE VALIDATIONS =====

/**
 * Validate zone code format
 */
export function validateZoneCode(code: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!code) {
    errors.push({ field: 'zoneCode', message: 'Zone code is required' });
    return errors;
  }

  if (code.length < 1) {
    errors.push({ field: 'zoneCode', message: 'Zone code is required' });
  }

  if (code.length > 50) {
    errors.push({ field: 'zoneCode', message: 'Zone code must be less than 50 characters' });
  }

  return errors;
}

/**
 * Validate zone type compatibility
 */
export function validateZoneTypeCompatibility(
  zoneType: WarehouseZoneType,
  temperatureControlled?: boolean,
  allowMixedProducts?: boolean
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Hazmat zones should not allow mixed products
  if (zoneType === WarehouseZoneType.HAZMAT && allowMixedProducts) {
    errors.push({ 
      field: 'allowMixedProducts', 
      message: 'Hazmat zones should not allow mixed products for safety reasons' 
    });
  }

  // Cold storage zones should be temperature controlled
  if (zoneType === WarehouseZoneType.COLD_STORAGE && !temperatureControlled) {
    errors.push({ 
      field: 'temperatureControlled', 
      message: 'Cold storage zones must be temperature controlled' 
    });
  }

  // Quarantine zones should not allow mixed products
  if (zoneType === WarehouseZoneType.QUARANTINE && allowMixedProducts) {
    errors.push({ 
      field: 'allowMixedProducts', 
      message: 'Quarantine zones should not allow mixed products' 
    });
  }

  return errors;
}

// ===== BIN LOCATION VALIDATIONS =====

/**
 * Validate bin code format
 */
export function validateBinCode(code: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!code) {
    errors.push({ field: 'binCode', message: 'Bin code is required' });
    return errors;
  }

  if (code.length < 1) {
    errors.push({ field: 'binCode', message: 'Bin code is required' });
  }

  if (code.length > 50) {
    errors.push({ field: 'binCode', message: 'Bin code must be less than 50 characters' });
  }

  if (!/^[A-Z0-9_-]+$/i.test(code)) {
    errors.push({ 
      field: 'binCode', 
      message: 'Bin code can only contain letters, numbers, hyphens, and underscores' 
    });
  }

  return errors;
}

/**
 * Validate bin dimensions
 */
export function validateBinDimensions(
  length?: number,
  width?: number,
  height?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (length !== undefined && length <= 0) {
    errors.push({ field: 'length', message: 'Length must be greater than 0' });
  }

  if (width !== undefined && width <= 0) {
    errors.push({ field: 'width', message: 'Width must be greater than 0' });
  }

  if (height !== undefined && height <= 0) {
    errors.push({ field: 'height', message: 'Height must be greater than 0' });
  }

  return errors;
}

/**
 * Validate bin capacity
 */
export function validateBinCapacity(
  maxCapacity?: number,
  maxWeight?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (maxCapacity !== undefined && maxCapacity <= 0) {
    errors.push({ field: 'maxCapacity', message: 'Max capacity must be greater than 0' });
  }

  if (maxWeight !== undefined && maxWeight <= 0) {
    errors.push({ field: 'maxWeight', message: 'Max weight must be greater than 0' });
  }

  return errors;
}

// ===== PICKING VALIDATIONS =====

/**
 * Validate picking wave priority
 */
export function validateWavePriority(priority: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (priority < 1) {
    errors.push({ field: 'priority', message: 'Priority must be at least 1' });
  }

  if (priority > 10) {
    errors.push({ field: 'priority', message: 'Priority cannot exceed 10' });
  }

  return errors;
}

/**
 * Validate picking wave dates
 */
export function validateWaveDates(
  plannedDate?: Date,
  scheduledDate?: Date
): ValidationError[] {
  const errors: ValidationError[] = [];
  const now = new Date();

  if (plannedDate && plannedDate < now) {
    errors.push({ field: 'plannedDate', message: 'Planned date cannot be in the past' });
  }

  if (scheduledDate && scheduledDate < now) {
    errors.push({ field: 'scheduledDate', message: 'Scheduled date cannot be in the past' });
  }

  if (plannedDate && scheduledDate && scheduledDate < plannedDate) {
    errors.push({ 
      field: 'scheduledDate', 
      message: 'Scheduled date cannot be before planned date' 
    });
  }

  return errors;
}

/**
 * Validate wave status transition
 */
export function validateWaveStatusTransition(
  currentStatus: PickingWaveStatus,
  newStatus: PickingWaveStatus
): ValidationError[] {
  const errors: ValidationError[] = [];

  const validTransitions: Record<PickingWaveStatus, PickingWaveStatus[]> = {
    [PickingWaveStatus.PLANNING]: [PickingWaveStatus.PLANNED, PickingWaveStatus.CANCELLED],
    [PickingWaveStatus.PLANNED]: [PickingWaveStatus.RELEASED, PickingWaveStatus.CANCELLED],
    [PickingWaveStatus.RELEASED]: [PickingWaveStatus.READY, PickingWaveStatus.IN_PROGRESS, PickingWaveStatus.CANCELLED],
    [PickingWaveStatus.READY]: [PickingWaveStatus.IN_PROGRESS, PickingWaveStatus.CANCELLED],
    [PickingWaveStatus.IN_PROGRESS]: [PickingWaveStatus.COMPLETED, PickingWaveStatus.CANCELLED],
    [PickingWaveStatus.COMPLETED]: [],
    [PickingWaveStatus.CANCELLED]: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    errors.push({ 
      field: 'status', 
      message: `Cannot transition from ${currentStatus} to ${newStatus}` 
    });
  }

  return errors;
}

// ===== SHIPPING VALIDATIONS =====

/**
 * Validate address
 */
export function validateAddress(address: Address): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!address.street1 || address.street1.trim().length === 0) {
    errors.push({ field: 'street1', message: 'Street address is required' });
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!address.state || address.state.trim().length === 0) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  if (!address.postalCode || address.postalCode.trim().length === 0) {
    errors.push({ field: 'postalCode', message: 'Postal code is required' });
  }

  if (!address.country || address.country.trim().length === 0) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  // Validate postal code format (basic validation)
  if (address.postalCode && !/^[A-Z0-9\s-]+$/i.test(address.postalCode)) {
    errors.push({ field: 'postalCode', message: 'Invalid postal code format' });
  }

  return errors;
}

/**
 * Validate shipment weight and dimensions
 */
export function validateShipmentPhysical(
  weight?: number,
  dimensions?: { length: number; width: number; height: number }
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (weight !== undefined) {
    if (weight <= 0) {
      errors.push({ field: 'weight', message: 'Weight must be greater than 0' });
    }
    if (weight > 70000) { // 70,000 lbs is typical freight limit
      errors.push({ field: 'weight', message: 'Weight exceeds maximum shipping limit' });
    }
  }

  if (dimensions) {
    if (dimensions.length <= 0) {
      errors.push({ field: 'dimensions.length', message: 'Length must be greater than 0' });
    }
    if (dimensions.width <= 0) {
      errors.push({ field: 'dimensions.width', message: 'Width must be greater than 0' });
    }
    if (dimensions.height <= 0) {
      errors.push({ field: 'dimensions.height', message: 'Height must be greater than 0' });
    }

    // Check for reasonable maximum dimensions
    const maxDimension = 999; // inches
    if (dimensions.length > maxDimension || dimensions.width > maxDimension || dimensions.height > maxDimension) {
      errors.push({ field: 'dimensions', message: 'Dimensions exceed maximum shipping limits' });
    }
  }

  return errors;
}

// ===== LOT TRACKING VALIDATIONS =====

/**
 * Validate lot number format
 */
export function validateLotNumber(lotNumber: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!lotNumber || lotNumber.trim().length === 0) {
    errors.push({ field: 'lotNumber', message: 'Lot number is required' });
    return errors;
  }

  if (lotNumber.length > 100) {
    errors.push({ field: 'lotNumber', message: 'Lot number must be less than 100 characters' });
  }

  return errors;
}

/**
 * Validate lot dates
 */
export function validateLotDates(
  manufacturingDate?: Date,
  expiryDate?: Date,
  receivedDate?: Date
): ValidationError[] {
  const errors: ValidationError[] = [];
  const now = new Date();

  if (receivedDate && receivedDate > now) {
    errors.push({ field: 'receivedDate', message: 'Received date cannot be in the future' });
  }

  if (manufacturingDate && manufacturingDate > now) {
    errors.push({ field: 'manufacturingDate', message: 'Manufacturing date cannot be in the future' });
  }

  if (manufacturingDate && expiryDate && expiryDate <= manufacturingDate) {
    errors.push({ 
      field: 'expiryDate', 
      message: 'Expiry date must be after manufacturing date' 
    });
  }

  if (manufacturingDate && receivedDate && receivedDate < manufacturingDate) {
    errors.push({ 
      field: 'receivedDate', 
      message: 'Received date cannot be before manufacturing date' 
    });
  }

  return errors;
}

/**
 * Validate lot quantity
 */
export function validateLotQuantity(quantity: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
  }

  if (quantity > 1000000) {
    errors.push({ field: 'quantity', message: 'Quantity seems unreasonably large' });
  }

  return errors;
}

// ===== ASSEMBLY VALIDATIONS =====

/**
 * Validate kit SKU format
 */
export function validateKitSku(kitSku: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!kitSku || kitSku.trim().length === 0) {
    errors.push({ field: 'kitSku', message: 'Kit SKU is required' });
    return errors;
  }

  if (kitSku.length > 100) {
    errors.push({ field: 'kitSku', message: 'Kit SKU must be less than 100 characters' });
  }

  if (!/^[A-Z0-9_-]+$/i.test(kitSku)) {
    errors.push({ 
      field: 'kitSku', 
      message: 'Kit SKU can only contain letters, numbers, hyphens, and underscores' 
    });
  }

  return errors;
}

/**
 * Validate kit components
 */
export function validateKitComponents(components: Array<{ quantity: number }>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!components || components.length === 0) {
    errors.push({ field: 'components', message: 'At least one component is required' });
    return errors;
  }

  components.forEach((component, index) => {
    if (component.quantity <= 0) {
      errors.push({ 
        field: `components[${index}].quantity`, 
        message: 'Component quantity must be greater than 0' 
      });
    }
  });

  return errors;
}

/**
 * Validate assembly work order quantity
 */
export function validateAssemblyQuantity(quantityToAssemble: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (quantityToAssemble <= 0) {
    errors.push({ field: 'quantityToAssemble', message: 'Quantity to assemble must be greater than 0' });
  }

  if (quantityToAssemble > 100000) {
    errors.push({ field: 'quantityToAssemble', message: 'Quantity to assemble seems unreasonably large' });
  }

  return errors;
}

// ===== BUSINESS RULE VALIDATIONS =====

/**
 * Validate warehouse operational status
 */
export function validateWarehouseOperational(warehouse: Warehouse): ValidationError[] {
  const errors: ValidationError[] = [];

  if (warehouse.status !== WarehouseStatus.ACTIVE) {
    errors.push({ 
      field: 'status', 
      message: 'Warehouse must be active for operations' 
    });
  }

  return errors;
}

/**
 * Validate sufficient capacity for operation
 */
export function validateSufficientCapacity(
  currentCapacity: number,
  maxCapacity: number,
  requiredCapacity: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  const availableCapacity = maxCapacity - currentCapacity;
  
  if (requiredCapacity > availableCapacity) {
    errors.push({ 
      field: 'capacity', 
      message: `Insufficient capacity. Required: ${requiredCapacity}, Available: ${availableCapacity}` 
    });
  }

  return errors;
}

/**
 * Validate business hours operation
 */
export function validateBusinessHours(
  operationTime: Date,
  businessHours?: { start: string; end: string }
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!businessHours) return errors;

  const operationHour = operationTime.getHours();
  const startHourStr = businessHours.start?.split(':')[0];
  const endHourStr = businessHours.end?.split(':')[0];
  
  const startHour = startHourStr ? parseInt(startHourStr, 10) : 0;
  const endHour = endHourStr ? parseInt(endHourStr, 10) : 23;

  if (operationHour < startHour || operationHour >= endHour) {
    errors.push({ 
      field: 'operationTime', 
      message: `Operation must be within business hours (${businessHours.start} - ${businessHours.end})` 
    });
  }

  return errors;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  message: string,
  code?: string
): ValidationError {
  return {
    field,
    message,
    ...(code && { code }),
  };
}

/**
 * Check if validation has specific error
 */
export function hasValidationError(
  result: ValidationResult,
  field: string
): boolean {
  return result.errors.some(error => error.field === field);
}

/**
 * Get validation errors for specific field
 */
export function getValidationErrorsForField(
  result: ValidationResult,
  field: string
): ValidationError[] {
  return result.errors.filter(error => error.field === field);
}