/**
 * Hooks Index
 * Central exports for all custom React hooks
 */

// ============================================================================
// ROOT LEVEL HOOKS
// ============================================================================
export { useCacheStrategy } from './useCacheStrategy';
export { useLiveData } from './useLiveData';
export { useLocations } from './useLocations';
export { useOnboarding } from './useOnboarding';
export { useRealtime } from './useRealtime';

// ============================================================================
// UTILITIES-INFRASTRUCTURE HOOKS
// ============================================================================
export { useIsMobile } from './utilities-infrastructure/use-mobile';
export { useNetworkStatus } from './utilities-infrastructure/useNetworkStatus';
export { 
  useFeatureAccess,
  usePermissionGuard,
  useGraphQLOperationAccess,
  usePermissionConflictResolution,
  useBatchFeatureAccess,
  usePermissionValidationConfig,
} from './utilities-infrastructure/usePermissionValidation';
export { useNavigationGuard } from './utilities-infrastructure/useNavigationGuard';
export { useAuditLogs } from './utilities-infrastructure/useAuditLogs';
export { useRealtimeTierUpdates, useTierChangeAnimations } from './utilities-infrastructure/useRealtimeTierUpdates';
export { 
  useErrorHandler, 
  withErrorHandler, 
  type ErrorType, 
  type ErrorContext, 
  type UseErrorHandlerResult 
} from './utilities-infrastructure/useErrorHandler';
export { 
  useEnhancedMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useCacheInvalidation
} from './utilities-infrastructure/useGraphQLMutations';
export { useOfflineSync } from './utilities-infrastructure/useOfflineSync';
export { useCompliance } from './utilities-infrastructure/useCompliance';
export { 
  useCacheWarming, 
  useCriticalDataWarming, 
  useBusinessModuleWarming 
} from './utilities-infrastructure/useCacheWarming';
export { 
  useLiveInventory, 
  useLiveSales, 
  useLiveCustomerActivity, 
  useLiveAnalytics, 
  useLiveEmployee, 
  useLiveData as useLiveDataFromInfra 
} from './utilities-infrastructure/useLiveData';
export { useRealTimePermissions } from './utilities-infrastructure/useRealTimePermissions';
export { 
  useTierAccess, 
  useModuleAccess, 
  useSidebarModules,
  BusinessTier,
  type ModuleCategory,
  type ModuleAccess,
} from './utilities-infrastructure/useTierAccess';
export { useEmployeeSchedules, useTimeEntries } from './utilities-infrastructure/useTimeTracking';
export { 
  useUpgradeFlow,
  type UpgradeRequest,
  type UpgradeRecommendation,
  type PricingInfo,
  type UseUpgradeFlowReturn,
} from './utilities-infrastructure/useUpgradeFlow';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================
export { 
  useAuth, 
  useMFA, 
  usePermission, 
  useRequireAllPermissions, 
  useRequireAuth, 
  useAuthLoading, 
  useCurrentUser, 
  useTokens,
  useAdvancedAuth,
  useCompleteMfa,
  usePermissions,
  useAuthSubscriptions,
  useAuthEvent,
} from './authentication/useAuth';
export { useSocialAuth, useOAuthCallback } from './authentication/useSocialAuth';
export { useAuthWithRetry } from './authentication/useAuthWithRetry';
export { 
  useAuthEvents, 
  useAuthEventsOnly, 
  useSessionEventsOnly, 
  useSecurityAlertsOnly 
} from './authentication/useAuthEvents';
export { 
  useAuthEventSubscriptions, 
  useSecurityEventSubscriptions, 
  useBusinessEventSubscriptions, 
  useAdminEventSubscriptions 
} from './authentication/useAuthEventSubscriptions';
export { useAuthManagement } from './authentication/useAuthManagement';
export { useSecurity } from './authentication/useSecurity';
export { useSecuritySettings } from './authentication/useSecuritySettings';

// ============================================================================
// ANALYTICS & REPORTING HOOKS
// ============================================================================
export { useAnalytics } from './analytics-reporting/useAnalytics';
export {
  useCampaigns,
  useCampaign,
  useActiveCampaignsForCustomer,
  useCampaignPerformance,
  useCampaignStats,
  useCampaignValidation
} from './analytics-reporting/useCampaigns';
export { useComparativeAnalysis } from './analytics-reporting/useComparativeAnalysis';
export {
  useCustomerAnalytics,
  useCustomerLifetimeValue,
  useCustomerPurchasePatterns,
  useCustomerChurnRisk,
  useSegmentAnalytics,
  useHighChurnRiskCustomers,
  useCustomerMetrics,
  useAnalyticsInsights
} from './analytics-reporting/useCustomerAnalytics';
export { useDashboards } from './analytics-reporting/useDashboards';
export { useDataWarehouse } from './analytics-reporting/useDataWarehouse';
export { useETL } from './analytics-reporting/useETL';
export { usePredictiveAnalytics } from './analytics-reporting/usePredictiveAnalytics';
export { useReports } from './analytics-reporting/useReports';
export {
  useTerritories,
  useTerritory,
  useTerritoryMutations,
  useTerritoryValidation,
  useTerritoryManagement
} from './analytics-reporting/useTerritories';

