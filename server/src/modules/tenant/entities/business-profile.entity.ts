import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Industry classification enum
 */
export enum IndustryType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  MANUFACTURING = 'manufacturing',
  SERVICES = 'services',
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  FINANCE = 'finance',
  REAL_ESTATE = 'real_estate',
  CONSTRUCTION = 'construction',
  TRANSPORTATION = 'transportation',
  HOSPITALITY = 'hospitality',
  AGRICULTURE = 'agriculture',
  ENERGY = 'energy',
  RENEWABLES = 'renewables',
  FOOD_BEVERAGE = 'food_beverage',
  AUTOMOTIVE = 'automotive',
  TELECOMMUNICATIONS = 'telecommunications',
  MEDIA_ENTERTAINMENT = 'media_entertainment',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  OTHER = 'other',
}

/**
 * Business size classification
 */
export enum BusinessSize {
  SOLO = 'solo',           // 1 person
  MICRO = 'micro',         // 2-9 employees
  SMALL = 'small',         // 10-49 employees
  MEDIUM = 'medium',       // 50-249 employees
  LARGE = 'large',         // 250-999 employees
  ENTERPRISE = 'enterprise', // 1000+ employees
}

/**
 * Business type for plan recommendation
 */
export enum BusinessType {
  FREE = 'free',
  RENEWABLES = 'renewables',
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  INDUSTRY = 'industry',
}

/**
 * Revenue range classification
 */
export enum RevenueRange {
  UNDER_10K = 'under_10k',
  FROM_10K_TO_50K = '10k_to_50k',
  FROM_50K_TO_100K = '50k_to_100k',
  FROM_100K_TO_500K = '100k_to_500k',
  FROM_500K_TO_1M = '500k_to_1m',
  FROM_1M_TO_5M = '1m_to_5m',
  FROM_5M_TO_10M = '5m_to_10m',
  OVER_10M = 'over_10m',
}

/**
 * Transaction volume range
 */
export enum TransactionVolumeRange {
  UNDER_100 = 'under_100',
  FROM_100_TO_500 = '100_to_500',
  FROM_500_TO_1K = '500_to_1k',
  FROM_1K_TO_5K = '1k_to_5k',
  FROM_5K_TO_10K = '5k_to_10k',
  FROM_10K_TO_50K = '10k_to_50k',
  OVER_50K = 'over_50k',
}

// Register enums for GraphQL
registerEnumType(IndustryType, {
  name: 'IndustryType',
  description: 'Industry classification for business profile',
});

registerEnumType(BusinessSize, {
  name: 'BusinessSize',
  description: 'Business size classification based on employee count',
});

registerEnumType(BusinessType, {
  name: 'BusinessType',
  description: 'Business type categories for plan recommendation',
});

registerEnumType(RevenueRange, {
  name: 'RevenueRange',
  description: 'Monthly revenue range classification',
});

registerEnumType(TransactionVolumeRange, {
  name: 'TransactionVolumeRange',
  description: 'Monthly transaction volume range classification',
});

/**
 * Business profile data model
 */
@ObjectType()
export class BusinessProfile {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for the business profile' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Business name' })
  businessName!: string;

  @Field(() => IndustryType)
  @ApiProperty({ enum: IndustryType, description: 'Primary industry classification' })
  industry!: IndustryType;

  @Field(() => BusinessSize)
  @ApiProperty({ enum: BusinessSize, description: 'Business size based on employee count' })
  businessSize!: BusinessSize;

  @Field(() => BusinessType)
  @ApiProperty({ enum: BusinessType, description: 'Business type for plan recommendation' })
  businessType!: BusinessType;

  @Field(() => Int)
  @ApiProperty({ description: 'Expected number of employees' })
  expectedEmployees!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Expected number of business locations' })
  expectedLocations!: number;

  @Field(() => RevenueRange)
  @ApiProperty({ enum: RevenueRange, description: 'Expected monthly revenue range' })
  expectedRevenueRange!: RevenueRange;

  @Field(() => TransactionVolumeRange)
  @ApiProperty({ enum: TransactionVolumeRange, description: 'Expected monthly transaction volume range' })
  expectedTransactionVolumeRange!: TransactionVolumeRange;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Specific expected monthly revenue in cents', required: false })
  expectedMonthlyRevenue?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Specific expected monthly transaction count', required: false })
  expectedMonthlyTransactions?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Current software solutions being used', required: false })
  currentSoftware?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Primary business goals', required: false })
  businessGoals?: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Additional business description', required: false })
  description?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business website URL', required: false })
  website?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business phone number', required: false })
  phoneNumber?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business address', required: false })
  address?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business city', required: false })
  city?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business state/province', required: false })
  state?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business country', required: false })
  country?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Business postal/zip code', required: false })
  postalCode?: string;

  @Field()
  @ApiProperty({ description: 'Profile creation timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Profile last update timestamp' })
  updatedAt!: Date;
}

/**
 * Industry classification helper
 */
