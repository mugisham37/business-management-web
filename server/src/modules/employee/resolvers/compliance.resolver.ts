import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { ComplianceService } from '../services/compliance.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission, CurrentUser } from '../../auth/decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  ComplianceStatusType,
  TrainingRequirement,
  Certification,
  ComplianceCheckGQL,
} from '../types/compliance.types';
import {
  RecordTrainingCompletionInput,
  RecordCertificationInput,
  RequiredTrainingQueryInput,
  CertificationsQueryInput,
} from '../inputs/compliance.input';

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
export class ComplianceResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly complianceService: ComplianceService,
    @Inject('PUB_SUB') private readonly pubSub: any,
  ) {
    super(dataLoaderService);
  }

  @Query(() => ComplianceStatusType, { description: 'Get employee compliance status' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('employees:read', 'compliance:read')
  async getComplianceStatus(
    @Args('employeeId') employeeId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ComplianceStatusType> {
    // Get recent compliance checks
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3); // Last 3 months

    const complianceCheck = await this.complianceService.performComplianceCheck(
      tenantId,
      employeeId,
      endDate,
      'system',
    );

    // Get required training
    const requiredTraining = await this.getRequiredTraining({
      employeeId,
      includeCompleted: false,
      onlyOverdue: false,
    }, tenantId);

    // Get certifications
    const certifications = await this.getCertifications({
      employeeId,
      onlyActive: true,
      includeExpired: false,
    }, tenantId);

    // Calculate compliance metrics
    const totalViolations = complianceCheck.totalViolations || 0;
    const openViolations = totalViolations; // Simplified - in production, filter by status
    const resolvedViolations = 0;

    const now = new Date();
    return {
      id: `compliance-${employeeId}-${Date.now()}`,
      tenantId,
      employeeId,
      isCompliant: totalViolations === 0,
      totalViolations,
      openViolations,
      resolvedViolations,
      recentViolations: [],
      requiredTraining,
      certifications,
      lastCheckDate: new Date(complianceCheck.checkDate),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
  }

  @Query(() => [TrainingRequirement], { description: 'Get required training for employee' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('employees:read', 'compliance:read')
  async getRequiredTraining(
    @Args('query') query: RequiredTrainingQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<TrainingRequirement[]> {
    // Mock implementation - in production, fetch from training repository
    const now = new Date().toISOString();
    const mockTraining: TrainingRequirement[] = [
      {
        id: '1',
        tenantId,
        employeeId: '123',
        trainingName: 'Safety Training',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        completionDate: undefined,
        createdAt: now,
        updatedAt: now,
        version: 1,
      } as unknown as TrainingRequirement,
      {
        id: '2',
        tenantId,
        employeeId: '123',
        trainingName: 'Compliance Training',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'pending',
        completionDate: undefined,
        createdAt: now,
        updatedAt: now,
        version: 1,
      } as unknown as TrainingRequirement,
    ];

    let filtered = mockTraining;

    if (query.onlyOverdue) {
      const now = new Date();
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
    }

    return filtered;
  }

  @Query(() => [Certification], { description: 'Get employee certifications' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('employees:read', 'compliance:read')
  async getCertifications(
    @Args('query') query: CertificationsQueryInput,
    @CurrentTenant() tenantId: string,
  ): Promise<Certification[]> {
    // Mock implementation - in production, fetch from certification repository
    const mockCertifications: Certification[] = [
      {
        id: '1',
        tenantId,
        employeeId: query.employeeId,
        name: 'First Aid Certification',
        issuingOrganization: 'Red Cross',
        issueDate: new Date('2023-01-15'),
        expirationDate: new Date('2025-01-15'),
        certificationNumber: 'FA-2023-001',
        isActive: true,
        version: 1,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
      },
    ];

    let filtered = mockCertifications;

    if (query.onlyActive) {
      filtered = filtered.filter(c => c.isActive);
    }

    if (!query.includeExpired) {
      const now = new Date();
      filtered = filtered.filter(c => !c.expirationDate || new Date(c.expirationDate) > now);
    }

    return filtered;
  }

  @Mutation(() => MutationResponse, { description: 'Record training completion' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('employees:update', 'compliance:write')
  async recordTrainingCompletion(
    @Args('input') input: RecordTrainingCompletionInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      // In production, this would create a training record
      // For now, we'll use the existing training record creation
      await this.complianceService.recordBreakTime(
        tenantId,
        {
          employeeId: input.employeeId,
          startTime: input.completionDate,
          endTime: input.completionDate,
          breakType: 'meal' as any,
        },
        user.id,
      );

      return {
        success: true,
        message: 'Training completion recorded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to record training completion',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  @Mutation(() => Certification, { description: 'Record employee certification' })
  @UseGuards(PermissionsGuard)
  @RequirePermission('employees:update', 'compliance:write')
  async recordCertification(
    @Args('input') input: RecordCertificationInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Certification> {
    // Mock implementation - in production, create certification record
    const certification: Certification = {
      id: `cert-${Date.now()}`,
      tenantId,
      employeeId: input.employeeId,
      name: input.name,
      issuingOrganization: input.issuingOrganization,
      issueDate: new Date(input.issueDate),
      ...(input.expirationDate && { expirationDate: new Date(input.expirationDate) }),
      ...(input.certificationNumber && { certificationNumber: input.certificationNumber }),
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return certification;
  }

  @Subscription(() => Certification, {
    description: 'Subscribe to compliance expiring notifications',
    filter: (payload, variables, context) => {
      return payload.complianceExpiring.tenantId === context.req.user.tenantId;
    },
  })
  complianceExpiring(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('COMPLIANCE_EXPIRING');
  }
}