// ============================================================================
// COMMUNICATION & NOTIFICATIONS HOOKS
// ============================================================================
export { useCommunication } from './communication-notifications/useCommunication';
export {
  useCommunications,
  useCustomerCommunications,
  useCommunicationStats,
  useCommunicationTemplates,
  useCommunicationAutomation
} from './communication-notifications/useCommunications';
export { useEmail } from './communication-notifications/useEmail';
export { useNotifications } from './communication-notifications/useNotifications';
export { useSlack } from './communication-notifications/useSlack';
export { useSMS } from './communication-notifications/useSMS';

// ============================================================================
// FINANCE & ACCOUNTING HOOKS
// ============================================================================
export {
  useBalanceSheet,
  useIncomeStatement,
  useCashFlowStatement,
  useTrialBalance,
  useFinancialRatios,
  useFinancialSummary,
  useAccountingIntegrity,
  useFinancialReportSubscriptions,
  useFinancialReporting,
} from './finance-accounting/useFinancialReporting';
export {
  useBudget,
  useBudgets,
  useBudgetVariance,
  useBudgetMutations,
  useBudgetSubscriptions,
  useBudgetManagement,
} from './finance-accounting/useBudgetManagement';
export {
  useAccount,
  useAccounts,
  useAccountHierarchy,
  useAccountSearch,
  useAccountMutations,
  useAccountBalanceSubscriptions,
  useAccountValidation,
  useChartOfAccounts,
} from './finance-accounting/useChartOfAccounts';
export {
  useJournalEntry,
  useJournalEntries,
  useGeneralLedger,
  useJournalEntryMutations,
  useJournalEntrySubscriptions,
  useJournalEntryValidation,
} from './finance-accounting/useJournalEntries';
export {
  useCurrencyConversion,
  useExchangeRates,
  useCurrencies,
  useCurrencyMutations,
  useCurrencySubscriptions,
  useCurrencyFormatting,
  useMultiCurrency,
} from './finance-accounting/useMultiCurrency';
export {
  useAccountsReceivable,
  useAccountsPayable,
  useAgingReport,
  useARAPMutations,
  useARAPSubscriptions,
  useAccountsReceivablePayable,
} from './finance-accounting/useAccountsReceivablePayable';
export { useFinancialDashboard } from './finance-accounting/useFinancialDashboard';
export { useTransactions, useTransaction } from './finance-accounting/useTransactions';
export { useReconciliation, useReconciliationReport } from './finance-accounting/useReconciliation';

// ============================================================================
// INVENTORY & LOCATION HOOKS
// ============================================================================
export {
  useBinLocation,
  useBinInventory,
  useBinLocationManagement,
  useBinLocationValidation,
} from './inventory-location/useBinLocations';
export {
  useInventoryLevel,
  useInventoryLevels,
  useInventoryHistory,
  useInventoryTransfer,
  useInventoryReservation,
  useInventorySummary,
  useLowStockItems,
  useOutOfStockItems,
  useInventorySubscriptions,
  useInventoryManagement,
} from './inventory-location/useInventory';
export {
  useLocationAuditHistory,
  useLocationAuditSummary,
  useTenantAuditHistory,
  useComplianceReport,
  useAuditAnalysis,
  useAuditFiltering,
  useAuditExport,
  useLocationAuditManagement,
} from './inventory-location/useLocationAudit';
export {
  useBulkOperationStatus,
  useTenantBulkOperations,
  useBulkOperationMutations,
  useBulkOperationValidation,
  useBulkOperationProgress,
  useBulkOperationTemplates,
  useLocationBulkOperationsManagement,
} from './inventory-location/useLocationBulkOperations';
export {
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
} from './inventory-location/useLocationGeospatial';
export {
  useLocationInventoryPolicy,
  useLocationReorderRules,
  useLocationInventoryPolicyMutations,
  useInventoryCalculations,
  useInventoryPolicyValidation,
  useInventoryRecommendations,
  useLocationInventoryPolicyManagement,
} from './inventory-location/useLocationInventoryPolicies';
export {
  useLocationPricing,
  usePricingRules,
  useLocationPricingMutations,
  usePricingCalculations,
  usePricingValidation,
  useLocationPricingManagement,
} from './inventory-location/useLocationPricing';
export {
  useLocationPromotions,
  useLocationPromotionMutations,
  usePromotionSubscriptions,
  usePromotionCalculations,
  usePromotionValidation,
  usePromotionStatus,
  useLocationPromotionManagement,
} from './inventory-location/useLocationPromotions';
export {
  useLocationSalesReport,
  useLocationInventoryReport,
  useLocationPerformanceReport,
  useLocationComparison,
  useReportAnalysis,
  useReportFormatting,
  useReportFilters,
  useLocationReportingManagement,
} from './inventory-location/useLocationReporting';
export {
  useLocationSyncStatus,
  useLocationSyncHistory,
  useLocationSyncMutations,
  useLocationSyncSubscriptions,
  useConflictResolution,
  useSyncMonitoring,
  useSyncScheduling,
  useLocationSyncManagement,
} from './inventory-location/useLocationSync';
export {
  useLocation,
  useLocationTree,
  useLocationMutations,
  useLocationSubscriptions,
  useLocationSearch,
  useLocationValidation,
  useLocationManagement,
} from './inventory-location/useLocations';
export {
  useWarehouse,
  useWarehouses,
  useWarehouseCapacity,
  useWarehousesByLocation,
  useWarehouseManagement,
  useWarehouseSearch,
  useWarehouseValidation,
} from './inventory-location/useWarehouse';
export {
  useWarehouseZone,
  useWarehouseZones,
  useZoneManagement,
  useZoneTemplates,
} from './inventory-location/useWarehouseZones';

