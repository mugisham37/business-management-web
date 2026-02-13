import { IsString, IsEmail, IsBoolean, IsOptional, IsArray, IsInt, MinLength } from 'class-validator';

/**
 * DTO for organization registration
 * Implements requirements 1.1, 1.8, 1.9, 1.10
 */
export class RegisterOrganizationDto {
  // Required fields
  @IsString()
  @MinLength(1)
  businessName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsBoolean()
  acceptedTerms: boolean;

  // Optional fields
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  employeeCount?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedModules?: string[];

  @IsOptional()
  @IsString()
  primaryGoal?: string;

  @IsOptional()
  @IsString()
  cloudProvider?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  storageVolume?: number;

  @IsOptional()
  @IsBoolean()
  compression?: boolean;

  @IsOptional()
  @IsInt()
  activeHours?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  integrations?: string[];

  @IsOptional()
  @IsString()
  selectedPlan?: string;

  @IsOptional()
  @IsString()
  billingCycle?: string;
}
