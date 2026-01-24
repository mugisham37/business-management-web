/**
 * Warehouse Calculation Utilities
 * Mathematical calculations for warehouse operations
 */

import {
  Warehouse,
  WarehouseCapacity,
  PickList,
} from '@/types/warehouse';

// ===== CAPACITY CALCULATIONS =====

/**
 * Calculate warehouse utilization percentage
 */
export function calculateUtilizationPercentage(
  usedCapacity: number,
  totalCapacity: number
): number {
  if (totalCapacity <= 0) return 0;
  return Math.min((usedCapacity / totalCapacity) * 100, 100);
}

/**
 * Calculate available capacity
 */
export function calculateAvailableCapacity(
  totalCapacity: number,
  usedCapacity: number
): number {
  return Math.max(totalCapacity - usedCapacity, 0);
}

/**
 * Calculate bin location utilization
 */
export function calculateBinUtilization(
  occupiedBins: number,
  totalBins: number
): number {
  if (totalBins <= 0) return 0;
  return Math.min((occupiedBins / totalBins) * 100, 100);
}

/**
 * Calculate warehouse capacity metrics
 */
export function calculateWarehouseCapacityMetrics(
  warehouse: Warehouse
): WarehouseCapacity {
  const totalCapacity = warehouse.maxCapacityUnits || 0;
  const usedCapacity = warehouse.currentCapacityUnits || 0;
  const totalBinLocations = warehouse.totalBinLocations || 0;
  const occupiedBinLocations = warehouse.occupiedBinLocations || 0;

  return {
    warehouseId: warehouse.id,
    totalCapacity,
    usedCapacity,
    availableCapacity: calculateAvailableCapacity(totalCapacity, usedCapacity),
    utilizationPercentage: calculateUtilizationPercentage(usedCapacity, totalCapacity),
    totalBinLocations,
    occupiedBinLocations,
    availableBinLocations: Math.max(totalBinLocations - occupiedBinLocations, 0),
  };
}

/**
 * Calculate bin location volume
 */
export function calculateBinVolume(
  length?: number,
  width?: number,
  height?: number
): number {
  if (!length || !width || !height) return 0;
  return length * width * height;
}

/**
 * Calculate bin location capacity remaining
 */
export function calculateBinCapacityRemaining(
  maxCapacity: number,
  occupancyPercentage: number
): number {
  return maxCapacity * (1 - occupancyPercentage / 100);
}

// ===== PICKING CALCULATIONS =====

/**
 * Calculate picking wave completion percentage
 */
export function calculateWaveCompletionPercentage(
  completedItems: number,
  totalItems: number
): number {
  if (totalItems <= 0) return 0;
  return Math.min((completedItems / totalItems) * 100, 100);
}

/**
 * Calculate picking accuracy
 */
export function calculatePickingAccuracy(
  correctPicks: number,
  totalPicks: number
): number {
  if (totalPicks <= 0) return 100;
  return Math.min((correctPicks / totalPicks) * 100, 100);
}

/**
 * Calculate average pick time
 */
export function calculateAveragePickTime(
  totalPickTime: number,
  totalItems: number
): number {
  if (totalItems <= 0) return 0;
  return totalPickTime / totalItems;
}

/**
 * Calculate picking wave efficiency
 */
export function calculateWaveEfficiency(
  actualPickTime: number,
  estimatedPickTime: number
): number {
  if (actualPickTime <= 0 || estimatedPickTime <= 0) return 0;
  return Math.min((estimatedPickTime / actualPickTime) * 100, 200); // Cap at 200% efficiency
}

/**
 * Calculate pick list completion percentage
 */
export function calculatePickListCompletion(pickList: PickList): number {
  const totalItems = pickList.totalItems || 0;
  const pickedItems = pickList.pickedItems || 0;
  
  if (totalItems <= 0) return 0;
  return Math.min((pickedItems / totalItems) * 100, 100);
}

/**
 * Calculate estimated completion time for picking wave
 */
export function calculateEstimatedCompletionTime(
  remainingItems: number,
  averagePickTimePerItem: number,
  numberOfPickers: number = 1
): Date {
  const totalTimeMinutes = (remainingItems * averagePickTimePerItem) / numberOfPickers;
  const completionTime = new Date();
  completionTime.setMinutes(completionTime.getMinutes() + totalTimeMinutes);
  return completionTime;
}

// ===== SHIPPING CALCULATIONS =====

/**
 * Calculate shipping cost per unit
 */
export function calculateShippingCostPerUnit(
  totalShippingCost: number,
  totalUnits: number
): number {
  if (totalUnits <= 0) return 0;
  return totalShippingCost / totalUnits;
}

/**
 * Calculate transit time in days
 */
