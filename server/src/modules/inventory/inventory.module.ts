import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { QueueModule } from '../queue/queue.module';
import { TenantModule } from '../tenant/tenant.module';

// Services
import { ProductService } from './services/product.service';
import { ProductCategoryService } from './services/product-category.service';
import { ProductBrandService } from './services/product-brand.service';
import { InventoryService } from './services/inventory.service';
import { ReorderService } from './services/reorder.service';
import { BatchTrackingService } from './services/batch-tracking.service';
import { CycleCountingService } from './services/cycle-counting.service';
import { InventoryValuationService } from './services/inventory-valuation.service';
import { InventoryReportingService } from './services/inventory-reporting.service';
import { InventoryMovementTrackingService } from './services/inventory-movement-tracking.service';
import { PerpetualInventoryService } from './services/perpetual-inventory.service';
import { InventoryAccuracyReportingService } from './services/inventory-accuracy-reporting.service';

// Repositories
import { ProductRepository } from './repositories/product.repository';
import { ProductCategoryRepository } from './repositories/product-category.repository';
import { ProductBrandRepository } from './repositories/product-brand.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository';
import { BatchTrackingRepository } from './repositories/batch-tracking.repository';
import { CycleCountingRepository } from './repositories/cycle-counting.repository';

// GraphQL Resolvers
import { ProductResolver } from './resolvers/product.resolver';
import { InventoryResolver } from './resolvers/inventory.resolver';
import { BrandResolver } from './resolvers/brand.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { BatchTrackingResolver } from './resolvers/batch-tracking.resolver';
import { CycleCountingResolver } from './resolvers/cycle-counting.resolver';
import { InventoryReportingResolver } from './resolvers/inventory-reporting.resolver';
import { InventoryMovementTrackingResolver } from './resolvers/inventory-movement-tracking.resolver';
import { PerpetualInventoryResolver } from './resolvers/perpetual-inventory.resolver';
import { InventoryAccuracyReportingResolver } from './resolvers/inventory-accuracy-reporting.resolver';
import { ReorderResolver } from './resolvers/reorder.resolver';
import { InventoryValuationResolver } from './resolvers/inventory-valuation.resolver';

// Event handlers
// import { InventoryEventHandler } from './handlers/inventory-event.handler';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    QueueModule,
    TenantModule,
  ],
  providers: [
    // Core services
    ProductService,
    ProductCategoryService,
    ProductBrandService,
    InventoryService,
    ReorderService,
    
    // Advanced inventory services
    BatchTrackingService,
    CycleCountingService,
    InventoryValuationService,
    InventoryReportingService,
    InventoryMovementTrackingService,
    PerpetualInventoryService,
    InventoryAccuracyReportingService,
    
    // Repositories
    ProductRepository,
    ProductCategoryRepository,
    ProductBrandRepository,
    InventoryRepository,
    InventoryMovementRepository,
    BatchTrackingRepository,
    CycleCountingRepository,
    
    // GraphQL Resolvers
    ProductResolver,
    InventoryResolver,
    BrandResolver,
    CategoryResolver,
    BatchTrackingResolver,
    CycleCountingResolver,
    InventoryReportingResolver,
    InventoryMovementTrackingResolver,
    PerpetualInventoryResolver,
    InventoryAccuracyReportingResolver,
    ReorderResolver,
    InventoryValuationResolver,
    
    // Event handlers
    // InventoryEventHandler,
  ],
  exports: [
    ProductService,
    ProductCategoryService,
    ProductBrandService,
    InventoryService,
    ReorderService,
    BatchTrackingService,
    CycleCountingService,
    InventoryValuationService,
    InventoryReportingService,
    InventoryMovementTrackingService,
    PerpetualInventoryService,
    InventoryAccuracyReportingService,
  ],
})
export class InventoryModule {}