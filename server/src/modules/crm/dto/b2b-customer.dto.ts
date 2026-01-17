/**
 * B2B Customer DTOs for repository operations
 * These are pure data transfer object interfaces used internally by repositories
 */

export interface CreateB2BCustomerDto {
  customerId?: string;
  companyName: string;
  companyRegistration?: string;
  registrationNumber?: string;
  taxId?: string;
  dunsNumber?: string;
  industry?: string;
  companySize?: string;
  annualRevenue?: number;
  employeeCount?: number;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactTitle?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  shippingAddress?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  creditLimit?: number;
  creditStatus?: 'approved' | 'pending' | 'rejected' | 'suspended' | 'under_review';
  paymentTerms?: string;
  customPaymentTermsDays?: number;
  volumeDiscountPercentage?: number;
  discountPercentage?: number;
  earlyPaymentDiscountPercentage?: number;
  earlyPaymentDiscountDays?: number;
  pricingTier?: string;
  minimumOrderAmount?: number;
  taxExempt?: boolean;
  salesRepId?: string;
  accountManagerId?: string;
  referralSource?: string;
  status?: 'active' | 'inactive' | 'suspended';
  email?: string;
  phone?: string;
  website?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  contractStartDate?: string | Date;
  contractEndDate?: string | Date;
  specialInstructions?: string;
  preferredCategories?: string[];
  b2bMetadata?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateB2BCustomerDto {
  companyName?: string;
  companyRegistration?: string;
  registrationNumber?: string;
  taxId?: string;
  dunsNumber?: string;
  industry?: string;
  companySize?: string;
  annualRevenue?: number;
  employeeCount?: number;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactTitle?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  shippingAddress?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  creditLimit?: number;
  creditStatus?: 'approved' | 'pending' | 'rejected' | 'suspended' | 'under_review';
  paymentTerms?: string;
  customPaymentTermsDays?: number;
  volumeDiscountPercentage?: number;
  discountPercentage?: number;
  earlyPaymentDiscountPercentage?: number;
  earlyPaymentDiscountDays?: number;
  pricingTier?: string;
  minimumOrderAmount?: number;
  taxExempt?: boolean;
  salesRepId?: string;
  accountManagerId?: string;
  referralSource?: string;
  status?: 'active' | 'inactive' | 'suspended';
  email?: string;
  phone?: string;
  website?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  contractStartDate?: string | Date;
  contractEndDate?: string | Date;
  specialInstructions?: string;
  preferredCategories?: string[];
  b2bMetadata?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface B2BCustomerQueryDto {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  industry?: string;
  creditStatus?: string;
  companyName?: string;
  pricingTier?: string;
  paymentTerms?: string;
  salesRepId?: string;
  accountManagerId?: string;
  minCreditLimit?: number;
  maxCreditLimit?: number;
  minAnnualRevenue?: number;
  maxAnnualRevenue?: number;
  contractExpiringWithinDays?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
