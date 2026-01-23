import { gql } from '@apollo/client';
import {
  SUPPLIER_FRAGMENT,
  SUPPLIER_CONTACT_FRAGMENT,
  SUPPLIER_COMMUNICATION_FRAGMENT,
  SUPPLIER_EVALUATION_FRAGMENT,
  PURCHASE_ORDER_FRAGMENT,
  PURCHASE_ORDER_ITEM_FRAGMENT,
  SUPPLIER_PERFORMANCE_FRAGMENT,
  SPEND_ANALYSIS_FRAGMENT,
  SUPPLIER_CONNECTION_FRAGMENT,
  PURCHASE_ORDER_CONNECTION_FRAGMENT,
} from '../fragments/supplier';

// Supplier Queries
export const GET_SUPPLIER = gql`
  query GetSupplier($id: ID!) {
    supplier(id: $id) {
      ...SupplierFragment
      contacts {
        ...SupplierContactFragment
      }
      latestEvaluation {
        ...SupplierEvaluationFragment
      }
      currentPerformanceScore {
        overallScore
        qualityScore
        deliveryScore
        serviceScore
        communicationScore
      }
    }
  }
  ${SUPPLIER_FRAGMENT}
  ${SUPPLIER_CONTACT_FRAGMENT}
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const GET_SUPPLIER_BY_CODE = gql`
  query GetSupplierByCode($supplierCode: String!) {
    supplierByCode(supplierCode: $supplierCode) {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers(
    $first: Int
    $after: String
    $filter: SupplierFilterInput
  ) {
    suppliers(first: $first, after: $after, filter: $filter) {
      ...SupplierConnectionFragment
    }
  }
  ${SUPPLIER_CONNECTION_FRAGMENT}
`;

export const GET_PREFERRED_SUPPLIERS = gql`
  query GetPreferredSuppliers {
    preferredSuppliers {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const GET_SUPPLIERS_BY_STATUS = gql`
  query GetSuppliersByStatus($status: String!) {
    suppliersByStatus(status: $status) {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const SEARCH_SUPPLIERS = gql`
  query SearchSuppliers($searchTerm: String!, $limit: Int) {
    searchSuppliers(searchTerm: $searchTerm, limit: $limit) {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const GET_SUPPLIER_STATS = gql`
  query GetSupplierStats {
    supplierStats {
      totalSuppliers
      activeSuppliers
      inactiveSuppliers
      preferredSuppliers
      averageRating
    }
  }
`;

export const GET_SUPPLIER_PERFORMANCE_SCORE = gql`
  query GetSupplierPerformanceScore(
    $supplierId: ID!
    $dateRange: DateRangeInput!
  ) {
    supplierPerformanceScore(supplierId: $supplierId, dateRange: $dateRange) {
      overallScore
      qualityScore
      deliveryScore
      serviceScore
      communicationScore
    }
  }
`;

// Supplier Contact Queries
export const GET_SUPPLIER_CONTACT = gql`
  query GetSupplierContact($id: ID!) {
    supplierContact(id: $id) {
      ...SupplierContactFragment
      supplier {
        ...SupplierFragment
      }
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
  ${SUPPLIER_FRAGMENT}
`;

export const GET_SUPPLIER_CONTACTS = gql`
  query GetSupplierContacts($supplierId: ID!) {
    supplierContacts(supplierId: $supplierId) {
      ...SupplierContactFragment
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

export const GET_PRIMARY_SUPPLIER_CONTACT = gql`
  query GetPrimarySupplierContact($supplierId: ID!) {
    primarySupplierContact(supplierId: $supplierId) {
      ...SupplierContactFragment
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

// Supplier Communication Queries
export const GET_SUPPLIER_COMMUNICATION = gql`
  query GetSupplierCommunication($id: ID!) {
    supplierCommunication(id: $id) {
      ...SupplierCommunicationFragment
      supplier {
        ...SupplierFragment
      }
      contact {
        ...SupplierContactFragment
      }
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
  ${SUPPLIER_FRAGMENT}
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

export const GET_SUPPLIER_COMMUNICATIONS = gql`
  query GetSupplierCommunications(
    $supplierId: ID!
    $limit: Int
    $offset: Int
  ) {
    supplierCommunications(
      supplierId: $supplierId
      limit: $limit
      offset: $offset
    ) {
      communications {
        ...SupplierCommunicationFragment
      }
      total
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

export const GET_SUPPLIER_COMMUNICATIONS_LIST = gql`
  query GetSupplierCommunicationsList(
    $supplierId: ID!
    $limit: Int
    $offset: Int
  ) {
    supplierCommunicationsList(
      supplierId: $supplierId
      limit: $limit
      offset: $offset
    ) {
      communications {
        ...SupplierCommunicationFragment
      }
      total
      totalPages
      hasNextPage
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

export const GET_PENDING_FOLLOW_UPS = gql`
  query GetPendingFollowUps($beforeDate: String) {
    pendingFollowUps(beforeDate: $beforeDate) {
      ...SupplierCommunicationFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

export const GET_COMMUNICATION_STATS = gql`
  query GetCommunicationStats(
    $supplierId: ID
    $dateRange: DateRangeInput
  ) {
    communicationStats(supplierId: $supplierId, dateRange: $dateRange) {
      totalCommunications
      pendingFollowUps
      averageResponseTime
    }
  }
`;

export const GET_COMMUNICATION_BY_TYPE_STATS = gql`
  query GetCommunicationByTypeStats(
    $supplierId: ID
    $dateRange: DateRangeInput
  ) {
    communicationByTypeStats(supplierId: $supplierId, dateRange: $dateRange) {
      emailCount
      phoneCount
      meetingCount
      inboundCount
      outboundCount
    }
  }
`;

// Supplier Evaluation Queries
export const GET_SUPPLIER_EVALUATION = gql`
  query GetSupplierEvaluation($id: ID!) {
    supplierEvaluation(id: $id) {
      ...SupplierEvaluationFragment
      supplier {
        ...SupplierFragment
      }
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
  ${SUPPLIER_FRAGMENT}
`;

export const GET_SUPPLIER_EVALUATIONS = gql`
  query GetSupplierEvaluations(
    $supplierId: ID!
    $limit: Int
    $offset: Int
  ) {
    supplierEvaluations(
      supplierId: $supplierId
      limit: $limit
      offset: $offset
    ) {
      evaluations {
        ...SupplierEvaluationFragment
      }
      total
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const GET_SUPPLIER_EVALUATIONS_LIST = gql`
  query GetSupplierEvaluationsList(
    $supplierId: ID!
    $limit: Int
    $offset: Int
  ) {
    supplierEvaluationsList(
      supplierId: $supplierId
      limit: $limit
      offset: $offset
    ) {
      evaluations {
        ...SupplierEvaluationFragment
      }
      total
      totalPages
      hasNextPage
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const GET_LATEST_SUPPLIER_EVALUATION = gql`
  query GetLatestSupplierEvaluation($supplierId: ID!) {
    latestSupplierEvaluation(supplierId: $supplierId) {
      ...SupplierEvaluationFragment
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const GET_PENDING_EVALUATIONS = gql`
  query GetPendingEvaluations {
    pendingEvaluations {
      ...SupplierEvaluationFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const GET_EVALUATION_STATS = gql`
  query GetEvaluationStats(
    $supplierId: ID
    $dateRange: DateRangeInput
  ) {
    evaluationStats(supplierId: $supplierId, dateRange: $dateRange) {
      totalEvaluations
      averageOverallScore
      averageQualityScore
      averageDeliveryScore
      averageServiceScore
      pendingApproval
    }
  }
`;

export const GET_SUPPLIER_TRENDS = gql`
  query GetSupplierTrends($supplierId: ID!, $months: Int) {
    supplierTrends(supplierId: $supplierId, months: $months) {
      period
      overallScore
      qualityScore
      deliveryScore
      serviceScore
    }
  }
`;

// Purchase Order Queries
export const GET_PURCHASE_ORDER = gql`
  query GetPurchaseOrder($id: ID!) {
    purchaseOrder(id: $id) {
      ...PurchaseOrderFragment
      supplier {
        ...SupplierFragment
      }
      lineItems {
        ...PurchaseOrderItemFragment
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
  ${SUPPLIER_FRAGMENT}
  ${PURCHASE_ORDER_ITEM_FRAGMENT}
`;

export const GET_PURCHASE_ORDER_BY_NUMBER = gql`
  query GetPurchaseOrderByNumber($poNumber: String!) {
    purchaseOrderByNumber(poNumber: $poNumber) {
      ...PurchaseOrderFragment
      supplier {
        ...SupplierFragment
      }
      lineItems {
        ...PurchaseOrderItemFragment
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
  ${SUPPLIER_FRAGMENT}
  ${PURCHASE_ORDER_ITEM_FRAGMENT}
`;

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders(
    $first: Int
    $after: String
    $filter: PurchaseOrderFilterInput
  ) {
    purchaseOrders(first: $first, after: $after, filter: $filter) {
      ...PurchaseOrderConnectionFragment
    }
  }
  ${PURCHASE_ORDER_CONNECTION_FRAGMENT}
`;

export const GET_PURCHASE_ORDER_STATS = gql`
  query GetPurchaseOrderStats($startDate: String, $endDate: String) {
    purchaseOrderStats(startDate: $startDate, endDate: $endDate) {
      totalOrders
      draftOrders
      pendingApproval
      approvedOrders
      totalValue
      averageOrderValue
    }
  }
`;

export const GET_SUPPLIER_PURCHASE_STATS = gql`
  query GetSupplierPurchaseStats(
    $supplierId: ID!
    $startDate: String
    $endDate: String
  ) {
    supplierPurchaseStats(
      supplierId: $supplierId
      startDate: $startDate
      endDate: $endDate
    ) {
      totalOrders
      totalSpend
      averageOrderValue
      onTimeDeliveries
      lateDeliveries
      onTimeDeliveryRate
    }
  }
`;

// Analytics Queries
export const GET_SUPPLIER_PERFORMANCE = gql`
  query GetSupplierPerformance(
    $supplierId: ID!
    $input: AnalyticsDateRangeInput!
  ) {
    getSupplierPerformance(supplierId: $supplierId, input: $input) {
      ...SupplierPerformanceFragment
    }
  }
  ${SUPPLIER_PERFORMANCE_FRAGMENT}
`;

export const GET_ALL_SUPPLIER_PERFORMANCE = gql`
  query GetAllSupplierPerformance($input: AnalyticsDateRangeInput!) {
    getAllSupplierPerformance(input: $input) {
      ...SupplierPerformanceFragment
    }
  }
  ${SUPPLIER_PERFORMANCE_FRAGMENT}
`;

export const GET_SPEND_ANALYSIS = gql`
  query GetSpendAnalysis($input: AnalyticsDateRangeInput!) {
    getSpendAnalysis(input: $input) {
      ...SpendAnalysisFragment
    }
  }
  ${SPEND_ANALYSIS_FRAGMENT}
`;

export const GET_COST_TRENDS = gql`
  query GetCostTrends($input: AnalyticsDateRangeInput!) {
    getCostTrends(input: $input) {
      month
      amount
    }
  }
`;

export const GET_LEAD_TIME_ANALYSIS = gql`
  query GetLeadTimeAnalysis($input: AnalyticsDateRangeInput!) {
    getLeadTimeAnalysis(input: $input) {
      supplierId
      supplierName
      averageLeadTime
      minLeadTime
      maxLeadTime
      onTimeDeliveryPercentage
    }
  }
`;

// EDI Queries
export const GET_EDI_STATUS = gql`
  query GetEDIStatus($documentId: ID!) {
    getEDIStatus(documentId: $documentId) {
      documentId
      status
      processedAt
    }
  }
`;