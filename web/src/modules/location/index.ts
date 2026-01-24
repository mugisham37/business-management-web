/**
 * Location Module - Location and Geography Management
 * Requirements: 11.1, 11.2, 11.3
 */

import { lazy } from 'react';

export const LocationDashboard = lazy(() => 
  import('./components/LocationDashboard').then(module => ({
    default: module.LocationDashboard
  }))
);

export const SiteManagement = lazy(() => 
  import('./components/SiteManagement').then(module => ({
    default: module.SiteManagement
  }))
);

export const GeographicView = lazy(() => 
  import('./components/GeographicView').then(module => ({
    default: module.GeographicView
  }))
);

// Export all location hooks
export {
  useLocation,
  useLocations,
  useLocationTree,
  useLocationMutations,
  useLocationSubscriptions,
  useLocationSearch,
  useLocationValidation,
  useLocationManagement,
  useFranchise,
  useFranchises,
  useFranchisePerformance,
  useFranchiseMutations,
  useFranchiseValidation,
  useFranchiseManagement,
  useTerritory,
  useTerritories,
  useTerritoryMutations,
  useTerritoryValidation,
  useTerritoryManagement,
  useLocationPricing,
  usePricingRules,
  useLocationPricingMutations,
  usePricingCalculations,
  usePricingValidation,
  useLocationPricingManagement,
  useLocationPromotions,
  useLocationPromotionMutations,
  usePromotionSubscriptions,
  usePromotionCalculations,
  usePromotionValidation,
  usePromotionStatus,
  useLocationPromotionManagement,
  useLocationInventoryPolicy,
  useLocationReorderRules,
  useLocationInventoryPolicyMutations,
  useInventoryCalculations,
  useInventoryPolicyValidation,
  useInventoryRecommendations,
  useLocationInventoryPolicyManagement,
  useLocationSalesReport,
  useLocationInventoryReport,
  useLocationPerformanceReport,
  useLocationComparison,
  useReportAnalysis,
  useReportFormatting,
  useReportFilters,
  useLocationReportingManagement,
  useNearbyLocations,
  useClosestLocation,
  useLocationsInBounds,
  useCoverageArea,
  useLocationClustering,
  useOptimalLocationSuggestions,
  useGeospatialCalculations,
  useMapUtilities,
  useGeospatialValidation,
  useLocationGeospatialManagement,
  useLocationAuditHistory,
  useLocationAuditSummary,
  useTenantAuditHistory,
  useComplianceReport,
  useAuditAnalysis,
  useAuditFiltering,
  useAuditExport,
  useLocationAuditManagement,
  useBulkOperationStatus,
  useTenantBulkOperations,
  useBulkOperationMutations,
  useBulkOperationValidation,
  useBulkOperationProgress,
  useBulkOperationTemplates,
  useLocationBulkOperationsManagement,
  useLocationSyncStatus,
  useLocationSyncHistory,
  useLocationSyncMutations,
  useLocationSyncSubscriptions,
  useConflictResolution,
  useSyncMonitoring,
  useSyncScheduling,
  useLocationSyncManagement,
} from '@/hooks';

export const locationModule = {
  name: 'Location Management',
  version: '1.0.0',
  description: 'Complete location management system with geospatial capabilities, franchise management, pricing, promotions, inventory policies, reporting, audit trails, bulk operations, and real-time synchronization',
  components: { LocationDashboard, SiteManagement, GeographicView },
  routes: ['/location', '/location/sites', '/location/geography'],
  permissions: ['location:read', 'location:write', 'location:delete', 'location:audit'],
  businessTier: 'SMALL',
  dependencies: ['tenant', 'auth'],
  features: [
    'Location CRUD operations',
    'Hierarchical location management',
    'Franchise and territory management',
    'Location-specific pricing rules',
    'Promotion management',
    'Inventory policy management',
    'Geospatial operations and mapping',
    'Comprehensive reporting and analytics',
    'Audit trails and compliance tracking',
    'Bulk operations with validation',
    'Real-time synchronization',
    'Conflict resolution',
    'Performance monitoring',
  ],
} as const;