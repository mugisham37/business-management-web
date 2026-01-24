import { gql } from '@apollo/client';

// Core Supplier Fragment
export const SUPPLIER_FRAGMENT = gql`
  fragment SupplierFragment on Supplier {
    id
    supplierCode
    name
    legalName
    supplierType
    status
    primaryContactName
    primaryContactTitle
    primaryContactEmail
    primaryContactPhone
    addressLine1
    addressLine2
    city
    state
    postalCode
    country
    taxId
    businessRegistrationNumber
    website
    description
    paymentTerms
    creditLimit
    currency
    certifications
    tags
    customFields
    notes
    preferredCommunicationMethod
    isPreferredSupplier
    leadTimeDays
    minimumOrderAmount
    createdAt
    updatedAt
    createdBy
    updatedBy
  }
`;

// Supplier Contact Fragment
export const SUPPLIER_CONTACT_FRAGMENT = gql`
  fragment SupplierContactFragment on SupplierContact {
    id
    supplierId
    firstName
    lastName
    title
    department
    email
    phone
    mobile
    fax
    isPrimary
    preferredContactMethod
    notes
    customFields
    createdAt
    updatedAt
  }
`;

// Supplier Communication Fragment
export const SUPPLIER_COMMUNICATION_FRAGMENT = gql`
  fragment SupplierCommunicationFragment on SupplierCommunication {
    id
    supplierId
    contactId
    type
    direction
    subject
    content
    fromName
    fromEmail
    toName
    toEmail
    communicationDate
    followUpRequired
    followUpDate
    followUpCompleted
    attachments
    tags
    customFields
    createdAt
    updatedAt
  }
`;

// Supplier Evaluation Fragment
export const SUPPLIER_EVALUATION_FRAGMENT = gql`
  fragment SupplierEvaluationFragment on SupplierEvaluation {
    id
    supplierId
    evaluationPeriodStart
    evaluationPeriodEnd
    evaluationDate
    overallScore
    overallRating
    qualityScore
    deliveryScore
    pricingScore
    serviceScore
    reliabilityScore
    complianceScore
    onTimeDeliveryRate
    qualityDefectRate
    responseTime
    strengths
    weaknesses
    recommendations
    actionItems
    customScores
    attachments
    status
    approvedBy
    approvedAt
    createdAt
    updatedAt
  }
`;

// Purchase Order Fragment
export const PURCHASE_ORDER_FRAGMENT = gql`
  fragment PurchaseOrderFragment on PurchaseOrder {
    id
    poNumber
    supplierId
    status
    priority
    orderDate
    requestedDeliveryDate
    expectedDeliveryDate
    actualDeliveryDate
    deliveryAddress {
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
    }
    billingAddress {
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
    }
    shippingMethod
    paymentTerms
    deliveryTerms
    description
    internalNotes
    supplierNotes
    currency
    subtotalAmount
    taxAmount
    shippingAmount
    discountAmount
    totalAmount
    trackingNumber
    customFields
    tags
    createdAt
    updatedAt
    createdBy
    updatedBy
  }
`;

// Purchase Order Item Fragment
export const PURCHASE_ORDER_ITEM_FRAGMENT = gql`
  fragment PurchaseOrderItemFragment on PurchaseOrderItem {
    id
    purchaseOrderId
    productId
    itemDescription
    sku
    quantityOrdered
    quantityReceived
    quantityInvoiced
    unitPrice
    totalPrice
    uom
    specifications
    requestedDeliveryDate
    notes
    customFields
    createdAt
    updatedAt
  }
`;

// Performance Metrics Fragment
export const SUPPLIER_PERFORMANCE_FRAGMENT = gql`
  fragment SupplierPerformanceFragment on SupplierPerformanceMetrics {
    supplierId
    supplierName
    totalOrders
    totalSpend
    averageOrderValue
    onTimeDeliveries
    lateDeliveries
    onTimeDeliveryRate
    averageLeadTime
    averageResponseTime
    qualityScore
    defectRate
    returnRate
    complianceScore
    period
  }
`;

// Analytics Fragments
export const SPEND_ANALYSIS_FRAGMENT = gql`
  fragment SpendAnalysisFragment on SpendAnalysis {
    totalSpend
    spendBySupplier {
      supplierId
      supplierName
      amount
      percentage
    }
    spendByCategory {
      category
      amount
      percentage
    }
    spendByMonth {
      month
      amount
    }
    topSuppliers {
      supplierId
      supplierName
      totalSpend
      orderCount
    }
  }
`;

// EDI Document Fragment
export const EDI_DOCUMENT_FRAGMENT = gql`
  fragment EDIDocumentFragment on EDIDocument {
    id
    supplierId
    documentType
    direction
    status
    rawContent
    processedData
    errorMessage
    processedAt
    createdAt
  }
`;

// Connection Fragments
export const SUPPLIER_CONNECTION_FRAGMENT = gql`
  fragment SupplierConnectionFragment on SupplierConnection {
    edges {
      node {
        ...SupplierFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
  ${SUPPLIER_FRAGMENT}
`;

export const PURCHASE_ORDER_CONNECTION_FRAGMENT = gql`
  fragment PurchaseOrderConnectionFragment on PurchaseOrderConnection {
    edges {
      node {
        ...PurchaseOrderFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;