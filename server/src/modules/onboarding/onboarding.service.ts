import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';

/**
 * Onboarding Service
 * 
 * Provides business logic for onboarding operations:
 * - Save and retrieve onboarding progress
 * - Plan recommendation algorithm
 * - Organization limits updates
 * - Onboarding completion tracking
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}

  /**
   * Save step data to organization's onboardingData JSON field
   * 
   * This method merges new step data with existing onboarding data,
   * preserving all previously saved information.
   * 
   * @param organizationId - Organization ID
   * @param stepData - Partial onboarding data for the current step
   * @returns Updated complete onboarding data
   */
  async saveProgress(
    organizationId: string,
    stepData: any,
  ): Promise<any> {
    this.logger.log(`Saving progress for organization: ${organizationId}`);

    // Retrieve the organization to get existing onboarding data
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { onboardingData: true },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    // Get existing onboarding data or initialize as empty object
    const existingData = (organization.onboardingData as any) || {};

    // Merge new step data with existing data, preserving all previous data
    const updatedData = {
      ...existingData,
      ...stepData,
    };

    // Update the organization with merged data
    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { onboardingData: updatedData },
      select: { onboardingData: true },
    });

    return updated.onboardingData;
  }

  /**
   * Retrieve current onboarding progress
   * 
   * @param organizationId - Organization ID
   * @returns Current onboarding progress or null if not started
   */
  async getProgress(organizationId: string): Promise<any | null> {
    this.logger.log(`Getting progress for organization: ${organizationId}`);

    // Query organization by ID and extract onboarding fields
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        onboardingData: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    // Return null if no onboarding data exists
    if (!organization.onboardingData) {
      return null;
    }

    // Transform to OnboardingProgress format
    const progress = {
      organizationId: organization.id,
      data: organization.onboardingData,
      onboardingCompleted: organization.onboardingCompleted,
      startedAt: organization.createdAt,
      lastUpdatedAt: organization.updatedAt,
    };

    return progress;
  }

  /**
   * Mark onboarding as complete
   * 
   * @param organizationId - Organization ID
   */
  async completeOnboarding(organizationId: string): Promise<void> {
    this.logger.log(`Completing onboarding for organization: ${organizationId}`);

    // Update Organization.onboardingCompleted to true
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        onboardingCompleted: true,
        updatedAt: new Date(), // Set completion timestamp
      },
    });
  }

  /**
   * Generate plan recommendations based on collected data
   * 
   * Analyzes onboarding data using a weighted scoring system:
   * - Team size (30%)
   * - Feature complexity (25%)
   * - Infrastructure requirements (20%)
   * - Location needs (15%)
   * - Business context (10%)
   * 
   * @param organizationId - Organization ID
   * @returns Array of plan recommendations with scores and reasoning
   */
  async recommendPlan(organizationId: string): Promise<any[]> {
    // TODO: Implement recommendPlan logic
    // This will be implemented in task 5.5
    this.logger.log(`Recommending plan for organization: ${organizationId}`);
    return [];
  }

  /**
   * Update organization limits based on selected plan
   * 
   * @param organizationId - Organization ID
   * @param planTier - Selected plan tier
   */
  async selectPlan(organizationId: string, planTier: string): Promise<void> {
    // TODO: Implement selectPlan logic
    // This will be implemented in task 6.1
    this.logger.log(`Selecting plan ${planTier} for organization: ${organizationId}`);
  }

  /**
   * Calculate recommendation score for a specific plan
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   */
  private calculatePlanScore(data: any, plan: any): number {
    // TODO: Implement scoring logic
    // This will be implemented in task 5.3
    return 0;
  }

  /**
   * Generate reasoning for plan recommendation
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Array of reason strings
   */
  private generateRecommendationReason(data: any, plan: any): string[] {
    // TODO: Implement reason generation logic
    // This will be implemented in task 5.4
    return [];
  }
}
