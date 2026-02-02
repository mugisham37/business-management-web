import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { GraphQLJSON } from 'graphql-scalars';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../decorators/current-tenant.decorator';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { CacheInterceptor } from '../../../common/interceptors';
import { SecurityOrchestratorService } from '../services/security-orchestrator.service';
import {
  SAMLConfiguration,
  LDAPConfiguration,
  OAuth2Configuration,
  SSOSession,
} from '../types/advanced-security.types';
import {
  ConfigureSAMLInput,
  ConfigureLDAPInput,
  ConfigureOAuth2Input,
  ManageSSOSessionInput,
} from '../inputs/advanced-security.input';
import {
  AuditRequired,
  ThreatAnalysis,
  EncryptionRequired,
  SecurityLevel,
  RateLimitSecurity,
} from '../decorators/advanced-security.decorator';

/**
 * GraphQL resolver for enterprise authentication
 * Provides SAML, LDAP, and OAuth2 configuration and management
 */
@Resolver(() => SAMLConfiguration)
@UseGuards(JwtAuthGuard)
export class EnterpriseAuthResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly securityOrchestrator: SecurityOrchestratorService,
  ) {
    super(dataLoaderService);
  }

  // ============================================================================
  // SAML OPERATIONS
  // ============================================================================

  /**
   * Get SAML configuration for tenant
   */
  @Query(() => SAMLConfiguration, { name: 'samlConfiguration', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  @UseInterceptors(CacheInterceptor)
  async getSAMLConfiguration(
    @CurrentTenant() tenantId: string,
  ): Promise<SAMLConfiguration | null> {
    try {
      return await this.securityOrchestrator.getSAMLConfiguration(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get SAML configuration');
      throw error;
    }
  }

  /**
   * Configure SAML authentication
   */
  @Mutation(() => SAMLConfiguration, { name: 'configureSAML' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('saml_configured', 'security')
  @ThreatAnalysis('high')
  @EncryptionRequired()
  @SecurityLevel('high')
  @RateLimitSecurity(5, 300000) // 5 requests per 5 minutes
  async configureSAML(
    @Args('input') input: ConfigureSAMLInput,
    @CurrentUser() user: any,
  ): Promise<SAMLConfiguration> {
    try {
      return await this.securityOrchestrator.configureSAML(input, user.id);
    } catch (error) {
      this.handleError(error, 'Failed to configure SAML');
      throw error;
    }
  }

  /**
   * Test SAML configuration
   */
  @Mutation(() => Boolean, { name: 'testSAMLConfiguration' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('saml_test', 'security')
  @ThreatAnalysis('medium')
  async testSAMLConfiguration(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.testSAMLConfiguration(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to test SAML configuration');
      throw error;
    }
  }

  // ============================================================================
  // LDAP OPERATIONS
  // ============================================================================

  /**
   * Get LDAP configuration for tenant
   */
  @Query(() => LDAPConfiguration, { name: 'ldapConfiguration', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  @UseInterceptors(CacheInterceptor)
  async getLDAPConfiguration(
    @CurrentTenant() tenantId: string,
  ): Promise<LDAPConfiguration | null> {
    try {
      return await this.securityOrchestrator.getLDAPConfiguration(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get LDAP configuration');
      throw error;
    }
  }

  /**
   * Configure LDAP authentication
   */
  @Mutation(() => LDAPConfiguration, { name: 'configureLDAP' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('ldap_configured', 'security')
  @ThreatAnalysis('high')
  @EncryptionRequired()
  @SecurityLevel('high')
  @RateLimitSecurity(5, 300000)
  async configureLDAP(
    @Args('input') input: ConfigureLDAPInput,
    @CurrentUser() user: any,
  ): Promise<LDAPConfiguration> {
    try {
      return await this.securityOrchestrator.configureLDAP(input, user.id);
    } catch (error) {
      this.handleError(error, 'Failed to configure LDAP');
      throw error;
    }
  }

  /**
   * Test LDAP connection
   */
  @Mutation(() => Boolean, { name: 'testLDAPConnection' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('ldap_test', 'security')
  @ThreatAnalysis('medium')
  async testLDAPConnection(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.testLDAPConnection(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to test LDAP connection');
      throw error;
    }
  }

  // ============================================================================
  // OAUTH2 OPERATIONS
  // ============================================================================

  /**
   * Get OAuth2 configuration for tenant
   */
  @Query(() => OAuth2Configuration, { name: 'oauth2Configuration', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  @UseInterceptors(CacheInterceptor)
  async getOAuth2Configuration(
    @CurrentTenant() tenantId: string,
  ): Promise<OAuth2Configuration | null> {
    try {
      return await this.securityOrchestrator.getOAuth2Configuration(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get OAuth2 configuration');
      throw error;
    }
  }

  /**
   * Configure OAuth2 authentication
   */
  @Mutation(() => OAuth2Configuration, { name: 'configureOAuth2' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('oauth2_configured', 'security')
  @ThreatAnalysis('high')
  @EncryptionRequired()
  @SecurityLevel('high')
  @RateLimitSecurity(5, 300000)
  async configureOAuth2(
    @Args('input') input: ConfigureOAuth2Input,
    @CurrentUser() user: any,
  ): Promise<OAuth2Configuration> {
    try {
      return await this.securityOrchestrator.configureOAuth2(input, user.id);
    } catch (error) {
      this.handleError(error, 'Failed to configure OAuth2');
      throw error;
    }
  }

  // ============================================================================
  // SSO SESSION MANAGEMENT
  // ============================================================================

  /**
   * Get active SSO sessions
   */
  @Query(() => [SSOSession], { name: 'activeSSOSessions' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  @UseInterceptors(CacheInterceptor)
  async getActiveSSOSessions(
    @CurrentTenant() tenantId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<SSOSession[]> {
    try {
      return await this.securityOrchestrator.getActiveSSOSessions(tenantId, limit);
    } catch (error) {
      this.handleError(error, 'Failed to get active SSO sessions');
      throw error;
    }
  }

  /**
   * Manage SSO session (revoke, extend, etc.)
   */
  @Mutation(() => Boolean, { name: 'manageSSOSession' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('sso_session_managed', 'security')
  @ThreatAnalysis('medium')
  async manageSSOSession(
    @Args('input') input: ManageSSOSessionInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.securityOrchestrator.manageSSOSession(
        input.sessionId,
        input.action,
        input.reason,
        user.id,
      );
    } catch (error) {
      this.handleError(error, 'Failed to manage SSO session');
      throw error;
    }
  }

  /**
   * Revoke all SSO sessions for tenant
   */
  @Mutation(() => Number, { name: 'revokeAllSSOSessions' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:admin')
  @AuditRequired('all_sso_sessions_revoked', 'security')
  @ThreatAnalysis('critical')
  @SecurityLevel('critical')
  async revokeAllSSOSessions(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<number> {
    try {
      return await this.securityOrchestrator.revokeAllSSOSessions(tenantId, reason, user.id);
    } catch (error) {
      this.handleError(error, 'Failed to revoke all SSO sessions');
      throw error;
    }
  }

  /**
   * Get SSO session by ID
   */
  @Query(() => SSOSession, { name: 'ssoSession', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  async getSSOSession(
    @Args('sessionId') sessionId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<SSOSession | null> {
    try {
      return await this.securityOrchestrator.getSSOSession(sessionId, tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get SSO session');
      throw error;
    }
  }

  /**
   * Get enterprise auth statistics
   */
  @Query(() => GraphQLJSON, { name: 'enterpriseAuthStats' })
  @UseGuards(PermissionsGuard)
  @Permissions('auth:read')
  @UseInterceptors(CacheInterceptor)
  async getEnterpriseAuthStats(
    @CurrentTenant() tenantId: string,
  ): Promise<any> {
    try {
      return await this.securityOrchestrator.getEnterpriseAuthStats(tenantId);
    } catch (error) {
      this.handleError(error, 'Failed to get enterprise auth statistics');
      throw error;
    }
  }
}