// Input types
export * from './customer.input';
export * from './b2b-customer.input';
export * from './communication.input';
export * from './segmentation.input';

// Loyalty input types
export {
  LoyaltyTransactionType,
  RewardType,
  CreateLoyaltyTransactionInput,
  UpdateLoyaltyTransactionInput,
  CreateRewardInput,
  UpdateRewardInput,
  LoyaltyTransactionFilterInput,
  RewardFilterInput,
} from './loyalty.input';

// Campaign input types (takes precedence over loyalty.input)
export {
  CampaignType,
  CampaignStatus,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignFilterInput,
} from './campaign.input';

// Output types
export * from './customer-analytics.types';
export * from './b2b-customer.types';
export * from './communication.types';
export * from './segmentation.types';
export * from './campaign.types';

// Entity types
export * from '../entities/customer.entity';