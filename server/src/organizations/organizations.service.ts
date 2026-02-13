import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new organization
   * Validates required fields and creates organization record
   * Requirements: 1.1, 1.8
   */
  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    // Validate required field
    if (!dto.businessName || dto.businessName.trim() === '') {
      throw new BadRequestException('businessName is required and cannot be empty');
    }

    // Create organization with provided data
    const organization = await this.prisma.organization.create({
      data: {
        businessName: dto.businessName,
        businessType: dto.businessType,
        employeeCount: dto.employeeCount,
        industry: dto.industry,
        country: dto.country,
        selectedModules: dto.selectedModules || [],
        primaryGoal: dto.primaryGoal,
        cloudProvider: dto.cloudProvider,
        region: dto.region,
        storageVolume: dto.storageVolume,
        compression: dto.compression ?? false,
        activeHours: dto.activeHours,
        integrations: dto.integrations || [],
        selectedPlan: dto.selectedPlan,
        billingCycle: dto.billingCycle,
      },
    });

    return organization;
  }

  /**
   * Get organization by ID
   * Requirements: 1.1
   */
  async getOrganization(organizationId: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    return organization;
  }

  /**
   * Update organization
   * Validates required fields if provided
   * Requirements: 1.8
   */
  async updateOrganization(
    organizationId: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    // Check if organization exists
    await this.getOrganization(organizationId);

    // Validate businessName if provided
    if (dto.businessName !== undefined && dto.businessName.trim() === '') {
      throw new BadRequestException('businessName cannot be empty');
    }

    // Update organization
    const organization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.businessName !== undefined && { businessName: dto.businessName }),
        ...(dto.businessType !== undefined && { businessType: dto.businessType }),
        ...(dto.employeeCount !== undefined && { employeeCount: dto.employeeCount }),
        ...(dto.industry !== undefined && { industry: dto.industry }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.selectedModules !== undefined && { selectedModules: dto.selectedModules }),
        ...(dto.primaryGoal !== undefined && { primaryGoal: dto.primaryGoal }),
        ...(dto.cloudProvider !== undefined && { cloudProvider: dto.cloudProvider }),
        ...(dto.region !== undefined && { region: dto.region }),
        ...(dto.storageVolume !== undefined && { storageVolume: dto.storageVolume }),
        ...(dto.compression !== undefined && { compression: dto.compression }),
        ...(dto.activeHours !== undefined && { activeHours: dto.activeHours }),
        ...(dto.integrations !== undefined && { integrations: dto.integrations }),
        ...(dto.selectedPlan !== undefined && { selectedPlan: dto.selectedPlan }),
        ...(dto.billingCycle !== undefined && { billingCycle: dto.billingCycle }),
      },
    });

    return organization;
  }
}
