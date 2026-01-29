/**
 * useLocations Hook
 * Manages location data and operations
 */

export interface LocationData {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  timezone?: string;
}

// Export as Location for compatibility
export type Location = LocationData;

export interface LocationState {
  locations: LocationData[];
  currentLocation?: LocationData;
  isLoading: boolean;
}

/**
 * Hook for managing locations
 */
export function useLocations() {
  return {
    locations: [] as LocationData[],
    currentLocation: undefined as LocationData | undefined,
    isLoading: false,
    getLocations: (): LocationData[] => [],
    setCurrentLocation: (location: LocationData) => {},
    addLocation: (location: LocationData) => {},
    updateLocation: (id: string, updates: Partial<LocationData>) => {},
    deleteLocation: (id: string) => {},
  };
}
