/**
 * Location Utility Functions
 * Helper functions for location management operations
 */

import { Location } from '@/hooks/useLocations';

// Location status utilities
export const LOCATION_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;

export const LOCATION_TYPES = {
  STORE: 'STORE',
  WAREHOUSE: 'WAREHOUSE',
  OFFICE: 'OFFICE',
  DISTRIBUTION_CENTER: 'DISTRIBUTION_CENTER',
  FRANCHISE: 'FRANCHISE',
  KIOSK: 'KIOSK',
  MOBILE: 'MOBILE',
  POPUP: 'POPUP',
  HEADQUARTERS: 'HEADQUARTERS',
  BRANCH: 'BRANCH',
} as const;

export type LocationStatus = keyof typeof LOCATION_STATUSES;
export type LocationType = keyof typeof LOCATION_TYPES;

// Status utilities
export function getLocationStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'green';
    case 'INACTIVE': return 'gray';
    case 'CLOSED': return 'red';
    case 'PENDING': return 'yellow';
    case 'SUSPENDED': return 'orange';
    default: return 'gray';
  }
}

export function getLocationStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'INACTIVE': return 'Inactive';
    case 'CLOSED': return 'Closed';
    case 'PENDING': return 'Pending';
    case 'SUSPENDED': return 'Suspended';
    default: return status;
  }
}

export function getLocationTypeLabel(type: string): string {
  switch (type) {
    case 'STORE': return 'Store';
    case 'WAREHOUSE': return 'Warehouse';
    case 'OFFICE': return 'Office';
    case 'DISTRIBUTION_CENTER': return 'Distribution Center';
    case 'FRANCHISE': return 'Franchise';
    case 'KIOSK': return 'Kiosk';
    case 'MOBILE': return 'Mobile';
    case 'POPUP': return 'Pop-up';
    case 'HEADQUARTERS': return 'Headquarters';
    case 'BRANCH': return 'Branch';
    default: return type;
  }
}

export function getLocationTypeIcon(type: string): string {
  switch (type) {
    case 'STORE': return '🏪';
    case 'WAREHOUSE': return '🏭';
    case 'OFFICE': return '🏢';
    case 'DISTRIBUTION_CENTER': return '📦';
    case 'FRANCHISE': return '🏬';
    case 'KIOSK': return '🛒';
    case 'MOBILE': return '🚚';
    case 'POPUP': return '⛺';
    case 'HEADQUARTERS': return '🏛️';
    case 'BRANCH': return '🏪';
    default: return '📍';
  }
}

// Hierarchy utilities
export function buildLocationHierarchy(locations: Location[]): Location[] {
  const locationMap = new Map<string, Location>();
  const rootLocations: Location[] = [];

  // Create a map of all locations
  locations.forEach(location => {
    locationMap.set(location.id, { ...location, childLocations: [] });
  });

  // Build the hierarchy
  locations.forEach(location => {
    const locationWithChildren = locationMap.get(location.id)!;
    
    if (location.parentLocationId) {
      const parent = locationMap.get(location.parentLocationId);
      if (parent) {
        parent.childLocations = parent.childLocations || [];
        parent.childLocations.push(locationWithChildren);
      }
    } else {
      rootLocations.push(locationWithChildren);
    }
  });

  return rootLocations;
}

export function flattenLocationHierarchy(locations: Location[]): Location[] {
  const flattened: Location[] = [];

  function flatten(locs: Location[]) {
    locs.forEach(location => {
      flattened.push(location);
      if (location.childLocations && location.childLocations.length > 0) {
        flatten(location.childLocations);
      }
    });
  }

  flatten(locations);
  return flattened;
}

export function getLocationPath(location: Location, allLocations: Location[]): string[] {
  const path: string[] = [location.name];
  let current = location;

  while (current.parentLocationId) {
    const parent = allLocations.find(loc => loc.id === current.parentLocationId);
    if (parent) {
      path.unshift(parent.name);
      current = parent;
    } else {
      break;
    }
  }

  return path;
}

export function getLocationDepth(location: Location, allLocations: Location[]): number {
  let depth = 0;
  let current = location;

  while (current.parentLocationId) {
    const parent = allLocations.find(loc => loc.id === current.parentLocationId);
    if (parent) {
      depth++;
      current = parent;
    } else {
      break;
    }
  }

  return depth;
}

