import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Injectable()
export class CrmSubscriptionService {
  private readonly logger = new Logger(CrmSubscriptionService.name);

  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  // Customer events
  @OnEvent('customer.created')
  async handleCustomerCreated(payload: any) {
    this.pubSub.publish('customerCreated', {
      customerCreated: payload.customer,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('customer.updated')
  async handleCustomerUpdated(payload: any) {
    this.pubSub.publish('customerUpdated', {
      customerUpdated: payload.customer,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('customer.deleted')
  async handleCustomerDeleted(payload: any) {
    this.pubSub.publish('customerDeleted', {
      customerDeleted: { id: payload.customerId, tenantId: payload.tenantId },
      tenantId: payload.tenantId,
    });
  }

  // Loyalty events
  @OnEvent('loyalty.points.awarded')
  async handleLoyaltyPointsAwarded(payload: any) {
    this.pubSub.publish('loyaltyPointsAwarded', {
      loyaltyPointsAwarded: {
        customerId: payload.customerId,
        points: payload.points,
        reason: payload.reason,
        transactionId: payload.transactionId,
      },
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('loyalty.points.redeemed')
  async handleLoyaltyPointsRedeemed(payload: any) {
    this.pubSub.publish('loyaltyPointsRedeemed', {
      loyaltyPointsRedeemed: {
        customerId: payload.customerId,
        points: payload.points,
        reason: payload.reason,
        rewardId: payload.rewardId,
      },
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('loyalty.tier.upgraded')
  async handleLoyaltyTierUpgraded(payload: any) {
    this.pubSub.publish('loyaltyTierUpgraded', {
      loyaltyTierUpgraded: {
        customerId: payload.customerId,
        previousTier: payload.previousTier,
        newTier: payload.newTier,
      },
      tenantId: payload.tenantId,
    });
  }

  // Communication events
  @OnEvent('communication.scheduled')
  async handleCommunicationScheduled(payload: any) {
    this.pubSub.publish('communicationScheduled', {
      communicationScheduled: payload.communication,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('communication.sent')
  async handleCommunicationSent(payload: any) {
    this.pubSub.publish('communicationSent', {
      communicationSent: payload.communication,
      tenantId: payload.tenantId,
    });
  }

  // B2B Customer events
  @OnEvent('b2b-customer.created')
  async handleB2BCustomerCreated(payload: any) {
    this.pubSub.publish('b2bCustomerCreated', {
      b2bCustomerCreated: payload.customer,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('b2b-customer.credit-limit.updated')
  async handleB2BCreditLimitUpdated(payload: any) {
    this.pubSub.publish('b2bCreditLimitUpdated', {
      b2bCreditLimitUpdated: {
        customerId: payload.customerId,
        previousCreditLimit: payload.previousCreditLimit,
        newCreditLimit: payload.newCreditLimit,
        reason: payload.reason,
      },
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('b2b-customer.credit-status.updated')
  async handleB2BCreditStatusUpdated(payload: any) {
    this.pubSub.publish('b2bCreditStatusUpdated', {
      b2bCreditStatusUpdated: {
        customerId: payload.customerId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
        reason: payload.reason,
      },
      tenantId: payload.tenantId,
    });
  }

  // Segment events
  @OnEvent('segment.created')
  async handleSegmentCreated(payload: any) {
    this.pubSub.publish('segmentCreated', {
      segmentCreated: payload.segment,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('segment.updated')
  async handleSegmentUpdated(payload: any) {
    this.pubSub.publish('segmentUpdated', {
      segmentUpdated: payload.segment,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('segment.recalculated')
  async handleSegmentRecalculated(payload: any) {
    this.pubSub.publish('segmentRecalculated', {
      segmentRecalculated: {
        segmentId: payload.segmentId,
        memberCount: payload.memberCount,
        calculatedAt: new Date(),
      },
      tenantId: payload.tenantId,
    });
  }

  // Campaign events
  @OnEvent('campaign.created')
  async handleCampaignCreated(payload: any) {
    this.pubSub.publish('campaignCreated', {
      campaignCreated: payload.campaign,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('campaign.activated')
  async handleCampaignActivated(payload: any) {
    this.pubSub.publish('campaignActivated', {
      campaignActivated: payload.campaign,
      tenantId: payload.tenantId,
    });
  }

  @OnEvent('campaign.completed')
  async handleCampaignCompleted(payload: any) {
    this.pubSub.publish('campaignCompleted', {
      campaignCompleted: payload.campaign,
      tenantId: payload.tenantId,
    });
  }
}