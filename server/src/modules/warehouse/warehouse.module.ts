import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { QueueModule } from '../queue/queue.module';
import { TenantModule } from '../tenant/tenant.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';
import { ValidationModule } from '../../common/validation/validation.module';

// Note: This module uses GraphQL resolvers instead of REST controllers

// Services
import { WarehouseService } from './services/warehouse.service';
import { WarehouseZoneService } from './services/warehouse-zone.service';
import { BinLocationService } from './services/bin-location.service';
import { PickingWaveService } from './services/picking-wave.service';
import { PickListService } from './services/pick-list.service';
import { ShippingIntegrationService } from './services/shipping-integration.service';
import { LotTrackingService } from './services/lot-tracking.service';
import { KittingAssemblyService } from './services/kitting-assembly.service';

// Repositories
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseZoneRepository } from './repositories/warehouse-zone.repository';
import { BinLocationRepository } from './repositories/bin-location.repository';
import { PickingWaveRepository } from './repositories/picking-wave.repository';
import { PickListRepository } from './repositories/pick-list.repository';

// Resolvers
import { WarehouseResolver } from './resolvers/warehouse.resolver';
import { BinLocationResolver } from './resolvers/bin-location.resolver';
import { KittingAssemblyResolver } from './resolvers/kitting-assembly.resolver';
import { LotTrackingResolver } from './resolvers/lot-tracking.resolver';
import { PickListResolver } from './resolvers/pick-list.resolver';
import { PickingWaveResolver } from './resolvers/picking-wave.resolver';
import { ShippingIntegrationResolver } from './resolvers/shipping-integration.resolver';
import { WarehouseZoneResolver } from './resolvers/warehouse-zone.resolver';

// Guards
import { WarehouseAccessGuard } from './guards/warehouse-access.guard';

// Interceptors
import { WarehouseAuditInterceptor } from './interceptors/warehouse-audit.interceptor';
import { WarehousePerformanceInterceptor } from './interceptors/warehouse-performance.interceptor';

// Event handlers (to be implemented in future tasks)
// import { WarehouseEventHandler } from './handlers/warehouse-event.handler';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    QueueModule,
    TenantModule,
    GraphQLCommonModule,
    ValidationModule,
  ],
  providers: [
    // Core services
    WarehouseService,
    WarehouseZoneService,
    BinLocationService,
    PickingWaveService,
    PickListService,
    ShippingIntegrationService,
    LotTrackingService,
    KittingAssemblyService,
    
    // Repositories
    WarehouseRepository,
    WarehouseZoneRepository,
    BinLocationRepository,
    PickingWaveRepository,
    PickListRepository,
    
    // GraphQL Resolvers
    WarehouseResolver,
    BinLocationResolver,
    KittingAssemblyResolver,
    LotTrackingResolver,
    PickListResolver,
    PickingWaveResolver,
    ShippingIntegrationResolver,
    WarehouseZoneResolver,
    
    // Guards
    WarehouseAccessGuard,
    
    // Interceptors
    WarehouseAuditInterceptor,
    WarehousePerformanceInterceptor,
    
    // Event handlers (to be implemented)
    // WarehouseEventHandler,
  ],
  exports: [
    // Services
    WarehouseService,
    WarehouseZoneService,
    BinLocationService,
    PickingWaveService,
    PickListService,
    ShippingIntegrationService,
    LotTrackingService,
    KittingAssemblyService,
    
    // Repositories
    WarehouseRepository,
    WarehouseZoneRepository,
    BinLocationRepository,
    PickingWaveRepository,
    PickListRepository,
    
    // Guards
    WarehouseAccessGuard,
    
    // Interceptors
    WarehouseAuditInterceptor,
    WarehousePerformanceInterceptor,
  ],
})
export class WarehouseModule {}