import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { QueueModule } from '../queue/queue.module';
import { PubSubModule } from '../../common/graphql/pubsub.module';

// Services
import { CustomerService } from './services/customer.service';
import { LoyaltyService } from './services/loyalty.service';
import { SegmentationService } from './services/segmentation.service';
import { CommunicationService } from './services/communication.service';
import { CustomerAnalyticsService } from './services/customer-analytics.service';
import { CampaignService } from './services/campaign.service';
import { B2BCustomerService } from './services/b2b-customer.service';
import { CrmSubscriptionService } from './services/crm-subscription.service';

// Repositories
import { CustomerRepository } from './repositories/customer.repository';
import { LoyaltyRepository } from './repositories/loyalty.repository';
import { SegmentationRepository } from './repositories/segmentation.repository';
import { CommunicationRepository } from './repositories/communication.repository';

// Resolvers (GraphQL)
import { CustomerResolver } from './resolvers/customer.resolver';
import { LoyaltyResolver } from './resolvers/loyalty.resolver';
import { B2BCustomerResolver } from './resolvers/b2b-customer.resolver';
import { CommunicationResolver } from './resolvers/communication.resolver';
import { CustomerAnalyticsResolver } from './resolvers/customer-analytics.resolver';
import { SegmentationResolver } from './resolvers/segmentation.resolver';
import { CampaignResolver } from './resolvers/campaign.resolver';

// Event Handlers
import { CustomerEventHandler } from './handlers/customer-event.handler';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    QueueModule,
    PubSubModule,
  ],
  providers: [
    // Services
    CustomerService,
    LoyaltyService,
    SegmentationService,
    CommunicationService,
    CustomerAnalyticsService,
    CampaignService,
    B2BCustomerService,
    CrmSubscriptionService,
    
    // Repositories
    CustomerRepository,
    LoyaltyRepository,
    SegmentationRepository,
    CommunicationRepository,
    
    // GraphQL Resolvers
    CustomerResolver,
    LoyaltyResolver,
    B2BCustomerResolver,
    CommunicationResolver,
    CustomerAnalyticsResolver,
    SegmentationResolver,
    CampaignResolver,
    
    // Event Handlers
    CustomerEventHandler,
  ],
  exports: [
    CustomerService,
    LoyaltyService,
    SegmentationService,
    CommunicationService,
    CustomerAnalyticsService,
    CampaignService,
    B2BCustomerService,
    CrmSubscriptionService,
  ],
})
export class CrmModule {}