import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../../tenant/interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';

import { IntegrationService } from '../services/integration.service';
import { ConnectorService } from '../services/connector.service';
import { WebhookService } from '../services/webhook.service';

import { IntegrationType, IntegrationHealth, IntegrationStatistics } from '../types/integration.graphql.types';
import { CreateIntegrationInput, UpdateIntegrationInput, IntegrationFilterInput } from '../inputs/integration.input';
import { ConnectorType } from '../types/connector.graphql.types';
import { WebhookType } from '../types/webhook.graphql.types';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

@Resolver(() => IntegrationType)
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class IntegrationResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly integrationService: IntegrationService,
    private readonly connectorService: ConnectorService,
    private readonly webhookService: WebhookService,
  ) {
    super(dataLoaderService);
  }

  @Query(() => IntegrationType, { name: 'integration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType> {
    return this.integrationService.findById(tenantId, id);
  }

  @Query(() => [IntegrationType], { name: 'integrations' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegrations(
    @Args('filter', { type: () => IntegrationFilterInput, nullable: true }) filter: IntegrationFilterInput,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType[]> {
    return this.integrationService.findAll(tenantId, filter);
  }

  @Mutation(() => IntegrationType, { name: 'createIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:create')
  async createIntegration(
    @Args('input') input: CreateIntegrationInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType> {
    return this.integrationService.create(tenantId, input as any, user.id);
  }

  @Mutation(() => IntegrationType, { name: 'updateIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async updateIntegration(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateIntegrationInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType> {
    return this.integrationService.update(tenantId, id, input as any, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:delete')
  async deleteIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.integrationService.delete(tenantId, id, user.id);
    return true;
  }

  @Mutation(() => Boolean, { name: 'testIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:test')
  async testIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.integrationService.testConnection(tenantId, id);
  }

  @Mutation(() => IntegrationType, { name: 'enableIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async enableIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType> {
    const { IntegrationStatus } = await import('../entities/integration.entity');
    return this.integrationService.updateStatus(tenantId, id, IntegrationStatus.ACTIVE, user.id);
  }

  @Mutation(() => IntegrationType, { name: 'disableIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async disableIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationType> {
    const { IntegrationStatus } = await import('../entities/integration.entity');
    return this.integrationService.updateStatus(tenantId, id, IntegrationStatus.INACTIVE, user.id);
  }

  @Query(() => IntegrationHealth, { name: 'integrationHealth' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegrationHealth(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationHealth> {
    const integration = await this.integrationService.findById(tenantId, id);
    return {
      integrationId: integration.id,
      isHealthy: integration.healthStatus === 'healthy',
      lastChecked: integration.lastHealthCheck || new Date(),
      details: integration.healthStatus,
      error: integration.lastError,
    };
  }

  @Query(() => IntegrationStatistics, { name: 'integrationStatistics' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegrationStatistics(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationStatistics> {
    const stats = await this.integrationService.getStatistics(tenantId, id);
    return {
      integrationId: id,
      totalRequests: stats.integration.requestCount,
      successfulRequests: stats.integration.requestCount - stats.integration.errorCount,
      failedRequests: stats.integration.errorCount,
      successRate: stats.integration.requestCount > 0 
        ? ((stats.integration.requestCount - stats.integration.errorCount) / stats.integration.requestCount) * 100 
        : 100,
      uptime: 95, // Placeholder - would calculate from health history
      timestamp: new Date(),
    };
  }

  @Mutation(() => String, { name: 'triggerIntegrationSync' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:sync')
  async triggerSync(
    @Args('id', { type: () => ID }) id: string,
    @Args('syncType', { type: () => String, defaultValue: 'incremental' }) syncType: 'full' | 'incremental',
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    return this.integrationService.triggerSync(tenantId, id, syncType);
  }

  @ResolveField(() => ConnectorType, { nullable: true })
  async connector(
    @Parent() integration: IntegrationType,
  ): Promise<ConnectorType | null> {
    if (!integration.providerName) {
      return null;
    }
    
    const { IntegrationType: IntegrationTypeEnum } = await import('../entities/integration.entity');
    const connector = await this.connectorService.getConnector(
      integration.type as any,
      integration.providerName,
    );
    
    if (!connector) {
      return null;
    }

    const metadata = connector.getMetadata();
    return {
      id: metadata.name,
      name: metadata.name,
      displayName: metadata.displayName,
      description: metadata.description,
      type: metadata.type,
      version: metadata.version,
      capabilities: metadata.capabilities,
      supportedEvents: metadata.supportedEvents,
      supportedOperations: metadata.supportedOperations,
      isActive: true,
      isOfficial: metadata.isOfficial || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  @ResolveField(() => [WebhookType])
  async webhooks(
    @Parent() integration: IntegrationType,
  ): Promise<WebhookType[]> {
    const loader = this.dataLoaderService.getLoader(
      'webhooks_by_integration',
      async (integrationIds: readonly string[]) => {
        const webhooks = await this.webhookService.findByIntegrationIds([...integrationIds]);
        const webhookMap = new Map<string, any[]>();
        
        webhooks.forEach(webhook => {
          if (!webhookMap.has(webhook.integrationId)) {
            webhookMap.set(webhook.integrationId, []);
          }
          webhookMap.get(webhook.integrationId)!.push(webhook);
        });

        return integrationIds.map(id => webhookMap.get(id) || []);
      },
    );

    return loader.load(integration.id);
  }
}