// ============================================================================
// ORDERS & SALES HOOKS
// ============================================================================
export {
  useB2BCustomers,
  useB2BCustomer,
  useB2BCustomerMetrics,
  useB2BCustomersByIndustry,
  useB2BCustomersBySalesRep,
  useB2BCustomersWithExpiringContracts,
  useB2BCreditManagement
} from './orders-sales/useB2BCustomers';
export {
  useB2BOrders,
  useB2BOrder,
  useB2BOrderByNumber,
  useOrdersRequiringApproval,
  useB2BOrderAnalytics
} from './orders-sales/useB2BOrders';
export { useCRM, useCRMStatus } from './orders-sales/useCRM';
export {
  useCustomers,
  useCustomer,
  useCustomerByEmail,
  useCustomerByPhone,
  useCustomerSearch,
  useCustomerStats
} from './orders-sales/useCustomers';
export {
  useEmployees,
  useEmployee,
  useEmployeeByNumber,
  useEmployeeAnalytics,
  useEmployeeSearch,
  useEmployeeHierarchy,
} from './orders-sales/useEmployees';
export {
  useLoyalty,
  useCustomerLoyalty,
  useCampaignLoyalty,
  useLoyaltyStats,
  useLoyaltyTiers
} from './orders-sales/useLoyalty';
export { usePayments } from './orders-sales/usePayments';
export {
  usePOS,
  usePOSSession,
  usePOSConfiguration,
  useDailySalesSummary,
} from './orders-sales/usePOS';
export { useQuotes, useQuote, useQuoteSubscriptions } from './orders-sales/useQuotes';
export { useReceipts } from './orders-sales/useReceipts';
export {
  useSegmentation,
  useSegment,
  useSegmentMembers,
  useSegmentCriteriaBuilder,
  useSegmentTemplates
} from './orders-sales/useSegmentation';
export {
  useShipment,
  useShipments,
  useShipmentsByWarehouse,
  usePendingShipments,
  useInTransitShipments,
  useDeliveredShipments,
  useExceptionShipments,
  useShippingRates,
  useShippingLabel,
  useTracking,
  useShippingMetrics,
  useShippingManagement,
} from './orders-sales/useShipping';
export { useSubscription } from './orders-sales/useSubscription';
export {
  useSupplierContacts,
  useSupplierContact,
  usePrimarySupplierContact,
  useCreateSupplierContact,
  useUpdateSupplierContact,
  useDeleteSupplierContact,
  useSetPrimaryContact,
  useSupplierContactManagement,
} from './orders-sales/useSupplierContacts';
export { useTeams } from './orders-sales/useTeams';
export {
  useTenant,
  useTenantContext,
  useFeatureFlags,
  useTenantSwitching,
  useBusinessTier,
  useTenantSettings,
  useFeatureGate,
  useTierGate,
  useFeatureAndTierGate,
} from './orders-sales/useTenant';
export { useUserSessions } from './orders-sales/useUserSessions';

