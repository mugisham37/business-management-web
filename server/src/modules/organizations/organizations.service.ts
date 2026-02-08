import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Organization } from '@prisma/client';

export interface CreateOrganizationDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  maxUsers?: number;
  maxLocations?: number;
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface OnboardingData {
  businessType?: string;
  industry?: string;
  companySize?: string;
  requiredFeatures?: string[];
  teamSize?: number;
  numberOfLocations?: number;
}

export interface Plan {
  name: string;
  price: number;
  maxUsers: number;
  maxLocations: number;
  features: string[];
  recommended?: boolean;
  reason?: string;
}

/**
 * Organizations Service for tenant management
 * 
 * Features:
 * - Organization CRUD operations
 * - Unique company code generation
 * - Organization limits enforcement
 * - Subscription management
 * - Onboarding flow support
 * 
 * Requirements: 1.1, 6.1, 16.5, 16.6, 18.5, 18.6
 */
@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new organization with unique company code
   * 
   * @param dto - Organization creation data
   * @returns Created organization
   */
  async create(dto: CreateOrganizationDto): Promise<Organization> {
    try {
      // Generate unique company code
      const companyCode = await this.generateUniqueCompanyCode();

      const organization = await this.prisma.organization.create({
        data: {
          companyCode,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          maxUsers: dto.maxUsers || 10,
          maxLocations: dto.maxLocations || 1,
          subscriptionStatus: 'trial',
        },
      });

      this.logger.log(`Organization created: ${organization.id} (${companyCode})`);

      return organization;
    } catch (error) {
      this.logger.error('Failed to create organization:', error);
      throw error;
    }
  }

  /**
   * Find organization by ID
   * 
   * @param id - Organization ID
   * @returns Organization or null
   */
  async findById(id: string): Promise<Organization | null> {
    try {
      return await this.prisma.organization.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find organization by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find organization by company code
   * 
   * @param companyCode - Company code (6-character alphanumeric)
   * @returns Organization or null
   */
  async findByCompanyCode(companyCode: string): Promise<Organization | null> {
    try {
      return await this.prisma.organization.findUnique({
        where: { companyCode: companyCode.toUpperCase() },
      });
    } catch (error) {
      this.logger.error(`Failed to find organization by company code: ${companyCode}`, error);
      throw error;
    }
  }

  /**
   * Update organization
   * 
   * @param id - Organization ID
   * @param dto - Update data
   * @returns Updated organization
   */
  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    try {
      // Verify organization exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundException(`Organization not found: ${id}`);
      }

      const organization = await this.prisma.organization.update({
        where: { id },
        data: dto,
      });

      this.logger.log(`Organization updated: ${id}`);

      return organization;
    } catch (error) {
      this.logger.error(`Failed to update organization: ${id}`, error);
      throw error;
    }
  }

  /**
   * Check if organization can add a new user
   * 
   * @param orgId - Organization ID
   * @returns True if user can be added
   */
  async canAddUser(orgId: string): Promise<boolean> {
    try {
      const organization = await this.findById(orgId);
      if (!organization) {
        throw new NotFoundException(`Organization not found: ${orgId}`);
      }

      return organization.currentUserCount < organization.maxUsers;
    } catch (error) {
      this.logger.error(`Failed to check user limit for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Check if organization can add a new location
   * 
   * @param orgId - Organization ID
   * @returns True if location can be added
   */
  async canAddLocation(orgId: string): Promise<boolean> {
    try {
      const organization = await this.findById(orgId);
      if (!organization) {
        throw new NotFoundException(`Organization not found: ${orgId}`);
      }

      return organization.currentLocationCount < organization.maxLocations;
    } catch (error) {
      this.logger.error(`Failed to check location limit for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Increment user count for organization
   * 
   * @param orgId - Organization ID
   */
  async incrementUserCount(orgId: string): Promise<void> {
    try {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: {
          currentUserCount: {
            increment: 1,
          },
        },
      });

      this.logger.debug(`Incremented user count for organization: ${orgId}`);
    } catch (error) {
      this.logger.error(`Failed to increment user count for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Decrement user count for organization
   * 
   * @param orgId - Organization ID
   */
  async decrementUserCount(orgId: string): Promise<void> {
    try {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: {
          currentUserCount: {
            decrement: 1,
          },
        },
      });

      this.logger.debug(`Decremented user count for organization: ${orgId}`);
    } catch (error) {
      this.logger.error(`Failed to decrement user count for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Update organization subscription
   * 
   * @param orgId - Organization ID
   * @param plan - Subscription plan name
   * @param status - Subscription status
   */
  async updateSubscription(
    orgId: string,
    plan: string,
    status: 'trial' | 'active' | 'suspended' | 'cancelled',
  ): Promise<void> {
    try {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: status,
        },
      });

      this.logger.log(`Updated subscription for organization ${orgId}: ${plan} (${status})`);
    } catch (error) {
      this.logger.error(`Failed to update subscription for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Check if organization subscription is active
   * 
   * @param orgId - Organization ID
   * @returns True if subscription is active or in trial
   */
  async isSubscriptionActive(orgId: string): Promise<boolean> {
    try {
      const organization = await this.findById(orgId);
      if (!organization) {
        throw new NotFoundException(`Organization not found: ${orgId}`);
      }

      // Active if status is 'active' or 'trial'
      return organization.subscriptionStatus === 'active' || 
             organization.subscriptionStatus === 'trial';
    } catch (error) {
      this.logger.error(`Failed to check subscription status for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Complete onboarding for organization
   * 
   * @param orgId - Organization ID
   * @param data - Onboarding data collected from user
   */
  async completeOnboarding(orgId: string, data: OnboardingData): Promise<void> {
    try {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: {
          onboardingCompleted: true,
          onboardingData: data as any,
        },
      });

      this.logger.log(`Onboarding completed for organization: ${orgId}`);
    } catch (error) {
      this.logger.error(`Failed to complete onboarding for organization: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Get recommended subscription plans based on onboarding data
   * 
   * This implements a simple plan recommendation algorithm based on:
   * - Team size
   * - Number of locations
   * - Required features
   * - Company size
   * 
   * @param data - Onboarding data
   * @returns Array of recommended plans
   */
  getRecommendedPlans(data: OnboardingData): Plan[] {
    const plans: Plan[] = [
      {
        name: 'Starter',
        price: 29,
        maxUsers: 10,
        maxLocations: 1,
        features: ['Basic user management', 'Single location', 'Email support'],
      },
      {
        name: 'Professional',
        price: 99,
        maxUsers: 50,
        maxLocations: 5,
        features: [
          'Advanced user management',
          'Multiple locations',
          'Role-based access control',
          'Priority support',
        ],
      },
      {
        name: 'Business',
        price: 299,
        maxUsers: 200,
        maxLocations: 20,
        features: [
          'Enterprise user management',
          'Unlimited locations',
          'Advanced permissions',
          'Department management',
          'Audit logging',
          '24/7 support',
        ],
      },
      {
        name: 'Enterprise',
        price: 999,
        maxUsers: 1000,
        maxLocations: 100,
        features: [
          'All Business features',
          'Custom integrations',
          'Dedicated account manager',
          'SLA guarantee',
          'Advanced security',
        ],
      },
    ];

    // Determine recommended plan based on requirements
    const teamSize = data.teamSize || 1;
    const locationCount = data.numberOfLocations || 1;
    const companySize = data.companySize?.toLowerCase() || 'small';

    let recommendedPlan: Plan | null = null;

    // Simple recommendation logic
    if (companySize === 'enterprise' || teamSize > 200 || locationCount > 20) {
      recommendedPlan = plans.find(p => p.name === 'Enterprise') || null;
    } else if (companySize === 'large' || teamSize > 50 || locationCount > 5) {
      recommendedPlan = plans.find(p => p.name === 'Business') || null;
    } else if (companySize === 'medium' || teamSize > 10 || locationCount > 1) {
      recommendedPlan = plans.find(p => p.name === 'Professional') || null;
    } else {
      recommendedPlan = plans.find(p => p.name === 'Starter') || null;
    }

    // Mark recommended plan
    if (recommendedPlan) {
      recommendedPlan.recommended = true;
      recommendedPlan.reason = this.getRecommendationReason(data, recommendedPlan);
    }

    return plans;
  }

  /**
   * Generate recommendation reason based on onboarding data
   * 
   * @param data - Onboarding data
   * @param plan - Recommended plan
   * @returns Recommendation reason
   */
  private getRecommendationReason(data: OnboardingData, plan: Plan): string {
    const reasons: string[] = [];

    if (data.teamSize && data.teamSize > 10) {
      reasons.push(`Supports up to ${plan.maxUsers} users for your team of ${data.teamSize}`);
    }

    if (data.numberOfLocations && data.numberOfLocations > 1) {
      reasons.push(`Includes ${plan.maxLocations} locations for your ${data.numberOfLocations} locations`);
    }

    if (data.companySize) {
      reasons.push(`Designed for ${data.companySize} businesses`);
    }

    if (reasons.length === 0) {
      return `Best fit for your business needs`;
    }

    return reasons.join('. ');
  }

  /**
   * Generate a unique 6-character alphanumeric company code
   * 
   * @returns Unique company code
   */
  private async generateUniqueCompanyCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generate random code
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }

      // Check if code already exists
      const existing = await this.prisma.organization.findUnique({
        where: { companyCode: code },
      });

      if (!existing) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique company code after maximum attempts');
  }
}
