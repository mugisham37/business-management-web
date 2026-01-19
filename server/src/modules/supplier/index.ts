// Module
export { SupplierModule } from './supplier.module';

// Services
export { SupplierService } from './services/supplier.service';
export { PurchaseOrderService } from './services/purchase-order.service';
export { ProcurementAnalyticsService } from './services/procurement-analytics.service';
export { EDIIntegrationService } from './services/edi-integration.service';

// Repositories
export { SupplierRepository } from './repositories/supplier.repository';
export { SupplierContactRepository } from './repositories/supplier-contact.repository';
export { SupplierCommunicationRepository } from './repositories/supplier-communication.repository';
export { SupplierEvaluationRepository } from './repositories/supplier-evaluation.repository';
export { PurchaseOrderRepository } from './repositories/purchase-order.repository';

// Resolvers
export { SupplierResolver } from './resolvers/supplier.resolver';
export { SupplierContactResolver } from './resolvers/supplier-contact.resolver';
export { SupplierCommunicationResolver } from './resolvers/supplier-communication.resolver';
export { SupplierEvaluationResolver } from './resolvers/supplier-evaluation.resolver';
export { PurchaseOrderResolver } from './resolvers/purchase-order.resolver';
export { ProcurementAnalyticsResolver } from './resolvers/procurement-analytics.resolver';
export { EDIIntegrationResolver } from './resolvers/edi-integration.resolver';

// Entities (primary source for enums: SupplierStatus, SupplierType, SupplierRating, CommunicationType, CommunicationDirection)
export * from './entities/supplier.entity';

// Types (explicitly exclude duplicated enums and inputs)
export {
  SupplierTypeEnum,
  PaymentTerms,
  SupplierType as SupplierObjectType,
  SupplierEdge,
  SupplierConnection,
  RateSupplierInput,
} from './types/supplier.types';

export {
  PurchaseOrderStatus,
  PurchaseOrderType,
  PurchaseOrderItemType,
  PurchaseOrderEdge,
  PurchaseOrderConnection,
  PurchaseOrderItemInput,
} from './types/purchase-order.types';

export * from './types/procurement-analytics.types';
export * from './types/edi-integration.types';

// Inputs (explicitly export to avoid duplicate enum exports)
export {
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateSupplierContactInput,
  UpdateSupplierContactInput,
  CreateSupplierCommunicationInput,
  UpdateSupplierCommunicationInput,
  CreateSupplierEvaluationInput,
  UpdateSupplierEvaluationInput,
  SupplierFilterInput,
  DateRangeInput,
} from './inputs/supplier.input';

export {
  PurchaseOrderPriority,
  ApprovalStatus,
  ReceiptStatus,
  InvoiceMatchStatus,
  PaymentStatus,
  AddressInput,
  CreatePurchaseOrderItemInput,
  UpdatePurchaseOrderItemInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  CreateApprovalInput,
  ApprovalResponseInput,
  CreateReceiptItemInput,
  CreateReceiptInput,
  CreateInvoiceItemInput,
  CreateInvoiceInput,
  PurchaseOrderFilterInput,
} from './inputs/purchase-order.input';

// Domain Events
export {
  SupplierCreatedEvent,
  SupplierUpdatedEvent,
  SupplierEvaluatedEvent,
  SupplierCommunicationCreatedEvent,
} from './services/supplier.service';

export {
  PurchaseOrderCreatedEvent,
  PurchaseOrderApprovedEvent,
  PurchaseOrderSentEvent,
  PurchaseOrderReceivedEvent,
  PurchaseOrderInvoicedEvent,
} from './services/purchase-order.service';

export {
  EDIDocumentReceivedEvent,
  EDIDocumentProcessedEvent,
  EDIDocumentFailedEvent,
} from './services/edi-integration.service';