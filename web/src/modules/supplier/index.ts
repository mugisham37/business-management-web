/**
 * Supplier Module - Supplier and Vendor Management
 * Requirements: 11.1, 11.2, 11.3
 */

import { lazy } from 'react';

export const SupplierDashboard = lazy(() => 
  import('./components/SupplierDashboard').then(module => ({
    default: module.SupplierDashboard
  }))
);

export const VendorManagement = lazy(() => 
  import('./components/VendorManagement').then(module => ({
    default: module.VendorManagement
  }))
);

export const ProcurementView = lazy(() => 
  import('./components/ProcurementView').then(module => ({
    default: module.ProcurementView
  }))
);

// Export hooks for external use
export { useSuppliers, useProcurement } from '@/hooks';

// Export all supplier-related hooks
export {
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
  
  // Contact hooks
  useSupplierContacts,
  useSupplierContact,
  usePrimarySupplierContact,
  useCreateSupplierContact,
  useUpdateSupplierContact,
  useDeleteSupplierContact,
  useSetPrimaryContact,
  useSupplierContactManagement,
  
  // Communication hooks
  useSupplierCommunications,
  useSupplierCommunicationsList,
  useSupplierCommunication,
  usePendingFollowUps,
  useCommunicationStats,
  useCommunicationByTypeStats,
  useCreateSupplierCommunication,
  useUpdateSupplierCommunication,
  useDeleteSupplierCommunication,
  useMarkFollowUpComplete,
  useSupplierCommunicationManagement,
  useCommunicationFilters,
  
  // Evaluation hooks
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
  
  // Procurement hooks
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
} from '@/hooks';

// Export types
export type {
  Supplier,
  SupplierContact,
  SupplierCommunication,
  SupplierEvaluation,
  PurchaseOrder,
  PurchaseOrderItem,
  SupplierPerformanceMetrics,
  SupplierPerformanceScore,
  SpendAnalysis,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilterInput,
  DateRangeInput,
  SupplierStats,
  PurchaseOrderStats,
  SupplierPurchaseStats,
  CommunicationStats,
  EvaluationStats,
  SupplierStatus,
  SupplierType,
  SupplierRating,
  PurchaseOrderStatus,
  PurchaseOrderPriority,
  CommunicationType,
  CommunicationDirection,
  PaymentTerms,
} from '@/types/supplier';

// Export utilities
export { supplierUtils } from '@/lib/utils/supplier';

// Export GraphQL operations for advanced usage
export {
  // Queries
  GET_SUPPLIERS,
  GET_SUPPLIER,
  GET_SUPPLIER_BY_CODE,
  GET_PREFERRED_SUPPLIERS,
  GET_SUPPLIERS_BY_STATUS,
  SEARCH_SUPPLIERS,
  GET_SUPPLIER_STATS,
  GET_SUPPLIER_PERFORMANCE_SCORE,
  GET_SUPPLIER_CONTACTS,
  GET_SUPPLIER_COMMUNICATIONS,
  GET_SUPPLIER_EVALUATIONS,
  GET_PURCHASE_ORDERS,
  GET_PURCHASE_ORDER,
  GET_PROCUREMENT_ANALYTICS,
  
  // Mutations
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  CREATE_SUPPLIER_CONTACT,
  UPDATE_SUPPLIER_CONTACT,
  DELETE_SUPPLIER_CONTACT,
  CREATE_SUPPLIER_COMMUNICATION,
  UPDATE_SUPPLIER_COMMUNICATION,
  DELETE_SUPPLIER_COMMUNICATION,
  CREATE_SUPPLIER_EVALUATION,
  UPDATE_SUPPLIER_EVALUATION,
  DELETE_SUPPLIER_EVALUATION,
  CREATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER,
  DELETE_PURCHASE_ORDER,
  
  // Subscriptions
  SUPPLIER_CREATED_SUBSCRIPTION,
  SUPPLIER_UPDATED_SUBSCRIPTION,
  SUPPLIER_EVALUATED_SUBSCRIPTION,
  PURCHASE_ORDER_CREATED_SUBSCRIPTION,
  PURCHASE_ORDER_STATUS_CHANGED_SUBSCRIPTION,
  PURCHASE_ORDER_RECEIVED_SUBSCRIPTION,
} from '@/graphql/queries/supplier';

export const supplierModule = {
  name: 'Supplier Management',
  version: '1.0.0',
  description: 'Comprehensive supplier and vendor relationship management with procurement capabilities',
  components: { SupplierDashboard, VendorManagement, ProcurementView },
  routes: ['/supplier', '/supplier/vendors', '/supplier/procurement'],
  permissions: [
    'supplier:read', 
    'supplier:write', 
    'supplier:create', 
    'supplier:update', 
    'supplier:delete',
    'supplier:evaluate',
    'supplier:approve-evaluation',
    'supplier:analytics:read',
    'supplier:edi:send',
    'supplier:edi:receive',
    'supplier:edi:retry',
    'purchase-order:read',
    'purchase-order:create',
    'purchase-order:update',
    'purchase-order:delete',
    'purchase-order:submit',
    'purchase-order:approve',
    'purchase-order:receive',
    'purchase-order:invoice',
  ],
  businessTier: 'SMALL',
  dependencies: ['tenant', 'auth'],
  features: [
    'supplier-management',
    'contact-management',
    'communication-tracking',
    'supplier-evaluation',
    'purchase-orders',
    'procurement-analytics',
    'edi-integration',
    'real-time-updates',
    'performance-scoring',
    'spend-analysis',
  ],
} as const;