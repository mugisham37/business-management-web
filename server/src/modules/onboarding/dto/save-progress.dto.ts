import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BusinessType,
  CloudProvider,
  GrowthProjection,
  GeographicSpread,
  LocationType,
  ComplianceRequirement,
  TransactionVolume,
} from '../types/onboarding.types';

// ============================================================================
// Nested DTOs for each onboarding step
// ============================================================================

export class BusinessInfoDto {
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsString()
  @IsNotEmpty()
  industry!: string;

  @IsEnum(['Retail', 'Wholesale', 'Manufacturing', 'Service', 'E-commerce', 'Hybrid'])
  @IsNotEmpty()
  businessType!: BusinessType;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;
}

export class ProductFeaturesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  selectedFeatures!: string[];
}

export class TeamSizeDto {
  @IsNumber()
  @Min(1)
  current!: number;

  @IsEnum(['None', '2x', '5x', '10x+'])
  growthProjection!: GrowthProjection;
}

export class LocationsDataDto {
  @IsBoolean()
  multiLocation!: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  count?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  types?: LocationType[];

  @IsEnum(['Single city', 'Multiple cities', 'Regional', 'National', 'International'])
  @IsOptional()
  geographicSpread?: GeographicSpread;
}

export class InfrastructureDataDto {
  @IsEnum(['aws', 'azure'])
  provider!: CloudProvider;

  @IsNumber()
  @Min(6)
  @Max(128)
  storage!: number;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsArray()
  @IsString({ each: true })
  compliance!: ComplianceRequirement[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dataResidency?: string[];

  @IsEnum(['Low (<1k/month)', 'Medium (1k-50k/month)', 'High (50k-500k/month)', 'Enterprise (500k+/month)'])
  transactionVolume!: TransactionVolume;
}

export class IntegrationsDataDto {
  @IsArray()
  @IsString({ each: true })
  selectedIntegrations!: string[];
}

// ============================================================================
// Main Onboarding Data DTO
// ============================================================================

export class OnboardingDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  businessInfo?: BusinessInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFeaturesDto)
  features?: ProductFeaturesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TeamSizeDto)
  teamSize?: TeamSizeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationsDataDto)
  locations?: LocationsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InfrastructureDataDto)
  infrastructure?: InfrastructureDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationsDataDto)
  integrations?: IntegrationsDataDto;
}

// ============================================================================
// Save Progress Request DTO
// ============================================================================

export class SaveProgressDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OnboardingDataDto)
  data!: Partial<OnboardingDataDto>;
}
