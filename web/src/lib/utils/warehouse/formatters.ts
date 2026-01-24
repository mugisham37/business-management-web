/**
 * Warehouse Formatting Utilities
 * Data formatting functions for warehouse operations
 */

import {
  WarehouseStatus,
  WarehouseZoneType,
  BinLocationStatus,
  PickingWaveStatus,
  PickListStatus,
  ShipmentStatus,
  LotStatus,
  AssemblyWorkOrderStatus,
  LayoutType,
  SecurityLevel,
} from '@/types/warehouse';

// ===== STATUS FORMATTERS =====

/**
 * Format warehouse status for display
 */
export function formatWarehouseStatus(status: WarehouseStatus): string {
  const statusMap: Record<WarehouseStatus, string> = {
    [WarehouseStatus.ACTIVE]: 'Active',
    [WarehouseStatus.INACTIVE]: 'Inactive',
    [WarehouseStatus.MAINTENANCE]: 'Under Maintenance',
    [WarehouseStatus.CLOSED]: 'Closed',
  };

  return statusMap[status] || status;
}

/**
 * Format warehouse zone type for display
 */
export function formatWarehouseZoneType(zoneType: WarehouseZoneType): string {
  const zoneTypeMap: Record<WarehouseZoneType, string> = {
    [WarehouseZoneType.RECEIVING]: 'Receiving',
    [WarehouseZoneType.STORAGE]: 'Storage',
    [WarehouseZoneType.PICKING]: 'Picking',
    [WarehouseZoneType.PACKING]: 'Packing',
    [WarehouseZoneType.SHIPPING]: 'Shipping',
    [WarehouseZoneType.STAGING]: 'Staging',
    [WarehouseZoneType.QUARANTINE]: 'Quarantine',
    [WarehouseZoneType.RETURNS]: 'Returns',
    [WarehouseZoneType.COLD_STORAGE]: 'Cold Storage',
    [WarehouseZoneType.HAZMAT]: 'Hazmat',
  };

  return zoneTypeMap[zoneType] || zoneType;
}

/**
 * Format bin location status for display
 */
export function formatBinLocationStatus(status: BinLocationStatus): string {
  const statusMap: Record<BinLocationStatus, string> = {
    [BinLocationStatus.AVAILABLE]: 'Available',
    [BinLocationStatus.OCCUPIED]: 'Occupied',
    [BinLocationStatus.RESERVED]: 'Reserved',
    [BinLocationStatus.BLOCKED]: 'Blocked',
    [BinLocationStatus.MAINTENANCE]: 'Under Maintenance',
    [BinLocationStatus.DAMAGED]: 'Damaged',
  };

  return statusMap[status] || status;
}

/**
 * Format picking wave status for display
 */