// Address utilities
export function formatAddress(address: Location['address'], format: 'short' | 'full' = 'full'): string {
  if (!address) return '';

  if (format === 'short') {
    return `${address.city}, ${address.state}`;
  }

  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
}

export function parseAddress(addressString: string): Partial<Location['address']> {
  // Simple address parsing - in production, use a proper address parsing service
  const parts = addressString.split(',').map(part => part.trim());
  
  if (parts.length >= 4) {
    return {
      street: parts[0],
      city: parts[1],
      state: parts[2].split(' ')[0],
      postalCode: parts[2].split(' ').slice(1).join(' '),
      country: parts[3],
    };
  }

  return {};
}

// Coordinates utilities
export function formatCoordinates(
  latitude: number,
  longitude: number,
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'decimal') {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // Convert to degrees, minutes, seconds
  const formatDMS = (decimal: number, isLatitude: boolean): string => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees) * 60 - minutes) * 60;
    const direction = isLatitude 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
  };

  return `${formatDMS(latitude, true)}, ${formatDMS(longitude, false)}`;
}

export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Operating hours utilities
export function formatOperatingHours(operatingHours?: Location['operatingHours']): string {
  if (!operatingHours) return 'Hours not specified';

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const hoursStrings: string[] = [];
  
  days.forEach((day, index) => {
    const dayHours = operatingHours[day];
    if (dayHours) {
      if (dayHours.closed) {
        hoursStrings.push(`${dayLabels[index]}: Closed`);
      } else {
        hoursStrings.push(`${dayLabels[index]}: ${dayHours.open} - ${dayHours.close}`);
      }
    }
  });

  return hoursStrings.join(', ');
}

export function isLocationOpen(
  operatingHours?: Location['operatingHours'],
  timezone?: string
): boolean {
  if (!operatingHours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const dayHours = operatingHours[currentDay];

  if (!dayHours || dayHours.closed) return false;

  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

// Search and filtering utilities
export function searchLocations(locations: Location[], searchTerm: string): Location[] {
  if (!searchTerm.trim()) return locations;

  const term = searchTerm.toLowerCase();
  
  return locations.filter(location => 
    location.name.toLowerCase().includes(term) ||
    location.code.toLowerCase().includes(term) ||
    location.description?.toLowerCase().includes(term) ||
    formatAddress(location.address).toLowerCase().includes(term) ||
    location.phone?.includes(term) ||
    location.email?.toLowerCase().includes(term)
  );
}

export function filterLocationsByStatus(locations: Location[], statuses: string[]): Location[] {
  if (statuses.length === 0) return locations;
  return locations.filter(location => statuses.includes(location.status));
}

export function filterLocationsByType(locations: Location[], types: string[]): Location[] {
  if (types.length === 0) return locations;
  return locations.filter(location => types.includes(location.locationType));
}

export function sortLocations(
  locations: Location[],
  sortBy: 'name' | 'code' | 'type' | 'status' | 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc'
): Location[] {
  return [...locations].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'code':
        aValue = a.code.toLowerCase();
        bValue = b.code.toLowerCase();
        break;
      case 'type':
        aValue = a.locationType;
        bValue = b.locationType;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// Validation utilities
export function validateLocationCode(code: string): string | null {
  if (!code) return 'Location code is required';
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return 'Code must contain only uppercase letters, numbers, underscores, and hyphens';
  }
  if (code.length > 50) return 'Code must be 50 characters or less';
  return null;
}

export function validateCoordinates(latitude?: number, longitude?: number): string | null {
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    return 'Latitude must be between -90 and 90 degrees';
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    return 'Longitude must be between -180 and 180 degrees';
  }
  return null;
}

// Export utilities
export function exportLocationsToCSV(locations: Location[]): void {
  const headers = [
    'ID',
    'Name',
    'Code',
    'Type',
    'Status',
    'Street',
    'City',
    'State',
    'Country',
    'Postal Code',
    'Phone',
    'Email',
    'Latitude',
    'Longitude',
    'Created At',
  ];

  const rows = locations.map(location => [
    location.id,
    location.name,
    location.code,
    location.locationType,
    location.status,
    location.address.street,
    location.address.city,
    location.address.state,
    location.address.country,
    location.address.postalCode,
    location.phone || '',
    location.email || '',
    location.latitude || '',
    location.longitude || '',
    new Date(location.createdAt).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `locations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}