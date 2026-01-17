import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
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
import { SyncService } from '../services/sync.service';
import { ApiKeyService } from '../services/api-key.service';

import { Integration, IntegrationHealth, IntegrationStatistics } from '../types/integration.graphql.types';
import { CreateIntegrationInput, UpdateIntegrationInput, IntegrationFilterInput, TriggerSyncInput } from '../inputs/integration.input';
import { ConnectorType } from '../types/connector.graphql.types';
import { WebhookType } from '../types/webhook.graphql.types';
import { SyncLogType, SyncStatisticsType } from '../types/sync.graphql.types';
import { APIKeyType } from '../types/developer-portal.graphql.types';
import { RateLimitInfoType } from '../types/rate-limit.graphql.types';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { PaginationArgs } from '../../../common/graphql/pagination.args';

@Resolver(() => Integration)
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class IntegrationResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly integrationService: IntegrationService,
    private readonly connectorService: ConnectorService,
    private readonly webhookService: WebhookService,
    private readonly syncService: SyncService,
    private readonly apiKeyService: ApiKeyService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Integration, { name: 'integration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration> {
    return this.integrationService.findById(tenantId, id);
  }

  @Query(() => [Integration], { name: 'integrations' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegrations(
    @Args('filter', { type: () => IntegrationFilterInput, nullable: true }) filter: IntegrationFilterInput,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration[]> {
    return this.integrationService.findAll(tenantId, filter);
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
      integrationId: id,
      isHealthy: integration.healthStatus === 'healthy',
      lastChecked: integration.lastHealthCheck || new Date(),
      details: integration.healthStatus,
      error: integration.lastError,
      responseTime: 0,
    };
  }

  @Query(() => IntegrationStatistics, { name: 'integrationStatistics' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getIntegrationStatistics(
    @Args('id', { type: () => ID }) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<IntegrationStatistics> {
    return this.integrationService.getStatistics(id);
  }

  @Mutation(() => Integration, { name: 'createIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:create')
  async createIntegration(
    @Args('input') input: CreateIntegrationInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration> {
    return this.integrationService.create(tenantId, input as any, user.id);
  }

  @Mutation(() => Integration, { name: 'updateIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async updateIntegration(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateIntegrationInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration> {
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
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    const result = await this.integrationService.testConnection(tenantId, id);
    return result.success;
  }

  @Mutation(() => Integration, { name: 'enableIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async enableIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration> {
    return this.integrationService.updateStatus(tenantId, id, 'active', user.id);
  }

  @Mutation(() => Integration, { name: 'disableIntegration' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async disableIntegration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<Integration> {
    return this.integrationService.updateStatus(tenantId, id, 'inactive', user.id);
  }

  @Mutation(() => SyncLogType, { name: 'triggerIntegrationSync' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:sync')
  async triggerIntegrationSync(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => TriggerSyncInput, nullable: true }) input: TriggerSyncInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncLogType> {
    return this.integrationService.triggerSync(tenantId, id, input || {});
  }

  // Subscriptions
  @Subscription(() => Integration, {
    name: 'integrationStatusChanged',
    filter: (payload, variables) => {
      return payload.tenantId === variables.tenantId && 
             (!variables.integrationId || payload.integrationId === variables.integrationId);
    },
  })
  integrationStatusChanged(
    @Args('tenantId') tenantId: string,
    @Args('integrationId', { nullable: true }) integrationId?: string,
  ) {
    return this.pubSub.asyncIterator('INTEGRATION_STATUS_CHANGED');
  }

  @Subscription(() => IntegrationHealth, {
    name: 'integrationHealthChanged',
    filter: (payload, variables) => {
      return payload.tenantId === variables.tenantId && 
             (!variables.integrationId || payload.integrationId === variables.integrationId);
    },
  })
  integrationHealthChanged(
    @Args('tenantId') tenantId: string,
    @Args('integrationId', { nullable: true }) integrationId?: string,
  ) {
    return this.pubSub.asyncIterator('INTEGRATION_HEALTH_CHANGED');
  }

  // Field Resolvers
  @ResolveField(() => ConnectorType, { nullable: true })
  async connector(@Parent() integration: Integration): Promise<ConnectorType | null> {
    if (!integration.providerName) return null;
    
    const connector = await this.connectorService.getConnector(
      integration.type as any,
      integration.providerName,
    );
    
    if (!connector) return null;
    
    const metadata = connector.getMetadata();
    return {
      id: `${integration.type}_${integration.providerName}`,
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
    };
  }

  @ResolveField(() => [WebhookType])
  async webhooks(@Parent() integration: Integration): Promise<WebhookType[]> {
    return this.dataLoaderService.getLoader('webhooks_by_integration').load(integration.id);
  }

  @ResolveField(() => [SyncLogType])
  async syncLogs(
    @Parent() integration: Integration,
    @Args('limit', { defaultValue: 10 }) limit: number,
  ): Promise<SyncLogType[]> {
    return this.syncService.getSyncHistory(integration.id, {}, { limit, offset: 0 });
  }

  @ResolveField(() => SyncStatisticsType, { nullable: true })
  async syncStatistics(@Parent() integration: Integration): Promise<SyncStatisticsType | null> {
    if (!integration.syncEnabled) return null;
    return this.syncService.getStatistics(integration.id);
  }

  @ResolveField(() => [APIKeyType])
  async apiKeys(@Parent() integration: Integration): Promise<APIKeyType[]> {
    return this.dataLoaderService.getLoader('api_keys_by_integration').load(integration.id);
  }

  @ResolveField(() => SyncLogType, { nullable: true })
  async lastSync(@Parent() integration: Integration): Promise<SyncLogType | null> {
    const syncLogs = await this.syncService.getSyncHistory(integration.id, {}, { limit: 1, offset: 0 });
    return syncLogs[0] || null;
  }

  @ResolveField(() => Date, { nullable: true })
  async nextSync(@Parent() integration: Integration): Promise<Date | null> {
    if (!integration.syncEnabled || !integration.syncInterval) return null;
    
    const lastSync = integration.lastSyncAt || integration.createdAt;
    const nextSync = new Date(lastSync.getTime() + integration.syncInterval * 60 * 1000);
    
    return nextSync > new Date() ? nextSync : null;
  }

  @ResolveField(() => RateLimitInfoType, { nullable: true })
  async rateLimitInfo(@Parent() integration: Integration): Promise<RateLimitInfoType | null> {
    return {
      limit: 1000,
      remaining: 950,
      windowSizeSeconds: 3600,
      resetTime: new Date(Date.now() + 3600000),
      retryAfterSeconds: 0,
      isLimited: false,
    };
  }
}