export function formatPickingWaveStatus(status: PickingWaveStatus): string {
  const statusMap: Record<PickingWaveStatus, string> = {
    [PickingWaveStatus.PLANNING]: 'Planning',
    [PickingWaveStatus.PLANNED]: 'Planned',
    [PickingWaveStatus.RELEASED]: 'Released',
    [PickingWaveStatus.READY]: 'Ready',
    [PickingWaveStatus.IN_PROGRESS]: 'In Progress',
    [PickingWaveStatus.COMPLETED]: 'Completed',
    [PickingWaveStatus.CANCELLED]: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Format pick list status for display
 */
export function formatPickListStatus(status: PickListStatus): string {
  const statusMap: Record<PickListStatus, string> = {
    [PickListStatus.PENDING]: 'Pending',
    [PickListStatus.ASSIGNED]: 'Assigned',
    [PickListStatus.IN_PROGRESS]: 'In Progress',
    [PickListStatus.COMPLETED]: 'Completed',
    [PickListStatus.CANCELLED]: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Format shipment status for display
 */
export function formatShipmentStatus(status: ShipmentStatus): string {
  const statusMap: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'Pending',
    [ShipmentStatus.PROCESSING]: 'Processing',
    [ShipmentStatus.SHIPPED]: 'Shipped',
    [ShipmentStatus.IN_TRANSIT]: 'In Transit',
    [ShipmentStatus.DELIVERED]: 'Delivered',
    [ShipmentStatus.EXCEPTION]: 'Exception',
    [ShipmentStatus.CANCELLED]: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Format lot status for display
 */
export function formatLotStatus(status: LotStatus): string {
  const statusMap: Record<LotStatus, string> = {
    [LotStatus.ACTIVE]: 'Active',
    [LotStatus.CONSUMED]: 'Consumed',
    [LotStatus.EXPIRED]: 'Expired',
    [LotStatus.RECALLED]: 'Recalled',
    [LotStatus.QUARANTINE]: 'Quarantined',
  };

  return statusMap[status] || status;
}

/**
 * Format assembly work order status for display
 */
export function formatAssemblyWorkOrderStatus(status: AssemblyWorkOrderStatus): string {
  const statusMap: Record<AssemblyWorkOrderStatus, string> = {
    [AssemblyWorkOrderStatus.PENDING]: 'Pending',
    [AssemblyWorkOrderStatus.PLANNED]: 'Planned',
    [AssemblyWorkOrderStatus.IN_PROGRESS]: 'In Progress',
    [AssemblyWorkOrderStatus.COMPLETED]: 'Completed',
    [AssemblyWorkOrderStatus.CANCELLED]: 'Cancelled',
    [AssemblyWorkOrderStatus.ON_HOLD]: 'On Hold',
  };

  return statusMap[status] || status;
}

/**
 * Format layout type for display
 */
export function formatLayoutType(layoutType: LayoutType): string {
  const layoutMap: Record<LayoutType, string> = {
    [LayoutType.GRID]: 'Grid Layout',
    [LayoutType.FLOW]: 'Flow Layout',
    [LayoutType.HYBRID]: 'Hybrid Layout',
  };

  return layoutMap[layoutType] || layoutType;
}

/**
 * Format security level for display
 */
export function formatSecurityLevel(securityLevel: SecurityLevel): string {
  const securityMap: Record<SecurityLevel, string> = {
    [SecurityLevel.BASIC]: 'Basic Security',
    [SecurityLevel.STANDARD]: 'Standard Security',
    [SecurityLevel.HIGH]: 'High Security',
    [SecurityLevel.MAXIMUM]: 'Maximum Security',
  };

  return securityMap[securityLevel] || securityLevel;
}

// ===== NUMERIC FORMATTERS =====

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  includeSymbol: boolean = true
): string {
  const formatted = value.toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format number with thousands separators
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format weight with unit
 */
export function formatWeight(
  value: number,
  unit: string = 'lbs',
  decimals: number = 2
): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format dimensions
 */
export function formatDimensions(
  length: number,
  width: number,
  height: number,
  unit: string = 'in'
): string {
  return `${formatNumber(length)} × ${formatNumber(width)} × ${formatNumber(height)} ${unit}`;
}

/**
 * Format area (square footage)
 */
export function formatArea(
  value: number,
  unit: string = 'sq ft',
  decimals: number = 0
): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format volume
 */
export function formatVolume(
  value: number,
  unit: string = 'cu ft',
  decimals: number = 2
): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

// ===== DATE AND TIME FORMATTERS =====

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return dateObj.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Format time duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Format days until expiry
 */
export function formatDaysUntilExpiry(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  if (days <= 30) return `Expires in ${Math.ceil(days / 7)} weeks`;
  return `Expires in ${Math.ceil(days / 30)} months`;
}

// ===== ADDRESS FORMATTERS =====

/**
 * Format address for display
 */
export function formatAddress(address: {
  name?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}): string {
  const lines: string[] = [];
  
  if (address.name) lines.push(address.name);
  if (address.company) lines.push(address.company);
  
  lines.push(address.street1);
  if (address.street2) lines.push(address.street2);
  
  lines.push(`${address.city}, ${address.state} ${address.postalCode}`);
  
  if (address.country && address.country !== 'US') {
    lines.push(address.country);
  }
  
  return lines.join('\n');
}

/**
 * Format address for single line display
 */
export function formatAddressOneLine(address: {
  street1: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  return `${address.street1}, ${address.city}, ${address.state} ${address.postalCode}`;
}

// ===== CODE FORMATTERS =====

/**
 * Format warehouse code for display
 */
export function formatWarehouseCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Format bin location code for display
 */
export function formatBinLocationCode(
  aisle?: string,
  bay?: string,
  level?: string,
  position?: string
): string {
  const parts = [aisle, bay, level, position].filter(Boolean);
  return parts.join('-').toUpperCase();
}

/**
 * Format tracking number for display
 */
export function formatTrackingNumber(trackingNumber: string): string {
  // Add spaces for readability (common formats)
  if (trackingNumber.length === 12) {
    // UPS format: 1Z999AA1234567890
    return trackingNumber.replace(/(.{2})(.{6})(.{8})/, '$1 $2 $3');
  }
  
  if (trackingNumber.length === 22) {
    // FedEx format: 9612019012345678901234
    return trackingNumber.replace(/(.{4})(.{4})(.{4})(.{4})(.{4})(.{2})/, '$1 $2 $3 $4 $5 $6');
  }
  
  return trackingNumber;
}

// ===== PRIORITY AND LEVEL FORMATTERS =====

/**
 * Format priority level for display
 */
export function formatPriority(priority: number): string {
  if (priority >= 8) return 'Urgent';
  if (priority >= 6) return 'High';
  if (priority >= 4) return 'Medium';
  if (priority >= 2) return 'Low';
  return 'Lowest';
}

/**
 * Format utilization level for display
 */
export function formatUtilizationLevel(percentage: number): string {
  if (percentage >= 95) return 'Critical';
  if (percentage >= 85) return 'High';
  if (percentage >= 70) return 'Medium';
  if (percentage >= 50) return 'Low';
  return 'Minimal';
}

/**
 * Format occupancy level for display
 */
export function formatOccupancyLevel(percentage: number): string {
  if (percentage >= 90) return 'Full';
  if (percentage >= 75) return 'High';
  if (percentage >= 50) return 'Medium';
  if (percentage > 0) return 'Low';
  return 'Empty';
}

// ===== LIST FORMATTERS =====

/**
 * Format array of items as comma-separated list
 */
export function formatList(
  items: string[],
  conjunction: string = 'and'
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0] ?? ''} ${conjunction} ${items[1] ?? ''}`;
  
  const lastItem = items[items.length - 1] ?? '';
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

/**
 * Format picker names for display
 */
export function formatPickerNames(pickers: Array<{ firstName: string; lastName: string }>): string {
  const names = pickers.map(picker => `${picker.firstName} ${picker.lastName}`);
  return formatList(names);
}

// ===== UTILITY FORMATTERS =====

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  return phoneNumber;
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format null/undefined values
 */
export function formatNullable<T>(
  value: T | null | undefined,
  formatter: (value: T) => string,
  defaultValue: string = 'N/A'
): string {
  return value != null ? formatter(value) : defaultValue;
}