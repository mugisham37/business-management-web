import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { CacheInterceptor } from '../../../common/interceptors';
import { SecurityOrchestratorService } from '../services/security-orchestrator.service';
import {
  DataDeletionRequest,
  DeletionResult,
} from '../types/advanced-security.types';
import {
  ScheduleDataDeletionInput,
  CancelDataDeletionInput,
  DeletionHistoryFilterInput,
} from '../inputs/advanced-security.input';
import {
  AuditRequired,
  ThreatAnalysis,
  SecurityLevel,
  RateLimitSecurity,
  ComplianceCheck,
  EncryptionRequired,
} from '../decorators/advanced-security.decorator';

// Initialize PubSub for real-time updates
let pubSub: any;
try {
  const { RedisPubSub } = require('graphql-redis-subscriptions');
  pubSub = new RedisPubSub();
} catch {
  const { PubSub } = require('graphql-subscriptions');
  pubSub = new PubSub();
}

/**
 * GraphQL resolver for data deletion and GDPR compliance
 * Provides secure data deletion and retention management
 */
@Resolver(() => DataDeletionRequest)
@UseGuards(JwtAuthGuard)
export class DataDeletionResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly securityOrchestrator: SecurityOrchestratorService,
  ) {
    super(dataLoaderService);
  }

  // ============================================================================
  // DATA DELETION REQUESTS
  // ============================================================================

  /**
   * Get data deletion requests for tenant
   */
  @Query(() => [DataDeletionRequest], { name: 'dataDeletionRequests' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @UseInterceptors(CacheInterceptor)
  async getDataDeletionRequests(
    @CurrentTenant() tenantId: string,
    @Args('filter', { nullable: true }) filter?: DeletionHistoryFilterInput,
  ): Promise<DataDeletionRequest[]> {
    try {
      return await this.securityOrchestrator.getDataDeletionRequests(tenantId, filter);
    } catch (error) {
      this.handleError(error, 'Failed to get data deletion requests');
      throw error;
    }
  }

  /**
   * Get specific data deletion request
   */
  @Query(() => DataDeletionRequest, { name: 'dataDeletionRequest', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  async getDataDeletionRequest(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<DataDeletionRequest | null> {
    try {
      return await this.securityOrchestrator.getDataDeletionRequest(id, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get data deletion request');
      throw error;
    }
  }

  /**
   * Schedule data deletion
   */
  @Mutation(() => DataDeletionRequest, { name: 'scheduleDataDeletion' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:delete')
  @AuditRequired('data_deletion_scheduled', 'compliance')
  @ThreatAnalysis('high')
  @SecurityLevel('critical')
  @ComplianceCheck(['GDPR'])
  @EncryptionRequired()
  @RateLimitSecurity(20, 3600000) // 20 requests per hour
  async scheduleDataDeletion(
    @Args('input') input: ScheduleDataDeletionInput,
    @CurrentUser() user: any,
  ): Promise<DataDeletionRequest> {
    try {
      const request = await this.securityOrchestrator.scheduleDataDeletion(input, user.id);
      
      // Emit real-time update
      pubSub.publish('DATA_DELETION_SCHEDULED', {
        dataDeletionScheduled: request,
        tenantId: input.tenantId,
      });

      return request;
    } catch (error) {
      this.handleError(error, 'Failed to schedule data deletion');
      throw error;
    }
  }

  /**
   * Cancel data deletion request
   */
  @Mutation(() => Boolean, { name: 'cancelDataDeletion' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:delete')
  @AuditRequired('data_deletion_cancelled', 'compliance')
  @ThreatAnalysis('medium')
  @SecurityLevel('high')
  async cancelDataDeletion(
    @Args('input') input: CancelDataDeletionInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    try {
      const result = await this.securityOrchestrator.cancelDataDeletion(
        input.requestId,
        input.reason,
        user.id,
      );
      
      if (result) {
        pubSub.publish('DATA_DELETION_CANCELLED', {
          dataDeletionCancelled: { requestId: input.requestId, reason: input.reason },
          tenantId: input.tenantId,
        });
      }

      return result;
    } catch (error) {
      this.handleError(error, 'Failed to cancel data deletion');
      throw error;
    }
  }

  /**
   * Execute immediate data deletion (emergency)
   */
  @Mutation(() => DeletionResult, { name: 'executeImmediateDeletion' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:admin')
  @AuditRequired('immediate_deletion_executed', 'compliance')
  @ThreatAnalysis('critical')
  @SecurityLevel('critical')
  @ComplianceCheck(['GDPR'])
  @RateLimitSecurity(5, 3600000) // 5 requests per hour
  async executeImmediateDeletion(
    @Args('requestId') requestId: string,
    @Args('confirmationCode') confirmationCode: string,
    @Args('reason') reason: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DeletionResult> {
    try {
      const result = await this.securityOrchestrator.executeImmediateDeletion(
        requestId,
        confirmationCode,
        reason,
        user.id,
      );
      
      // Emit real-time update
      pubSub.publish('DATA_DELETION_EXECUTED', {
        dataDeletionExecuted: result,
        tenantId,
      });

      return result;
    } catch (error) {
      this.handleError(error, 'Failed to execute immediate deletion');
      throw error;
    }
  }

  // ============================================================================
  // DELETION HISTORY AND RESULTS
  // ============================================================================

  /**
   * Get deletion history
   */
  @Query(() => [DeletionResult], { name: 'deletionHistory' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @UseInterceptors(CacheInterceptor)
  async getDeletionHistory(
    @CurrentTenant() tenantId: string,
    @Args('filter', { nullable: true }) filter?: DeletionHistoryFilterInput,
  ): Promise<DeletionResult[]> {
    try {
      return await this.securityOrchestrator.getDeletionHistory(tenantId, filter);
    } catch (error) {
      this.handleError(error, 'Failed to get deletion history');
      throw error;
    }
  }

  /**
   * Get deletion result by ID
   */
  @Query(() => DeletionResult, { name: 'deletionResult', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  async getDeletionResult(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<DeletionResult | null> {
    try {
      return await this.securityOrchestrator.getDeletionResult(id, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get deletion result');
      throw error;
    }
  }

  /**
   * Verify deletion completion
   */
  @Query(() => Boolean, { name: 'verifyDeletionCompletion' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @AuditRequired('deletion_verification', 'compliance')
  async verifyDeletionCompletion(
    @Args('requestId') requestId: string,
    @Args('verificationHash') verificationHash: string,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.verifyDeletionCompletion(
        requestId,
        verificationHash,
        tenantId,
      );
    } catch (error) {
      this.handleError(error, 'Failed to verify deletion completion');
      throw error;
    }
  }

  // ============================================================================
  // GDPR COMPLIANCE
  // ============================================================================

  /**
   * Process GDPR data export request
   */
  @Mutation(() => Object, { name: 'processGDPRExport' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:export')
  @AuditRequired('gdpr_export_processed', 'compliance')
  @ComplianceCheck(['GDPR'])
  @EncryptionRequired()
  @RateLimitSecurity(10, 86400000) // 10 requests per day
  async processGDPRExport(
    @Args('userId') userId: string,
    @Args('includeMetadata', { nullable: true }) includeMetadata?: boolean,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.processGDPRExport(
        tenantId,
        userId,
        includeMetadata,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to process GDPR export');
      throw error;
    }
  }

  /**
   * Process GDPR deletion request (Right to be Forgotten)
   */
  @Mutation(() => DataDeletionRequest, { name: 'processGDPRDeletion' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:delete')
  @AuditRequired('gdpr_deletion_processed', 'compliance')
  @ThreatAnalysis('high')
  @SecurityLevel('critical')
  @ComplianceCheck(['GDPR'])
  @RateLimitSecurity(5, 86400000) // 5 requests per day
  async processGDPRDeletion(
    @Args('userId') userId: string,
    @Args('reason', { nullable: true }) reason?: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DataDeletionRequest> {
    try {
      const request = await this.securityOrchestrator.processGDPRDeletion(
        tenantId,
        userId,
        reason,
        user.id,
      );
      
      // Emit real-time update
      pubSub.publish('GDPR_DELETION_PROCESSED', {
        gdprDeletionProcessed: request,
        tenantId,
      });

      return request;
    } catch (error) {
      this.handleError(error, 'Failed to process GDPR deletion');
      throw error;
    }
  }

  // ============================================================================
  // DATA RETENTION POLICIES
  // ============================================================================

  /**
   * Get data retention policies
   */
  @Query(() => [Object], { name: 'dataRetentionPolicies' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @UseInterceptors(CacheInterceptor)
  async getDataRetentionPolicies(
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    try {
      return await this.securityOrchestrator.getDataRetentionPolicies(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get data retention policies');
      throw error;
    }
  }

  /**
   * Update data retention policy
   */
  @Mutation(() => Object, { name: 'updateDataRetentionPolicy' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:admin')
  @AuditRequired('retention_policy_updated', 'compliance')
  @ThreatAnalysis('medium')
  @SecurityLevel('high')
  @ComplianceCheck()
  async updateDataRetentionPolicy(
    @Args('policyId') policyId: string,
    @Args('updates') updates: any,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.updateDataRetentionPolicy(
        policyId,
        updates,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to update data retention policy');
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS AND REPORTING
  // ============================================================================

  /**
   * Get data deletion statistics
   */
  @Query(() => Object, { name: 'dataDeletionStats' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @UseInterceptors(CacheInterceptor)
  async getDataDeletionStats(
    @CurrentTenant() tenantId: string,
    @Args('period', { nullable: true }) period?: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getDataDeletionStats(tenantId, period);
    } catch (error) {
      this.handleError(error, 'Failed to get data deletion statistics');
      throw error;
    }
  }

  /**
   * Generate compliance deletion report
   */
  @Query(() => Object, { name: 'complianceDeletionReport' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  @AuditRequired('compliance_report_generated', 'compliance')
  @ComplianceCheck()
  async generateComplianceDeletionReport(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @Args('framework', { nullable: true }) framework?: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.generateComplianceDeletionReport(
        tenantId,
        startDate,
        endDate,
        framework,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to generate compliance deletion report');
      throw error;
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to data deletion status updates
   */
  @Subscription(() => DataDeletionRequest, { name: 'dataDeletionStatusUpdated' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  async dataDeletionStatusUpdated(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('DATA_DELETION_STATUS_UPDATED');
  }

  /**
   * Subscribe to deletion completion notifications
   */
  @Subscription(() => DeletionResult, { name: 'dataDeletionCompleted' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  async dataDeletionCompleted(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('DATA_DELETION_COMPLETED');
  }

  /**
   * Subscribe to GDPR request notifications
   */
  @Subscription(() => Object, { name: 'gdprRequestReceived' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:read')
  async gdprRequestReceived(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('GDPR_REQUEST_RECEIVED');
  }

  // ============================================================================
  // EMERGENCY OPERATIONS
  // ============================================================================

  /**
   * Emergency data wipe (requires multiple confirmations)
   */
  @Mutation(() => Boolean, { name: 'emergencyDataWipe' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:emergency')
  @AuditRequired('emergency_data_wipe', 'security')
  @ThreatAnalysis('critical')
  @SecurityLevel('critical')
  @RateLimitSecurity(1, 86400000) // 1 request per day
  async emergencyDataWipe(
    @Args('confirmationCode1') confirmationCode1: string,
    @Args('confirmationCode2') confirmationCode2: string,
    @Args('reason') reason: string,
    @Args('dataTypes', { type: () => [String] }) dataTypes: string[],
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.emergencyDataWipe(
        tenantId,
        confirmationCode1,
        confirmationCode2,
        reason,
        dataTypes,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to execute emergency data wipe');
      throw error;
    }
  }

  /**
   * Get emergency wipe status
   */
  @Query(() => Object, { name: 'emergencyWipeStatus' })
  @UseGuards(PermissionsGuard)
  @Permissions('data:emergency')
  async getEmergencyWipeStatus(
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getEmergencyWipeStatus(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get emergency wipe status');
      throw error;
    }
  }
}