export class IndustryClassification {
  private static readonly industryMappings: Record<string, IndustryType> = {
    'retail': IndustryType.RETAIL,
    'wholesale': IndustryType.WHOLESALE,
    'manufacturing': IndustryType.MANUFACTURING,
    'services': IndustryType.SERVICES,
    'technology': IndustryType.TECHNOLOGY,
    'tech': IndustryType.TECHNOLOGY,
    'healthcare': IndustryType.HEALTHCARE,
    'education': IndustryType.EDUCATION,
    'finance': IndustryType.FINANCE,
    'financial': IndustryType.FINANCE,
    'real estate': IndustryType.REAL_ESTATE,
    'construction': IndustryType.CONSTRUCTION,
    'transportation': IndustryType.TRANSPORTATION,
    'hospitality': IndustryType.HOSPITALITY,
    'agriculture': IndustryType.AGRICULTURE,
    'energy': IndustryType.ENERGY,
    'renewables': IndustryType.RENEWABLES,
    'renewable': IndustryType.RENEWABLES,
    'food': IndustryType.FOOD_BEVERAGE,
    'beverage': IndustryType.FOOD_BEVERAGE,
    'automotive': IndustryType.AUTOMOTIVE,
    'telecommunications': IndustryType.TELECOMMUNICATIONS,
    'telecom': IndustryType.TELECOMMUNICATIONS,
    'media': IndustryType.MEDIA_ENTERTAINMENT,
    'entertainment': IndustryType.MEDIA_ENTERTAINMENT,
    'non-profit': IndustryType.NON_PROFIT,
    'nonprofit': IndustryType.NON_PROFIT,
    'government': IndustryType.GOVERNMENT,
  };

  /**
   * Classify industry from text input
   */
  static classifyIndustry(input: string): IndustryType {
    const normalized = input.toLowerCase().trim();
    
    // Direct match
    if (this.industryMappings[normalized]) {
      return this.industryMappings[normalized];
    }

    // Partial match
    for (const [key, value] of Object.entries(this.industryMappings)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }

    return IndustryType.OTHER;
  }

  /**
   * Get industry display name
   */
  static getIndustryDisplayName(industry: IndustryType): string {
    const displayNames: Record<IndustryType, string> = {
      [IndustryType.RETAIL]: 'Retail',
      [IndustryType.WHOLESALE]: 'Wholesale',
      [IndustryType.MANUFACTURING]: 'Manufacturing',
      [IndustryType.SERVICES]: 'Services',
      [IndustryType.TECHNOLOGY]: 'Technology',
      [IndustryType.HEALTHCARE]: 'Healthcare',
      [IndustryType.EDUCATION]: 'Education',
      [IndustryType.FINANCE]: 'Finance',
      [IndustryType.REAL_ESTATE]: 'Real Estate',
      [IndustryType.CONSTRUCTION]: 'Construction',
      [IndustryType.TRANSPORTATION]: 'Transportation',
      [IndustryType.HOSPITALITY]: 'Hospitality',
      [IndustryType.AGRICULTURE]: 'Agriculture',
      [IndustryType.ENERGY]: 'Energy',
      [IndustryType.RENEWABLES]: 'Renewables',
      [IndustryType.FOOD_BEVERAGE]: 'Food & Beverage',
      [IndustryType.AUTOMOTIVE]: 'Automotive',
      [IndustryType.TELECOMMUNICATIONS]: 'Telecommunications',
      [IndustryType.MEDIA_ENTERTAINMENT]: 'Media & Entertainment',
      [IndustryType.NON_PROFIT]: 'Non-Profit',
      [IndustryType.GOVERNMENT]: 'Government',
      [IndustryType.OTHER]: 'Other',
    };

    return displayNames[industry] || 'Other';
  }

  /**
   * Get all available industries with display names
   */
  static getAllIndustries(): Array<{ value: IndustryType; label: string }> {
    return Object.values(IndustryType).map(industry => ({
      value: industry,
      label: this.getIndustryDisplayName(industry),
    }));
  }
}

/**
 * Business size helper
 */
export class BusinessSizeHelper {
  /**
   * Determine business size from employee count
   */
  static determineBusinessSize(employeeCount: number): BusinessSize {
    if (employeeCount === 1) return BusinessSize.SOLO;
    if (employeeCount <= 9) return BusinessSize.MICRO;
    if (employeeCount <= 49) return BusinessSize.SMALL;
    if (employeeCount <= 249) return BusinessSize.MEDIUM;
    if (employeeCount <= 999) return BusinessSize.LARGE;
    return BusinessSize.ENTERPRISE;
  }

  /**
   * Get employee count range for business size
   */
  static getEmployeeRange(businessSize: BusinessSize): { min: number; max: number | null } {
    const ranges: Record<BusinessSize, { min: number; max: number | null }> = {
      [BusinessSize.SOLO]: { min: 1, max: 1 },
      [BusinessSize.MICRO]: { min: 2, max: 9 },
      [BusinessSize.SMALL]: { min: 10, max: 49 },
      [BusinessSize.MEDIUM]: { min: 50, max: 249 },
      [BusinessSize.LARGE]: { min: 250, max: 999 },
      [BusinessSize.ENTERPRISE]: { min: 1000, max: null },
    };

    return ranges[businessSize];
  }

  /**
   * Get business size display name
   */
  static getBusinessSizeDisplayName(businessSize: BusinessSize): string {
    const displayNames: Record<BusinessSize, string> = {
      [BusinessSize.SOLO]: 'Solo (1 person)',
      [BusinessSize.MICRO]: 'Micro (2-9 employees)',
      [BusinessSize.SMALL]: 'Small (10-49 employees)',
      [BusinessSize.MEDIUM]: 'Medium (50-249 employees)',
      [BusinessSize.LARGE]: 'Large (250-999 employees)',
      [BusinessSize.ENTERPRISE]: 'Enterprise (1000+ employees)',
    };

    return displayNames[businessSize];
  }
}