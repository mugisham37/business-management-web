/**
 * Customer DTOs for repository operations
 * These are pure data transfer object interfaces used internally by repositories
 */

export interface CreateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  displayName?: string;
  companyName?: string;
  customerNumber?: string;
  type?: 'individual' | 'business';
  status?: 'active' | 'inactive' | 'suspended';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  purchaseCount?: number;
  lastPurchaseDate?: Date;
  churnRisk?: number;
  creditLimit?: number;
  paymentTerms?: number;
  discountPercentage?: number;
  marketingOptIn?: boolean;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  tags?: string[];
  customFields?: Record<string, any>;
  preferences?: Record<string, any>;
  socialProfiles?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  displayName?: string;
  companyName?: string;
  customerNumber?: string;
  type?: 'individual' | 'business';
  status?: 'active' | 'inactive' | 'suspended';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  purchaseCount?: number;
  lastPurchaseDate?: Date;
  churnRisk?: number;
  creditLimit?: number;
  paymentTerms?: number;
  discountPercentage?: number;
  marketingOptIn?: boolean;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  tags?: string[];
  customFields?: Record<string, any>;
  preferences?: Record<string, any>;
  socialProfiles?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CustomerQueryDto {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  loyaltyTier?: string;
  city?: string;
  state?: string;
  country?: string;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minChurnRisk?: number;
  maxChurnRisk?: number;
  createdAfter?: string;
  createdBefore?: string;
  lastPurchaseAfter?: string;
  lastPurchaseBefore?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