export function calculateTransitDays(
  shippedDate: Date,
  deliveredDate: Date
): number {
  const timeDiff = deliveredDate.getTime() - shippedDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate on-time delivery rate
 */
export function calculateOnTimeDeliveryRate(
  onTimeDeliveries: number,
  totalDeliveries: number
): number {
  if (totalDeliveries <= 0) return 0;
  return (onTimeDeliveries / totalDeliveries) * 100;
}

/**
 * Calculate shipping volume utilization
 */
export function calculateShippingVolumeUtilization(
  usedVolume: number,
  totalVolume: number
): number {
  if (totalVolume <= 0) return 0;
  return Math.min((usedVolume / totalVolume) * 100, 100);
}

/**
 * Calculate dimensional weight
 */
export function calculateDimensionalWeight(
  length: number,
  width: number,
  height: number,
  divisor: number = 139 // Standard dimensional weight divisor
): number {
  return (length * width * height) / divisor;
}

// ===== LOT TRACKING CALCULATIONS =====

/**
 * Calculate days until expiry
 */
export function calculateDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const timeDiff = expiryDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate lot turnover rate
 */
export function calculateLotTurnoverRate(
  consumedQuantity: number,
  averageInventory: number,
  periodDays: number
): number {
  if (averageInventory <= 0 || periodDays <= 0) return 0;
  return (consumedQuantity / averageInventory) * (365 / periodDays);
}

/**
 * Calculate FIFO compliance percentage
 */
export function calculateFIFOCompliance(
  fifoCompliantPicks: number,
  totalPicks: number
): number {
  if (totalPicks <= 0) return 100;
  return (fifoCompliantPicks / totalPicks) * 100;
}

/**
 * Calculate lot aging in days
 */
export function calculateLotAge(receivedDate: Date): number {
  const now = new Date();
  const timeDiff = now.getTime() - receivedDate.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

// ===== ASSEMBLY CALCULATIONS =====

/**
 * Calculate assembly completion percentage
 */
export function calculateAssemblyCompletion(
  quantityAssembled: number,
  quantityToAssemble: number
): number {
  if (quantityToAssemble <= 0) return 0;
  return Math.min((quantityAssembled / quantityToAssemble) * 100, 100);
}

/**
 * Calculate assembly efficiency
 */
export function calculateAssemblyEfficiency(
  actualTime: number,
  estimatedTime: number
): number {
  if (actualTime <= 0 || estimatedTime <= 0) return 0;
  return Math.min((estimatedTime / actualTime) * 100, 200);
}

/**
 * Calculate component shortage percentage
 */
export function calculateComponentShortagePercentage(
  shortageComponents: number,
  totalComponents: number
): number {
  if (totalComponents <= 0) return 0;
  return (shortageComponents / totalComponents) * 100;
}

/**
 * Calculate quality pass rate
 */
export function calculateQualityPassRate(
  passedChecks: number,
  totalChecks: number
): number {
  if (totalChecks <= 0) return 100;
  return (passedChecks / totalChecks) * 100;
}

/**
 * Calculate kit cost based on components
 */
export function calculateKitCost(
  components: Array<{ quantity: number; unitCost: number }>,
  laborCost: number = 0,
  overheadPercentage: number = 0
): number {
  const materialCost = components.reduce((total, component) => 
    total + (component.quantity * component.unitCost), 0
  );
  
  const totalDirectCost = materialCost + laborCost;
  const overheadCost = totalDirectCost * (overheadPercentage / 100);
  
  return totalDirectCost + overheadCost;
}

// ===== PERFORMANCE CALCULATIONS =====

/**
 * Calculate warehouse throughput per hour
 */
export function calculateThroughputPerHour(
  totalItems: number,
  totalHours: number
): number {
  if (totalHours <= 0) return 0;
  return totalItems / totalHours;
}

/**
 * Calculate space utilization efficiency
 */
export function calculateSpaceUtilizationEfficiency(
  usedSquareFootage: number,
  totalSquareFootage: number
): number {
  if (totalSquareFootage <= 0) return 0;
  return (usedSquareFootage / totalSquareFootage) * 100;
}

/**
 * Calculate labor productivity
 */
export function calculateLaborProductivity(
  totalItemsProcessed: number,
  totalLaborHours: number
): number {
  if (totalLaborHours <= 0) return 0;
  return totalItemsProcessed / totalLaborHours;
}

/**
 * Calculate inventory accuracy
 */
export function calculateInventoryAccuracy(
  accurateRecords: number,
  totalRecords: number
): number {
  if (totalRecords <= 0) return 100;
  return (accurateRecords / totalRecords) * 100;
}

// ===== COST CALCULATIONS =====

/**
 * Calculate cost per square foot
 */
export function calculateCostPerSquareFoot(
  totalCost: number,
  squareFootage: number
): number {
  if (squareFootage <= 0) return 0;
  return totalCost / squareFootage;
}

/**
 * Calculate cost per unit stored
 */
export function calculateCostPerUnitStored(
  totalOperatingCost: number,
  totalUnitsStored: number
): number {
  if (totalUnitsStored <= 0) return 0;
  return totalOperatingCost / totalUnitsStored;
}

/**
 * Calculate ROI for warehouse improvements
 */
export function calculateWarehouseROI(
  annualSavings: number,
  investmentCost: number
): number {
  if (investmentCost <= 0) return 0;
  return ((annualSavings - investmentCost) / investmentCost) * 100;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Round to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  values: number[],
  windowSize: number
): number[] {
  if (values.length < windowSize) return values;
  
  const movingAverages: number[] = [];
  
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    movingAverages.push(average);
  }
  
  return movingAverages;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}