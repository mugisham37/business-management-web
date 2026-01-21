/**
 * Customer Portal DTOs
 * 
 * Data Transfer Objects for customer portal functionality
 */

export interface CustomerPortalDto {
  customerId: string;
  tenantId: string;
  recentOrders?: any[];
  recentQuotes?: any[];
  accountBalance?: number;
  pendingApprovals?: any[];
  notifications?: any[];
}

export interface CustomerPortalLoginDto {
  email: string;
  password: string;
}

export interface CustomerPortalRegistrationDto {
  email: string;
  password: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  taxId?: string;
  industry?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
}

export interface CreatePortalOrderDto {
  items: {
    productId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  shippingAddress?: any;
  billingAddress?: any;
  specialInstructions?: string;
  purchaseOrderNumber?: string;
  requestedDeliveryDate?: Date;
  shippingMethod?: string;
}

export interface PortalOrderQueryDto {
  status?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  orderDateFrom?: Date;
  orderDateTo?: Date;
}

export interface ProductCatalogQueryDto {
  search?: string;
  categoryId?: string;
  category?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface UpdateAccountInfoDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingAddress?: any;
  shippingAddress?: any;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CustomerPortalOrderDto {
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  status: string;
  totalAmount: number;
}

export interface CustomerPortalQuoteDto {
  quoteId: string;
  quoteNumber: string;
  quoteDate: Date;
  status: string;
  totalAmount: number;
}

export interface CustomerPortalNotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
