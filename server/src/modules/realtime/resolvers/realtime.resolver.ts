import { Resolver, Query, Mutation, Subscription, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard as GraphQLJwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { RealtimeService } from '../services/realtime.service';
import { ConnectionManagerService } from '../services/connection-manager.service';
import { PubSubService, SUBSCRIPTION_EVENTS } from '../../../common/graphql/pubsub.service';
import {
  OnlineUser,
  RealtimeMessage,
  BroadcastResult,
  SendMessageInput,
  BroadcastMessageInput,
  UserStatus,
  MessagePriority,
} from '../types/realtime.types';
import {
  UpdateUserStatusInput,
  JoinRoomInput,
  LeaveRoomInput,
  DirectMessageInput,
  RoomMessageInput,
  GetOnlineUsersInput,
  TypingIndicatorInput,
  MessageReactionInput,
  MarkMessageReadInput,
} from '../inputs/realtime.input';

/**
 * Realtime Resolver
 * 
 * Provides GraphQL operations for real-time features including:
 * - User presence tracking (online/offline status)
 * - Real-time messaging between users
 * - Broadcast messaging to all users in a tenant
 * - Subscriptions for user status changes and messages
 * 
 * Requirements: 26.1-26.6
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class RealtimeResolver {
  private readonly logger = new Logger(RealtimeResolver.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly pubSubService: PubSubService,
  ) {}

  // ===== QUERIES =====

  /**
   * Get list of online users in the tenant
   * Returns user presence information including connection time and status
   */
  @Query(() => [OnlineUser], {
    description: 'Get list of online users in the current tenant',
  })
  async getOnlineUsers(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { nullable: true }) input?: GetOnlineUsersInput,
  ): Promise<OnlineUser[]> {
    try {
      this.logger.log(`Getting online users for tenant ${tenantId}`);

      const connections = this.realtimeService.getTenantConnections(tenantId);
      let filteredConnections = connections;

      // Apply filters
      if (input?.status) {
        // Filter by status (currently all are ONLINE, but this allows for future expansion)
        filteredConnections = filteredConnections.filter(() => input.status === UserStatus.ONLINE);
      }

      if (input?.roomName) {
        // Filter by room membership
        filteredConnections = filteredConnections.filter(conn => 
          conn.rooms.has(`room:${input.roomName}`)
        );
      }

      // Apply pagination
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const paginatedConnections = filteredConnections.slice(offset, offset + limit);

      return paginatedConnections.map(conn => ({
        userId: conn.user.id,
        email: conn.user.email,
        displayName: conn.user.displayName || `${conn.user.email}`,
        status: UserStatus.ONLINE,
        connectedAt: conn.connectedAt,
        lastActivity: conn.lastActivity,
        rooms: Array.from(conn.rooms),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get online users: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get connection statistics
   */
  @Query(() => String, {
    description: 'Get real-time connection statistics',
  })
  async getConnectionStats(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      const stats = this.connectionManager.getSystemStats();
      return JSON.stringify(stats);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get connection stats: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get connection health status
   */
  @Query(() => String, {
    description: 'Get connection health status',
  })
  async getConnectionHealth(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      const health = this.connectionManager.getHealth();
      return JSON.stringify(health);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get connection health: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ===== MUTATIONS =====

  /**
   * Update user online status
   */
  @Mutation(() => OnlineUser, {
    description: 'Update user online status',
  })
  async updateUserStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UpdateUserStatusInput,
  ): Promise<OnlineUser> {
    try {
      this.logger.log(`Updating user status for ${user.id} to ${input.status}`);

      // Publish status change event
      await this.pubSubService.publish(SUBSCRIPTION_EVENTS.USER_STATUS_CHANGED, {
        userStatusChanged: {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          status: input.status,
          connectedAt: new Date(),
          lastActivity: new Date(),
          rooms: [],
        },
        tenantId,
      });

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        status: input.status,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: [],
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to update user status: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send direct message to a specific user
   */
  @Mutation(() => RealtimeMessage, {
    description: 'Send direct message to a specific user',
  })
  async sendDirectMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: DirectMessageInput,
  ): Promise<RealtimeMessage> {
    try {
      this.logger.log(`User ${user.id} sending direct message to ${input.recipientId}`);

      const messageId = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const message: any = {
        id: messageId,
        senderId: user.id,
        senderName: user.email,
        recipientIds: [input.recipientId],
        content: input.content,
        priority: input.priority,
        timestamp,
      };

      if (input.metadata !== undefined) {
        message.metadata = input.metadata;
      }

      const typedMessage = message as RealtimeMessage;

      // Publish message event
      await this.pubSubService.publish(SUBSCRIPTION_EVENTS.MESSAGE_RECEIVED, {
        messageReceived: typedMessage,
        tenantId,
      });

      return typedMessage;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send direct message: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send real-time message to specific users
   * Message is delivered immediately via WebSocket to online recipients
   */
  @Mutation(() => RealtimeMessage, {
    description: 'Send real-time message to specific users',
  })
  async sendRealtimeMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: SendMessageInput,
  ): Promise<RealtimeMessage> {
    try {
      this.logger.log(`User ${user.id} sending message to ${input.recipientIds.length} recipients`);

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const message: any = {
        id: messageId,
        senderId: user.id,
        senderName: user.email,
        recipientIds: input.recipientIds,
        content: input.content,
        priority: input.priority,
        timestamp,
      };

      // Only include metadata if it's defined
      if (input.metadata !== undefined) {
        message.metadata = input.metadata;
      }

      const typedMessage = message as RealtimeMessage;

      // Publish message event for subscriptions
      await this.pubSubService.publish(SUBSCRIPTION_EVENTS.MESSAGE_RECEIVED, {
        messageReceived: typedMessage,
        tenantId,
      });

      this.logger.log(`Message ${messageId} sent successfully`);

      return typedMessage;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send message: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Broadcast message to all users in the tenant
   * Optionally target a specific room/channel
   */
  @Mutation(() => BroadcastResult, {
    description: 'Broadcast message to all users in the tenant',
  })
  async broadcastMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: BroadcastMessageInput,
  ): Promise<BroadcastResult> {
    try {
      this.logger.log(`User ${user.id} broadcasting message to tenant ${tenantId}`);

      const connections = this.realtimeService.getTenantConnections(tenantId);
      let recipientCount = connections.length;

      // Filter by room if specified
      if (input.targetRoom) {
        recipientCount = connections.filter(conn => conn.rooms.has(input.targetRoom!)).length;
      }

      const messageId = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const message: any = {
        id: messageId,
        senderId: user.id,
        senderName: user.email,
        recipientIds: connections.map(conn => conn.user.id),
        content: input.content,
        priority: input.priority,
        timestamp,
      };

      // Only include metadata if it's defined
      if (input.metadata !== undefined) {
        message.metadata = input.metadata;
      }

      const typedMessage = message as RealtimeMessage;

      // Publish broadcast message event
      await this.pubSubService.publish(SUBSCRIPTION_EVENTS.MESSAGE_RECEIVED, {
        messageReceived: typedMessage,
        tenantId,
      });

      this.logger.log(`Broadcast message sent to ${recipientCount} users`);

      return {
        success: true,
        recipientCount,
        message: `Message broadcast to ${recipientCount} users`,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to broadcast message: ${err.message}`, err.stack);
      
      return {
        success: false,
        recipientCount: 0,
        message: `Failed to broadcast message: ${err.message}`,
      };
    }
  }

  // ===== SUBSCRIPTIONS =====

  /**
   * Subscribe to user status changes
   */
  @Subscription(() => OnlineUser, {
    description: 'Subscribe to user status changes',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  userStatusChanged(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSubService.asyncIterator(SUBSCRIPTION_EVENTS.USER_STATUS_CHANGED, tenantId);
  }

  /**
   * Subscribe to typing indicators
   */
  @Subscription(() => String, {
    description: 'Subscribe to typing indicators',
    filter: (payload, variables, context) => {
      const userId = context.req.user.id;
      const tenantId = context.req.user.tenantId;
      return payload.tenantId === tenantId && 
             (payload.recipientId === userId || payload.roomName);
    },
  })
  typingIndicator(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(SUBSCRIPTION_EVENTS.TYPING_INDICATOR, tenantId);
  }

  /**
   * Subscribe to user online events
   * Notifies when users come online in the tenant
   */
  @Subscription(() => OnlineUser, {
    description: 'Subscribe to user online events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  userOnline(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSubService.asyncIterator(SUBSCRIPTION_EVENTS.USER_ONLINE, tenantId);
  }

  /**
   * Subscribe to user offline events
   * Notifies when users go offline in the tenant
   */
  @Subscription(() => OnlineUser, {
    description: 'Subscribe to user offline events',
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.user.tenantId;
    },
  })
  userOffline(
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSubService.asyncIterator(SUBSCRIPTION_EVENTS.USER_OFFLINE, tenantId);
  }

  /**
   * Subscribe to incoming messages
   * Receives real-time messages sent to the current user
   */
  @Subscription(() => RealtimeMessage, {
    description: 'Subscribe to incoming real-time messages',
    filter: (payload, variables, context) => {
      const message = payload.messageReceived;
      const userId = context.req.user.id;
      const tenantId = context.req.user.tenantId;
      
      // Check tenant match and if user is a recipient
      return payload.tenantId === tenantId && 
             message.recipientIds.includes(userId);
    },
  })
  messageReceived(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pubSubService.asyncIterator(SUBSCRIPTION_EVENTS.MESSAGE_RECEIVED, tenantId);
  }
}
