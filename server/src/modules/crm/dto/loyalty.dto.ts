/**
 * Loyalty DTOs for repository operations
 * These are pure data transfer object interfaces used internally by repositories
 */

export type LoyaltyTransactionType = 'earn' | 'redeem' | 'adjust' | 'expire' | 'expire_partial';

export const LOYALTY_TRANSACTION_TYPE = {
  EARNED: 'earn',
  REDEEMED: 'redeem',
  ADJUSTED: 'adjust',
  EXPIRED: 'expire',
  EXPIRED_PARTIAL: 'expire_partial',
} as const;

export interface CreateLoyaltyTransactionDto {
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;
  description?: string;
  reason?: string;
  relatedTransactionId?: string;
  relatedCampaignId?: string;
  expiresAt?: string | Date;
  campaignId?: string;
  promotionId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateLoyaltyTransactionDto {
  type?: LoyaltyTransactionType;
  points?: number;
  description?: string;
  reason?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}

export interface LoyaltyTransactionQueryDto {
  skip?: number;
  take?: number;
  customerId?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateRewardDto {
  name: string;
  description?: string;
  pointsRequired: number;
  type: 'discount' | 'product' | 'experience' | 'other';
  category?: string;
  isActive?: boolean;
  value?: number;
  productId?: string;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  usageLimitPerCustomer?: number;
  totalUsageLimit?: number;
  requiredTiers?: string[];
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

export interface UpdateRewardDto {
  name?: string;
  description?: string;
  pointsRequired?: number;
  type?: 'discount' | 'product' | 'experience' | 'other';
  category?: string;
  isActive?: boolean;
  value?: number;
  productId?: string;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  usageLimitPerCustomer?: number;
  totalUsageLimit?: number;
  requiredTiers?: string[];
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

export interface RewardQueryDto {
  skip?: number;
  take?: number;
  type?: string;
  isActive?: boolean;
  activeOnly?: boolean;
  availableOnly?: boolean;
  maxPointsRequired?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  type: 'loyalty_points' | 'discount' | 'promotion' | 'referral';
  startDate: Date;
  endDate: Date;
  pointsMultiplier?: number;
  minimumPurchaseAmount?: number;
  targetSegments?: string[];
  targetTiers?: string[];
  applicableCategories?: string[];
  applicableProducts?: string[];
  maxPointsPerCustomer?: number;
  totalPointsBudget?: number;
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  pointsMultiplier?: number;
  minimumPurchaseAmount?: number;
  targetSegments?: string[];
  targetTiers?: string[];
  applicableCategories?: string[];
  applicableProducts?: string[];
  maxPointsPerCustomer?: number;
  totalPointsBudget?: number;
  termsAndConditions?: string;
  metadata?: Record<string, any>;
}

export interface CampaignQueryDto {
  skip?: number;
  take?: number;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface LoyaltyQueryDto {
  customerId?: string;
  type?: string;
  campaignId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
