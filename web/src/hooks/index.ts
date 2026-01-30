/**
 * Hooks Index
 * Central exports for all custom React hooks
 */

export { useIsMobile } from './utilities-infrastructure/use-mobile';
export { useCacheStrategy } from './useCacheStrategy';

// Social Auth (from authentication folder)
export { useSocialAuth } from './authentication/useSocialAuth';

// Auth with Retry (from authentication folder)
export { useAuthWithRetry } from './authentication/useAuthWithRetry';

// Network Status (from utilities-infrastructure folder)
export { useNetworkStatus } from './utilities-infrastructure/useNetworkStatus';

// Permission Validation (from utilities-infrastructure folder)
export { 
  useFeatureAccess,
  usePermissionGuard,
} from './utilities-infrastructure/usePermissionValidation';

// Navigation Guard (from utilities-infrastructure folder)
export { useNavigationGuard } from './utilities-infrastructure/useNavigationGuard';

// Auth Events (from authentication folder)
export { useAuthEvents } from './authentication/useAuthEvents';

// Security Settings (from authentication folder)
export { useSecuritySettings } from './authentication/useSecuritySettings';

// Audit Logs (from utilities-infrastructure folder)
export { useAuditLogs } from './utilities-infrastructure/useAuditLogs';

// Realtime Tier Updates (from utilities-infrastructure folder)
export { useRealtimeTierUpdates, useTierChangeAnimations } from './utilities-infrastructure/useRealtimeTierUpdates';

// Error Handler
export { useErrorHandler, withErrorHandler, type ErrorType, type ErrorContext, type UseErrorHandlerResult } from './utilities-infrastructure/useErrorHandler';
export { 
  useEnhancedMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useCacheInvalidation
} from './utilities-infrastructure/useGraphQLMutations';
export { 
  useAuth, 
  useMFA, 
  usePermission, 
  useRequireAllPermissions, 
  useRequireAuth, 
  useAuthLoading, 
  useCurrentUser, 
  useTokens 
} from './authentication/useAuth';

// Tenant hooks
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

// Analytics hooks
export {
  useAnalytics,
} from './analytics-reporting/useAnalytics';

// Financial hooks
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

export {
  useFinancialDashboard,
} from './finance-accounting/useFinancialDashboard';

// Supplier hooks
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

// CRM Hooks
export { useCRM } from './orders-sales/useCRM';
export { useCustomers, useCustomer, useCustomerByEmail, useCustomerByPhone, useCustomerSearch, useCustomerStats } from './orders-sales/useCustomers';
export { useLoyalty, useCustomerLoyalty, useCampaignLoyalty, useLoyaltyStats, useLoyaltyTiers } from './orders-sales/useLoyalty';
export { useCampaigns, useCampaign, useActiveCampaignsForCustomer, useCampaignPerformance, useCampaignStats, useCampaignValidation } from './analytics-reporting/useCampaigns';
export { useCustomerAnalytics, useCustomerLifetimeValue, useCustomerPurchasePatterns, useCustomerChurnRisk, useSegmentAnalytics, useHighChurnRiskCustomers, useCustomerMetrics, useAnalyticsInsights } from './analytics-reporting/useCustomerAnalytics';
export { useB2BCustomers, useB2BCustomer, useB2BCustomerMetrics, useB2BCustomersByIndustry, useB2BCustomersBySalesRep, useB2BCustomersWithExpiringContracts, useB2BCreditManagement } from './orders-sales/useB2BCustomers';
export { useB2BOrders, useB2BOrder, useB2BOrderByNumber, useOrdersRequiringApproval, useB2BOrderAnalytics } from './orders-sales/useB2BOrders';
export { useQuotes, useQuote, useQuoteSubscriptions } from './orders-sales/useQuotes';
export { useContracts, useContract, useExpiringContracts, useContractExpirationNotifications } from './supply-chain-procurement/useContracts';
export { useB2BPricing, useCustomerPricing, useBulkPricing, usePricingChangeNotifications } from './products-catalog/useB2BPricing';
export { useTerritories, useTerritory, useTerritoryMutations, useTerritoryValidation, useTerritoryManagement } from './analytics-reporting/useTerritories';
export { useB2BWorkflows, useB2BWorkflow, usePendingApprovals, useWorkflowAnalytics, useWorkflowHistory } from './supply-chain-procurement/useB2BWorkflows';
export { useCommunications, useCustomerCommunications, useCommunicationStats, useCommunicationTemplates, useCommunicationAutomation } from './communication-notifications/useCommunications';
export { useSegmentation, useSegment, useSegmentMembers, useSegmentCriteriaBuilder, useSegmentTemplates } from './orders-sales/useSegmentation';

// Inventory Hooks
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
  useProduct,
  useProducts,
  useProductSearch,
  useFeaturedProducts,
  useProductSubscriptions,
  useProductManagement,
} from './products-catalog/useProducts';

export {
  useCategory,
  useCategoryBySlug,
  useCategories,
  useCategoryTree,
  useCategorySearch,
  useCategoryManagement,
} from './products-catalog/useCategories';

export {
  useBrand,
  useBrandBySlug,
  useBrands,
  useBrandSearch,
  usePopularBrands,
  useBrandManagement,
} from './products-catalog/useBrands';

export {
  useBatchTracking,
  useBatchTrackings,
  useExpiringBatches,
  useFIFOBatches,
  useBatchSubscriptions,
  useBatchTrackingManagement,
} from './products-catalog/useBatchTracking';

// POS Hooks
export {
  usePOS,
  usePOSSession,
  usePOSConfiguration,
  useDailySalesSummary,
} from './orders-sales/usePOS';

export {
  useTransactions,
  useTransaction,
} from './finance-accounting/useTransactions';

export {
  usePayments,
} from './orders-sales/usePayments';

export {
  useReceipts,
} from './orders-sales/useReceipts';

export {
  useOfflineSync,
} from './utilities-infrastructure/useOfflineSync';

export {
  useReconciliation,
  useReconciliationReport,
} from './finance-accounting/useReconciliation';

// Location Management Hooks
export {
  useLocations,
} from './useLocations';

export {
  useFranchise,
  useFranchises,
  useFranchisePerformance,
  useFranchiseMutations,
  useFranchiseValidation,
  useFranchiseManagement,
} from './supply-chain-procurement/useFranchises';

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
  useLocationInventoryPolicy,
  useLocationReorderRules,
  useLocationInventoryPolicyMutations,
  useInventoryCalculations,
  useInventoryPolicyValidation,
  useInventoryRecommendations,
  useLocationInventoryPolicyManagement,
} from './inventory-location/useLocationInventoryPolicies';

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
  useLocationSyncStatus,
  useLocationSyncHistory,
  useLocationSyncMutations,
  useLocationSyncSubscriptions,
  useConflictResolution,
  useSyncMonitoring,
  useSyncScheduling,
  useLocationSyncManagement,
} from './inventory-location/useLocationSync';