import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SupplierService } from './services/supplier.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { ProcurementAnalyticsService } from './services/procurement-analytics.service';
import { EDIIntegrationService } from './services/edi-integration.service';
import { SupplierRepository } from './repositories/supplier.repository';
import { SupplierContactRepository } from './repositories/supplier-contact.repository';
import { SupplierCommunicationRepository } from './repositories/supplier-communication.repository';
import { SupplierEvaluationRepository } from './repositories/supplier-evaluation.repository';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { SupplierResolver } from './resolvers/supplier.resolver';
import { PurchaseOrderResolver } from './resolvers/purchase-order.resolver';
import { ProcurementAnalyticsResolver } from './resolvers/procurement-analytics.resolver';
import { EDIIntegrationResolver } from './resolvers/edi-integration.resolver';
import { SupplierContactResolver } from './resolvers/supplier-contact.resolver';
import { SupplierCommunicationResolver } from './resolvers/supplier-communication.resolver';
import { SupplierEvaluationResolver } from './resolvers/supplier-evaluation.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';
import { PubSubModule } from '../../common/graphql/pubsub.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TenantModule,
    GraphQLCommonModule,
    PubSubModule,
    BullModule.registerQueue({
      name: 'edi',
    }),
  ],
  providers: [
    // Services
    SupplierService,
    PurchaseOrderService,
    ProcurementAnalyticsService,
    EDIIntegrationService,
    // Repositories
    SupplierRepository,
    SupplierContactRepository,
    SupplierCommunicationRepository,
    SupplierEvaluationRepository,
    PurchaseOrderRepository,
    // GraphQL Resolvers
    SupplierResolver,
    SupplierContactResolver,
    SupplierCommunicationResolver,
    SupplierEvaluationResolver,
    PurchaseOrderResolver,
    ProcurementAnalyticsResolver,
    EDIIntegrationResolver,
  ],
  exports: [
    SupplierService,
    PurchaseOrderService,
    ProcurementAnalyticsService,
    EDIIntegrationService,
    SupplierRepository,
    SupplierContactRepository,
    SupplierCommunicationRepository,
    SupplierEvaluationRepository,
    PurchaseOrderRepository,
  ],
})
export class SupplierModule {}