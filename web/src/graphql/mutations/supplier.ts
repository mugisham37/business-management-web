import { gql } from '@apollo/client';
import {
  SUPPLIER_FRAGMENT,
  SUPPLIER_CONTACT_FRAGMENT,
  SUPPLIER_COMMUNICATION_FRAGMENT,
  SUPPLIER_EVALUATION_FRAGMENT,
  PURCHASE_ORDER_FRAGMENT,
  EDI_DOCUMENT_FRAGMENT,
} from '../fragments/supplier';

// Supplier Mutations
export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: CreateSupplierInput!) {
    createSupplier(input: $input) {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: UpdateSupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      ...SupplierFragment
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id)
  }
`;

// Supplier Contact Mutations
export const CREATE_SUPPLIER_CONTACT = gql`
  mutation CreateSupplierContact(
    $supplierId: ID!
    $input: CreateSupplierContactInput!
  ) {
    createSupplierContact(supplierId: $supplierId, input: $input) {
      ...SupplierContactFragment
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

export const UPDATE_SUPPLIER_CONTACT = gql`
  mutation UpdateSupplierContact($id: ID!, $input: UpdateSupplierContactInput!) {
    updateSupplierContact(id: $id, input: $input) {
      ...SupplierContactFragment
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

export const DELETE_SUPPLIER_CONTACT = gql`
  mutation DeleteSupplierContact($id: ID!) {
    deleteSupplierContact(id: $id)
  }
`;

export const SET_PRIMARY_CONTACT = gql`
  mutation SetPrimaryContact($id: ID!) {
    setPrimaryContact(id: $id) {
      ...SupplierContactFragment
    }
  }
  ${SUPPLIER_CONTACT_FRAGMENT}
`;

// Supplier Communication Mutations
export const CREATE_SUPPLIER_COMMUNICATION = gql`
  mutation CreateSupplierCommunication($input: CreateSupplierCommunicationInput!) {
    createSupplierCommunication(input: $input) {
      ...SupplierCommunicationFragment
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

export const UPDATE_SUPPLIER_COMMUNICATION = gql`
  mutation UpdateSupplierCommunication(
    $id: ID!
    $input: UpdateSupplierCommunicationInput!
  ) {
    updateSupplierCommunication(id: $id, input: $input) {
      ...SupplierCommunicationFragment
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

export const DELETE_SUPPLIER_COMMUNICATION = gql`
  mutation DeleteSupplierCommunication($id: ID!) {
    deleteSupplierCommunication(id: $id)
  }
`;

export const MARK_FOLLOW_UP_COMPLETE = gql`
  mutation MarkFollowUpComplete($id: ID!) {
    markFollowUpComplete(id: $id) {
      ...SupplierCommunicationFragment
    }
  }
  ${SUPPLIER_COMMUNICATION_FRAGMENT}
`;

// Supplier Evaluation Mutations
export const CREATE_SUPPLIER_EVALUATION = gql`
  mutation CreateSupplierEvaluation($input: CreateSupplierEvaluationInput!) {
    createSupplierEvaluation(input: $input) {
      ...SupplierEvaluationFragment
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const UPDATE_SUPPLIER_EVALUATION = gql`
  mutation UpdateSupplierEvaluation(
    $id: ID!
    $input: UpdateSupplierEvaluationInput!
  ) {
    updateSupplierEvaluation(id: $id, input: $input) {
      ...SupplierEvaluationFragment
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const DELETE_SUPPLIER_EVALUATION = gql`
  mutation DeleteSupplierEvaluation($id: ID!) {
    deleteSupplierEvaluation(id: $id)
  }
`;

export const APPROVE_SUPPLIER_EVALUATION = gql`
  mutation ApproveSupplierEvaluation($id: ID!) {
    approveSupplierEvaluation(id: $id) {
      ...SupplierEvaluationFragment
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

export const REJECT_SUPPLIER_EVALUATION = gql`
  mutation RejectSupplierEvaluation($id: ID!) {
    rejectSupplierEvaluation(id: $id) {
      ...SupplierEvaluationFragment
    }
  }
  ${SUPPLIER_EVALUATION_FRAGMENT}
`;

// Purchase Order Mutations
export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      ...PurchaseOrderFragment
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: ID!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(id: $id, input: $input) {
      ...PurchaseOrderFragment
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(id: $id)
  }
`;

export const SUBMIT_PURCHASE_ORDER_FOR_APPROVAL = gql`
  mutation SubmitPurchaseOrderForApproval($id: ID!) {
    submitPurchaseOrderForApproval(id: $id) {
      ...PurchaseOrderFragment
    }
  }
  ${PURCHASE_ORDER_FRAGMENT}
`;

export const RESPOND_TO_APPROVAL = gql`
  mutation RespondToApproval(
    $approvalId: ID!
    $response: ApprovalResponseInput!
  ) {
    respondToApproval(approvalId: $approvalId, response: $response)
  }
`;

export const CREATE_PURCHASE_ORDER_RECEIPT = gql`
  mutation CreatePurchaseOrderReceipt($input: CreateReceiptInput!) {
    createPurchaseOrderReceipt(input: $input)
  }
`;

export const CREATE_PURCHASE_ORDER_INVOICE = gql`
  mutation CreatePurchaseOrderInvoice($input: CreateInvoiceInput!) {
    createPurchaseOrderInvoice(input: $input)
  }
`;

// EDI Mutations
export const SEND_EDI_DOCUMENT = gql`
  mutation SendEDIDocument($input: SendEDIDocumentInput!) {
    sendEDIDocument(input: $input) {
      jobId
      documentId
      message
    }
  }
`;

export const RECEIVE_EDI_DOCUMENT = gql`
  mutation ReceiveEDIDocument($input: ReceiveEDIDocumentInput!) {
    receiveEDIDocument(input: $input) {
      ...EDIDocumentFragment
    }
  }
  ${EDI_DOCUMENT_FRAGMENT}
`;

export const RETRY_EDI_DOCUMENT = gql`
  mutation RetryEDIDocument($input: RetryEDIDocumentInput!) {
    retryEDIDocument(input: $input) {
      jobId
      documentId
      message
    }
  }
`;