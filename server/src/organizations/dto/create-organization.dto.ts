import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  businessName: string;

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
  @Min(0)
  storageVolume?: number;

  @IsOptional()
  @IsBoolean()
  compression?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
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
