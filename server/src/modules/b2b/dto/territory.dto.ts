/**
 * Territory DTOs
 * 
 * Data Transfer Objects for territory management functionality
 */

export type TerritoryType = 'geographic' | 'account' | 'product' | 'industry' | 'channel';
export type DBTerritoryType = 'custom' | 'geographic' | 'industry' | 'account_size' | 'product_line';

export interface CreateTerritoryDto {
  name: string;
  description?: string;
  type: TerritoryType;
  territoryCode: string;
  territoryType: DBTerritoryType;
  assignedToUserId?: string;
  metadata?: Record<string, any>;
  geographicBounds?: Record<string, any>;
  industryCriteria?: string[];
  accountSizeCriteria?: Record<string, any>;
  productLineCriteria?: string[];
  customCriteria?: Record<string, any>;
  primarySalesRepId?: string;
  secondarySalesRepIds?: string[];
  managerId?: string;
  annualRevenueTarget?: number;
  quarterlyRevenueTarget?: number;
  customerAcquisitionTarget?: number;
  commissionStructure?: Record<string, any>;
}

export interface UpdateTerritoryDto {
  territoryId: string;
  name?: string;
  description?: string;
  type?: TerritoryType;
  assignedToUserId?: string;
  metadata?: Record<string, any>;
  primarySalesRepId?: string;
  secondarySalesRepIds?: string[];
  managerId?: string;
  annualRevenueTarget?: number;
  quarterlyRevenueTarget?: number;
}

export interface TerritoryQueryDto {
  search?: string;
  type?: TerritoryType;
  assignedToUserId?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  territoryType?: DBTerritoryType;
  isActive?: boolean;
  primarySalesRepId?: string;
  managerId?: string;
  minAnnualRevenueTarget?: number;
  maxAnnualRevenueTarget?: number;
}

export interface AssignCustomerToTerritoryDto {
  territoryId: string;
  customerId: string;
  isPrimary?: boolean;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  assignmentReason?: string;
}

export interface BulkAssignCustomersDto {
  territoryId: string;
  customerIds: string[];
  isPrimary?: boolean;
  startDate?: Date;
  endDate?: Date;
  assignmentReason?: string;
}

export interface TerritoryAssignmentDto {
  id: string;
  territoryId: string;
  customerId: string;
  isPrimary: boolean;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