// ============================================================================
// PRODUCTS & CATALOG HOOKS
// ============================================================================
export {
  useB2BPricing,
  useCustomerPricing,
  useBulkPricing,
  usePricingChangeNotifications
} from './products-catalog/useB2BPricing';
export {
  useBatchTracking,
  useBatchTrackings,
  useExpiringBatches,
  useFIFOBatches,
  useBatchSubscriptions,
  useBatchTrackingManagement,
} from './products-catalog/useBatchTracking';
export {
  useBrand,
  useBrandBySlug,
  useBrands,
  useBrandSearch,
  usePopularBrands,
  useBrandManagement,
} from './products-catalog/useBrands';
export {
  useCategory,
  useCategoryBySlug,
  useCategories,
  useCategoryTree,
  useCategorySearch,
  useCategoryManagement,
} from './products-catalog/useCategories';
export {
  useKitDefinition,
  useKitDefinitions,
  useActiveKitDefinitions,
  useAssemblyWorkOrder,
  useAssemblyWorkOrders,
  useAssemblyWorkOrdersByWarehouse,
  usePendingAssemblyWorkOrders,
  useOverdueAssemblyWorkOrders,
  useAssemblyMetrics,
  useKitDisassembly,
  useKittingAssemblyManagement,
} from './products-catalog/useKittingAssembly';
export {
  useLot,
  useLots,
  useLotsByProduct,
  useLotsByWarehouse,
  useExpiredLots,
  useNearExpiryLots,
  useLotTraceability,
  useLotMovementHistory,
  useFIFORules,
  useRecalls,
  useLotExpiryManagement,
  useLotTrackingManagement,
} from './products-catalog/useLotTracking';
export { usePricingRecommendations } from './products-catalog/usePricingRecommendations';
export {
  useProduct,
  useProducts,
  useProductSearch,
  useFeaturedProducts,
  useProductSubscriptions,
  useProductManagement,
} from './products-catalog/useProducts';

// ============================================================================
// SUPPLY CHAIN & PROCUREMENT HOOKS
// ============================================================================
export {
  useB2BWorkflows,
  useB2BWorkflow,
  usePendingApprovals,
  useWorkflowAnalytics,
  useWorkflowHistory
} from './supply-chain-procurement/useB2BWorkflows';
export {
  useContracts,
  useContract,
  useExpiringContracts,
  useContractExpirationNotifications
} from './supply-chain-procurement/useContracts';
export {
  useFranchise,
  useFranchises,
  useFranchisePerformance,
  useFranchiseMutations,
  useFranchiseValidation,
  useFranchiseManagement,
} from './supply-chain-procurement/useFranchises';
export {
  usePickingWave,
  usePickingWaves,
  usePickList,
  usePickLists,
  usePickerAssignments,
  usePickingManagement,
} from './supply-chain-procurement/usePicking';
export {
  usePickingWavesByWarehouse,
  usePickingWavesByPicker,
  useOverduePickingWaves,
  useWaveStatistics,
  useWaveRecommendations,
  usePickingWaveManagement,
  useWaveValidation,
} from './supply-chain-procurement/usePickingWaves';
export {
  usePurchaseOrders,
  usePurchaseOrder,
  usePurchaseOrderByNumber,
  usePurchaseOrderStats,
  useSupplierPurchaseStats,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrderForApproval,
  useRespondToApproval,
  useCreatePurchaseOrderReceipt,
  useCreatePurchaseOrderInvoice,
  useProcurementAnalytics,
  useEDIOperations,
  usePurchaseOrderSubscriptions,
  useProcurementManagement,
  usePurchaseOrderFilters,
} from './supply-chain-procurement/useProcurement';
export {
  useSupplierCommunications,
  useSupplierCommunicationsList,
  useSupplierCommunication,
  usePendingFollowUps,
  useCommunicationByTypeStats,
  useCreateSupplierCommunication,
  useUpdateSupplierCommunication,
  useDeleteSupplierCommunication,
  useMarkFollowUpComplete,
  useSupplierCommunicationManagement,
  useCommunicationFilters,
} from './supply-chain-procurement/useSupplierCommunications';
export {
  useSupplierEvaluations,
  useSupplierEvaluationsList,
  useSupplierEvaluation,
  useLatestSupplierEvaluation,
  usePendingEvaluations,
  useEvaluationStats,
  useSupplierTrends,
  useCreateSupplierEvaluation,
  useUpdateSupplierEvaluation,
  useDeleteSupplierEvaluation,
  useApproveSupplierEvaluation,
  useRejectSupplierEvaluation,
  useSupplierEvaluationSubscriptions,
  useSupplierEvaluationManagement,
  useEvaluationScoring,
} from './supply-chain-procurement/useSupplierEvaluations';
export {
  useSuppliers,
  useSupplier,
  useSupplierByCode,
  usePreferredSuppliers,
  useSuppliersByStatus,
  useSearchSuppliers,
  useSupplierStats,
  useSupplierPerformanceScore,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  useSupplierSubscriptions,
  useSupplierManagement,
  useSupplierFilters,
} from './supply-chain-procurement/useSuppliers';