import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';
import { UUIDScalar, DecimalScalar, DateTimeScalar } from './scalars';
import { PubSubModule } from './pubsub.module';
import { PubSubService } from './pubsub.service';

/**
 * Global GraphQL common module providing shared GraphQL functionality
 * Includes DataLoader, custom scalars, and PubSub for subscriptions
 */
@Global()
@Module({
  imports: [PubSubModule],
  providers: [
    DataLoaderService,
    PubSubService,
    UUIDScalar,
    DecimalScalar,
    DateTimeScalar,
  ],
  exports: [
    DataLoaderService,
    PubSubService,
    UUIDScalar,
    DecimalScalar,
    DateTimeScalar,
  ],
})
export class GraphQLCommonModule {}