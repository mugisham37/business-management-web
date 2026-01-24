import { gql } from '@apollo/client';
import {
  SUPPLIER_FRAGMENT,
  SUPPLIER_EVALUATION_FRAGMENT,
  PURCHASE_ORDER_FRAGMENT,
} from '../fragments/supplier';

// Supplier Subscriptions
export const SUPPLIER_CREATED_SUBSCRIPTION = gql`
  subscription SupplierCreated {
    supplierCreated {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const SUPPLIER_UPDATED_SUBSCRIPTION = gql`
  subscription SupplierUpdated {
    supplierUpdated {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const SUPPLIER_EVALUATED_SUBSCRIPTION = gql`
  subscription SupplierEvaluated {
    supplierEvaluated {
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

// Purchase Order Subscriptions
export const PURCHASE_ORDER_CREATED_SUBSCRIPTION = gql`
  subscription PurchaseOrderCreated {
    purchaseOrderCreated {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const PURCHASE_ORDER_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription PurchaseOrderStatusChanged {
    purchaseOrderStatusChanged {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const PURCHASE_ORDER_RECEIVED_SUBSCRIPTION = gql`
  subscription PurchaseOrderReceived($supplierId: ID) {
    purchaseOrderReceived(supplierId: $supplierId) {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const PURCHASE_ORDER_APPROVED_SUBSCRIPTION = gql`
  subscription PurchaseOrderApproved {
    purchaseOrderApproved {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const PURCHASE_ORDER_SENT_SUBSCRIPTION = gql`
  subscription PurchaseOrderSent {
    purchaseOrderSent {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const PURCHASE_ORDER_INVOICED_SUBSCRIPTION = gql`
  subscription PurchaseOrderInvoiced {
    purchaseOrderInvoiced {
      ...PurchaseOrderFragment
      supplier {
        id
        name
        supplierCode
      }
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;