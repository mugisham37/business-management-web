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
  PenetrationTest,
  PenetrationTestFinding,
  VulnerabilityReport,
} from '../types/advanced-security.types';
import {
  InitiatePenetrationTestInput,
  PenetrationTestFilterInput,
  VulnerabilityFilterInput,
} from '../inputs/advanced-security.input';
import {
  AuditRequired,
  ThreatAnalysis,
  SecurityLevel,
  RateLimitSecurity,
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
 * GraphQL resolver for penetration testing
 * Provides vulnerability testing and security assessment capabilities
 */
@Resolver(() => PenetrationTest)
@UseGuards(JwtAuthGuard)
export class PenetrationTestingResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly securityOrchestrator: SecurityOrchestratorService,
  ) {
    super(dataLoaderService);
  }

  // ============================================================================
  // PENETRATION TEST OPERATIONS
  // ============================================================================

  /**
   * Get all penetration tests for tenant
   */
  @Query(() => [PenetrationTest], { name: 'penetrationTests' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getPenetrationTests(
    @CurrentTenant() tenantId: string,
    @Args('filter', { nullable: true }) filter?: PenetrationTestFilterInput,
  ): Promise<PenetrationTest[]> {
    try {
      return await this.securityOrchestrator.getPenetrationTests(tenantId, filter);
    } catch (error) {
      this.handleError(error, 'Failed to get penetration tests');
      throw error;
    }
  }

  /**
   * Get specific penetration test by ID
   */
  @Query(() => PenetrationTest, { name: 'penetrationTest', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  async getPenetrationTest(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<PenetrationTest | null> {
    try {
      return await this.securityOrchestrator.getPenetrationTest(id, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get penetration test');
      throw error;
    }
  }

  /**
   * Initiate new penetration test
   */
  @Mutation(() => PenetrationTest, { name: 'initiatePenetrationTest' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:admin')
  @AuditRequired('penetration_test_initiated', 'security')
  @ThreatAnalysis('medium')
  @SecurityLevel('high')
  @RateLimitSecurity(10, 3600000) // 10 tests per hour
  async initiatePenetrationTest(
    @Args('input') input: InitiatePenetrationTestInput,
    @CurrentUser() user: any,
  ): Promise<PenetrationTest> {
    try {
      const test = await this.securityOrchestrator.initiatePenetrationTest(input, user.id);
      
      // Emit real-time update
      pubSub.publish('PENETRATION_TEST_INITIATED', {
        penetrationTestInitiated: test,
        tenantId: input.tenantId,
      });

      return test;
    } catch (error) {
      this.handleError(error, 'Failed to initiate penetration test');
      throw error;
    }
  }

  /**
   * Cancel penetration test
   */
  @Mutation(() => Boolean, { name: 'cancelPenetrationTest' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:admin')
  @AuditRequired('penetration_test_cancelled', 'security')
  @ThreatAnalysis('low')
  async cancelPenetrationTest(
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason?: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      const result = await this.securityOrchestrator.cancelPenetrationTest(id, reason, user.id);
      
      if (result) {
        pubSub.publish('PENETRATION_TEST_CANCELLED', {
          penetrationTestCancelled: { id, reason },
          tenantId,
        });
      }

      return result;
    } catch (error) {
      this.handleError(error, 'Failed to cancel penetration test');
      throw error;
    }
  }

  /**
   * Get penetration test results
   */
  @Query(() => Object, { name: 'penetrationTestResults' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getPenetrationTestResults(
    @Args('testId') testId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getPenetrationTestResults(testId, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get penetration test results');
      throw error;
    }
  }

  // ============================================================================
  // VULNERABILITY OPERATIONS
  // ============================================================================

  /**
   * Get vulnerabilities found in tests
   */
  @Query(() => [PenetrationTestFinding], { name: 'vulnerabilities' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getVulnerabilities(
    @CurrentTenant() tenantId: string,
    @Args('filter', { nullable: true }) filter?: VulnerabilityFilterInput,
  ): Promise<PenetrationTestFinding[]> {
    try {
      return await this.securityOrchestrator.getVulnerabilities(tenantId, filter);
    } catch (error) {
      this.handleError(error, 'Failed to get vulnerabilities');
      throw error;
    }
  }

  /**
   * Get vulnerability by ID
   */
  @Query(() => PenetrationTestFinding, { name: 'vulnerability', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  async getVulnerability(
    @Args('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<PenetrationTestFinding | null> {
    try {
      return await this.securityOrchestrator.getVulnerability(id, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get vulnerability');
      throw error;
    }
  }

  /**
   * Update vulnerability status
   */
  @Mutation(() => PenetrationTestFinding, { name: 'updateVulnerabilityStatus' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:admin')
  @AuditRequired('vulnerability_status_updated', 'security')
  async updateVulnerabilityStatus(
    @Args('id') id: string,
    @Args('status') status: string,
    @Args('notes', { nullable: true }) notes?: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<PenetrationTestFinding> {
    try {
      return await this.securityOrchestrator.updateVulnerabilityStatus(
        id,
        status,
        notes,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to update vulnerability status');
      throw error;
    }
  }

  // ============================================================================
  // VULNERABILITY REPORTS
  // ============================================================================

  /**
   * Generate vulnerability report
   */
  @Mutation(() => VulnerabilityReport, { name: 'generateVulnerabilityReport' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @AuditRequired('vulnerability_report_generated', 'security')
  @RateLimitSecurity(5, 3600000) // 5 reports per hour
  async generateVulnerabilityReport(
    @Args('testId', { nullable: true }) testId?: string,
    @Args('includeResolved', { nullable: true }) includeResolved?: boolean,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<VulnerabilityReport> {
    try {
      return await this.securityOrchestrator.generateVulnerabilityReport(
        tenantId,
        testId,
        includeResolved,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to generate vulnerability report');
      throw error;
    }
  }

  /**
   * Get vulnerability reports
   */
  @Query(() => [VulnerabilityReport], { name: 'vulnerabilityReports' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getVulnerabilityReports(
    @CurrentTenant() tenantId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<VulnerabilityReport[]> {
    try {
      return await this.securityOrchestrator.getVulnerabilityReports(tenantId, limit);
    } catch (error) {
      this.handleError(error, 'Failed to get vulnerability reports');
      throw error;
    }
  }

  // ============================================================================
  // SECURITY TESTING STATISTICS
  // ============================================================================

  /**
   * Get penetration testing statistics
   */
  @Query(() => Object, { name: 'penetrationTestingStats' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getPenetrationTestingStats(
    @CurrentTenant() tenantId: string,
    @Args('period', { nullable: true }) period?: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getPenetrationTestingStats(tenantId, period);
    } catch (error) {
      this.handleError(error, 'Failed to get penetration testing statistics');
      throw error;
    }
  }

  /**
   * Get vulnerability trends
   */
  @Query(() => Object, { name: 'vulnerabilityTrends' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getVulnerabilityTrends(
    @CurrentTenant() tenantId: string,
    @Args('timeframe', { nullable: true }) timeframe?: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getVulnerabilityTrends(tenantId, timeframe);
    } catch (error) {
      this.handleError(error, 'Failed to get vulnerability trends');
      throw error;
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to penetration test status updates
   */
  @Subscription(() => PenetrationTest, { name: 'penetrationTestStatusUpdated' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  async penetrationTestStatusUpdated(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('PENETRATION_TEST_STATUS_UPDATED');
  }

  /**
   * Subscribe to new vulnerability discoveries
   */
  @Subscription(() => PenetrationTestFinding, { name: 'vulnerabilityDiscovered' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  async vulnerabilityDiscovered(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('VULNERABILITY_DISCOVERED');
  }

  /**
   * Subscribe to penetration test completion
   */
  @Subscription(() => PenetrationTest, { name: 'penetrationTestCompleted' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  async penetrationTestCompleted(
    @CurrentTenant() tenantId: string,
  ) {
    return pubSub.asyncIterator('PENETRATION_TEST_COMPLETED');
  }

  // ============================================================================
  // AUTOMATED TESTING
  // ============================================================================

  /**
   * Schedule automated penetration test
   */
  @Mutation(() => Boolean, { name: 'scheduleAutomatedTest' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:admin')
  @AuditRequired('automated_test_scheduled', 'security')
  @SecurityLevel('high')
  async scheduleAutomatedTest(
    @Args('testType') testType: string,
    @Args('cronExpression') cronExpression: string,
    @Args('enabled', { nullable: true }) enabled?: boolean,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.scheduleAutomatedTest(
        tenantId,
        testType,
        cronExpression,
        enabled,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to schedule automated test');
      throw error;
    }
  }

  /**
   * Get scheduled automated tests
   */
  @Query(() => [Object], { name: 'scheduledAutomatedTests' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:read')
  @UseInterceptors(CacheInterceptor)
  async getScheduledAutomatedTests(
    @CurrentTenant() tenantId: string,
  ): Promise<any[]> {
    try {
      return await this.securityOrchestrator.getScheduledAutomatedTests(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get scheduled automated tests');
      throw error;
    }
  }

  /**
   * Disable automated test
   */
  @Mutation(() => Boolean, { name: 'disableAutomatedTest' })
  @UseGuards(PermissionsGuard)
  @Permissions('pentest:admin')
  @AuditRequired('automated_test_disabled', 'security')
  async disableAutomatedTest(
    @Args('scheduleId') scheduleId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.disableAutomatedTest(scheduleId, user.id);
    } catch (error) {
      this.handleError(error, 'Failed to disable automated test');
      throw error;
    }
  }
}