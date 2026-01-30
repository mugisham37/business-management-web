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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCurrentLocation: (_location: LocationData) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addLocation: (_location: LocationData) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateLocation: (_id: string, _updates: Partial<LocationData>) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteLocation: (_id: string) => {},
  };
}
