import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsObject, IsArray, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FranchiseType, FranchiseStatus, TerritoryType, AssignmentType } from '../entities/franchise.entity';

// Franchise DTOs
export class CreateFranchiseDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FranchiseType)
  type!: FranchiseType;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  royaltyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  marketingFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialFranchiseFee?: number;

  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @IsOptional()
  @IsObject()
  contractTerms?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  primaryTerritoryId?: string;

  @IsOptional()
  @IsUUID()
  parentFranchiseId?: string;
}

export class UpdateFranchiseDto extends PartialType(CreateFranchiseDto) {
  @IsOptional()
  @IsEnum(FranchiseStatus)
  status?: FranchiseStatus;

  @IsOptional()
  @IsObject()
  performanceMetrics?: Record<string, any>;

  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, any>;
}

export class FranchiseQueryDto {
  @IsOptional()
  @IsEnum(FranchiseType)
  type?: FranchiseType;

  @IsOptional()
  @IsEnum(FranchiseStatus)
  status?: FranchiseStatus;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  territoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

// Territory DTOs
export class CreateTerritoryDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TerritoryType)
  type!: TerritoryType;

  @IsOptional()
  @IsObject()
  boundaries?: Record<string, any>;

  @IsOptional()
  @IsObject()
  marketCriteria?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  parentTerritoryId?: string;

  @IsOptional()
  @IsUUID()
  assignedFranchiseId?: string;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateTerritoryDto extends PartialType(CreateTerritoryDto) {
  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TerritoryQueryDto {
  @IsOptional()
  @IsEnum(TerritoryType)
  type?: TerritoryType;

  @IsOptional()
  @IsUUID()
  franchiseId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

// Franchise Location DTOs
export class CreateFranchiseLocationDto {
  @IsUUID()
  franchiseId!: string;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsString()
  role?: string = 'primary';

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateFranchiseLocationDto extends PartialType(CreateFranchiseLocationDto) {}

// Franchise Permission DTOs
export class CreateFranchisePermissionDto {
  @IsUUID()
  franchiseId!: string;

  @IsUUID()
  userId!: string;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];

  @IsOptional()
  @IsString()
  role?: string = 'operator';

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}

export class UpdateFranchisePermissionDto extends PartialType(CreateFranchisePermissionDto) {}

// Territory Assignment DTOs
export class CreateTerritoryAssignmentDto {
  @IsUUID()
  territoryId!: string;

  @IsOptional()
  @IsUUID()
  franchiseId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(AssignmentType)
  assignmentType!: AssignmentType;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTerritoryAssignmentDto extends PartialType(CreateTerritoryAssignmentDto) {}

// Franchise Performance DTOs
export class FranchisePerformanceDto {
  franchiseId!: string;
  period!: string;
  salesMetrics!: {
    totalSales: number;
    salesGrowth: number;
    averageTransactionValue: number;
    transactionCount: number;
  };
  financialMetrics!: {
    revenue: number;
    royaltyPaid: number;
    marketingFeePaid: number;
    profitMargin: number;
  };
  operationalMetrics!: {
    customerSatisfaction: number;
    employeeCount: number;
    inventoryTurnover: number;
    complianceScore: number;
  };
  territoryMetrics!: {
    marketShare: number;
    territoryPenetration: number;
    competitorAnalysis: Record<string, any>;
  };
}

// Dealer Portal DTOs
export class DealerPortalAccessDto {
  @IsUUID()
  franchiseId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  accessLevel!: string; // 'full', 'limited', 'readonly'

  @IsArray()
  @IsString({ each: true })
  allowedModules!: string[];

  @IsOptional()
  @IsObject()
  customPermissions?: Record<string, any>;
}

export class DealerDashboardDto {
  franchise!: {
    id: string;
    name: string;
    type: FranchiseType;
    status: FranchiseStatus;
    territory: string;
  };
  performance!: {
    currentPeriod: FranchisePerformanceDto;
    previousPeriod: FranchisePerformanceDto;
    trends: Record<string, any>;
  };
  territory?: {
    id: string;
    name: string;
    type: TerritoryType;
    boundaries: Record<string, any>;
    competitors: any[];
  };
  availableActions!: string[];
  notifications!: any[];
  quickLinks!: any[];
}