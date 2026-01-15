import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';
import { DateTimeScalar, JSONScalar, UUIDScalar, DecimalScalar } from './scalars';
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
    DateTimeScalar,
    JSONScalar,
    UUIDScalar,
    DecimalScalar,
  ],
  exports: [
    DataLoaderService,
    PubSubService,
    DateTimeScalar,
    JSONScalar,
    UUIDScalar,
    DecimalScalar,
  ],
})
export class GraphQLCommonModule {}