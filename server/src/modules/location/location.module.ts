import { Module } from '@nestjs/common';
import { LocationService } from './services/location.service';
import { LocationSyncService } from './services/location-sync.service';
import { LocationOfflineService } from './services/location-offline.service';
import { LocationPricingService } from './services/location-pricing.service';
import { LocationPromotionService } from './services/location-promotion.service';
import { LocationInventoryPolicyService } from './services/location-inventory-policy.service';
import { LocationReportingService } from './services/location-reporting.service';
import { LocationPermissionsService } from './services/location-permissions.service';
import { LocationGeospatialService } from './services/location-geospatial.service';
import { LocationAuditService } from './services/location-audit.service';
import { LocationBulkService } from './services/location-bulk.service';
import { FranchiseService } from './services/franchise.service';
import { LocationRepository } from './repositories/location.repository';
import { FranchiseRepository } from './repositories/franchise.repository';
import { LocationResolver } from './resolvers/location.resolver';
import { DealerPortalResolver } from './resolvers/dealer-portal.resolver';
import { FranchiseResolver } from './resolvers/franchise.resolver';
import { LocationInventoryPolicyResolver } from './resolvers/location-inventory-policy.resolver';
import { LocationPricingResolver } from './resolvers/location-pricing.resolver';
import { LocationPromotionResolver } from './resolvers/location-promotion.resolver';
import { LocationReportingResolver } from './resolvers/location-reporting.resolver';
import { LocationSyncResolver } from './resolvers/location-sync.resolver';
import { LocationPermissionsResolver } from './resolvers/location-permissions.resolver';
import { LocationGeospatialResolver } from './resolvers/location-geospatial.resolver';
import { LocationAuditResolver } from './resolvers/location-audit.resolver';
import { LocationBulkResolver } from './resolvers/location-bulk.resolver';
import { TerritoryResolver } from './resolvers/territory.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { FinancialModule } from '../financial/financial.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CrmModule } from '../crm/crm.module';
import { SupplierModule } from '../supplier/supplier.module';
import { POSModule } from '../pos/pos.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TenantModule,
    FinancialModule,
    InventoryModule,
    CrmModule,
    SupplierModule,
    POSModule,
    GraphQLCommonModule,
  ],
  providers: [
    // Core Services
    LocationService,
    LocationSyncService,
    LocationOfflineService,
    LocationPricingService,
    LocationPromotionService,
    LocationInventoryPolicyService,
    LocationReportingService,
    FranchiseService,
    
    // New Services
    LocationPermissionsService,
    LocationGeospatialService,
    LocationAuditService,
    LocationBulkService,
    
    // Repositories
    LocationRepository,
    FranchiseRepository,
    
    // GraphQL Resolvers
    LocationResolver,
    DealerPortalResolver,
    FranchiseResolver,
    LocationInventoryPolicyResolver,
    LocationPricingResolver,
    LocationPromotionResolver,
    LocationReportingResolver,
    LocationSyncResolver,
    TerritoryResolver,
    
    // New Resolvers
    LocationPermissionsResolver,
    LocationGeospatialResolver,
    LocationAuditResolver,
    LocationBulkResolver,
  ],
  exports: [
    // Core Services
    LocationService,
    LocationSyncService,
    LocationOfflineService,
    LocationPricingService,
    LocationPromotionService,
    LocationInventoryPolicyService,
    LocationReportingService,
    FranchiseService,
    
    // New Services
    LocationPermissionsService,
    LocationGeospatialService,
    LocationAuditService,
    LocationBulkService,
    
    // Repositories
    LocationRepository,
    FranchiseRepository,
  ],
})
export class LocationModule {}