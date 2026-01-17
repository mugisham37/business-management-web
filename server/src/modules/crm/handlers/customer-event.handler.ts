import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomerService } from '../services/customer.service';
import { LoyaltyService } from '../services/loyalty.service';
import { CommunicationService } from '../services/communication.service';
import { SegmentationService } from '../services/segmentation.service';
import { CampaignService } from '../services/campaign.service';

@Injectable()
export class CustomerEventHandler {
  private readonly logger = new Logger(CustomerEventHandler.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly loyaltyService: LoyaltyService,
    private readonly communicationService: CommunicationService,
    private readonly segmentationService: SegmentationService,
    private readonly campaignService: CampaignService,
  ) {}

  @OnEvent('transaction.completed')
  async handleTransactionCompleted(payload: {
    tenantId: string;
    transaction: {
      id: string;
      customerId?: string;
      total: number;
      createdAt: Date;
    };
    userId: string;
  }) {
    try {
      if (!payload.transaction.customerId) {
        return; // No customer associated with transaction
      }

      this.logger.log(`Processing transaction completed event for transaction ${payload.transaction.id}`);

      // Update customer purchase statistics
      await this.customerService.updatePurchaseStats(
        payload.tenantId,
        payload.transaction.customerId,
        payload.transaction.total,
        payload.transaction.createdAt,
      );

      // Award loyalty points based on purchase amount
      const pointsToAward = Math.floor(payload.transaction.total); // 1 point per dollar
      if (pointsToAward > 0) {
        await this.loyaltyService.awardPoints(
          payload.tenantId,
          payload.transaction.customerId,
          pointsToAward,
          `Purchase transaction ${payload.transaction.id}`,
          payload.transaction.id,
          undefined,
          payload.userId
        );
      }

      // Check for applicable campaigns and award bonus points
      const customer = await this.customerService.findById(payload.tenantId, payload.transaction.customerId);
      const activeCampaigns = await this.campaignService.getActiveCampaignsForCustomer(
        payload.tenantId,
        payload.transaction.customerId,
        customer.loyaltyTier,
        [] // Would need to get customer segments
      );

      for (const campaign of activeCampaigns) {
        if (campaign.type === 'loyalty_points' && 
            campaign.pointsMultiplier && 
            campaign.pointsMultiplier > 1 &&
            (!campaign.minimumPurchaseAmount || payload.transaction.total >= campaign.minimumPurchaseAmount)) {
          
          const bonusPoints = Math.floor(pointsToAward * (campaign.pointsMultiplier - 1));
          if (bonusPoints > 0) {
            await this.loyaltyService.awardPoints(
              payload.tenantId,
              payload.transaction.customerId,
              bonusPoints,
              `Campaign bonus: ${campaign.name}`,
              payload.transaction.id,
              campaign.id,
              payload.userId
            );
          }
        }
      }

      this.logger.log(`Completed processing transaction ${payload.transaction.id} for customer ${payload.transaction.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle transaction completed event:`, error);
    }
  }

  @OnEvent('loyalty.points.earned')
  async handleLoyaltyPointsEarned(payload: {
    tenantId: string;
    customerId: string;
    points: number;
    transactionId: string;
    reason: string;
  }) {
    try {
      this.logger.log(`Processing loyalty points earned event for customer ${payload.customerId}`);

      // Check if customer should be upgraded to a higher tier
      const customer = await this.customerService.findById(payload.tenantId, payload.customerId);
      const newTier = this.calculateLoyaltyTier(customer.loyaltyPointsLifetime + payload.points);
      
      if (newTier !== customer.loyaltyTier) {
        await this.customerService.updateLoyaltyTier(payload.tenantId, payload.customerId, newTier);
        
        // Record communication about tier upgrade
        await this.communicationService.recordCommunication(
          payload.tenantId,
          {
            customerId: payload.customerId,
            type: 'email',
            direction: 'outbound',
            subject: `Congratulations! You've been upgraded to ${newTier} tier`,
            content: `You've earned ${payload.points} points and have been upgraded to our ${newTier} loyalty tier!`,
            status: 'scheduled',
          },
          'system'
        );
      }

      this.logger.log(`Processed loyalty points earned for customer ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle loyalty points earned event:`, error);
    }
  }

  @OnEvent('customer.created')
  async handleCustomerCreated(payload: {
    tenantId: string;
    customerId: string;
    customer: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing customer created event for customer ${payload.customerId}`);

      // Send welcome communication
      await this.communicationService.recordCommunication(
        payload.tenantId,
        {
          customerId: payload.customerId,
          type: 'email',
          direction: 'outbound',
          subject: 'Welcome to our loyalty program!',
          content: 'Thank you for joining us. You\'ve been enrolled in our loyalty program and will start earning points with your first purchase.',
          status: 'scheduled',
        },
        payload.userId
      );

      // Award welcome bonus points
      await this.loyaltyService.awardPoints(
        payload.tenantId,
        payload.customerId,
        100, // Welcome bonus
        'Welcome bonus for new customer',
        undefined,
        undefined,
        payload.userId
      );

      // Evaluate customer for automatic segments
      await this.evaluateCustomerForSegments(payload.tenantId, payload.customerId);

      this.logger.log(`Completed processing customer created for ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle customer created event:`, error);
    }
  }

  @OnEvent('customer.updated')
  async handleCustomerUpdated(payload: {
    tenantId: string;
    customerId: string;
    customer: any;
    previousData: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing customer updated event for customer ${payload.customerId}`);

      // Re-evaluate customer for segments if relevant data changed
      const relevantFieldsChanged = [
        'totalSpent', 'totalOrders', 'loyaltyTier', 'city', 'state', 'country', 'tags'
      ].some(field => payload.customer[field] !== payload.previousData[field]);

      if (relevantFieldsChanged) {
        await this.evaluateCustomerForSegments(payload.tenantId, payload.customerId);
      }

      this.logger.log(`Processed customer updated for ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle customer updated event:`, error);
    }
  }

  @OnEvent('communication.scheduled')
  async handleCommunicationScheduled(payload: {
    tenantId: string;
    communicationId: string;
    customerId: string;
    scheduledAt: Date;
    communication: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing communication scheduled event for communication ${payload.communicationId}`);

      // Here you would typically integrate with email/SMS services
      // For now, just log the scheduled communication
      this.logger.log(`Communication ${payload.communicationId} scheduled for ${payload.scheduledAt}`);

      // You could also set up a job queue to actually send the communication at the scheduled time
      
    } catch (error) {
      this.logger.error(`Failed to handle communication scheduled event:`, error);
    }
  }

  @OnEvent('segment.created')
  async handleSegmentCreated(payload: {
    tenantId: string;
    segmentId: string;
    segment: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing segment created event for segment ${payload.segmentId}`);

      // The segment calculation is handled by the queue processor
      // This event could be used for notifications or other side effects
      
      this.logger.log(`Processed segment created for ${payload.segmentId}`);
    } catch (error) {
      this.logger.error(`Failed to handle segment created event:`, error);
    }
  }

  @OnEvent('campaign.created')
  async handleCampaignCreated(payload: {
    tenantId: string;
    campaignId: string;
    campaign: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing campaign created event for campaign ${payload.campaignId}`);

      // Send notification to relevant stakeholders
      // Set up monitoring for campaign performance
      // Initialize campaign tracking metrics
      
      this.logger.log(`Processed campaign created for ${payload.campaignId}`);
    } catch (error) {
      this.logger.error(`Failed to handle campaign created event:`, error);
    }
  }

  @OnEvent('b2b-customer.created')
  async handleB2BCustomerCreated(payload: {
    tenantId: string;
    customerId: string;
    customer: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Processing B2B customer created event for customer ${payload.customerId}`);

      // Send welcome communication tailored for B2B
      await this.communicationService.recordCommunication(
        payload.tenantId,
        {
          customerId: payload.customerId,
          type: 'email',
          direction: 'outbound',
          subject: 'Welcome to our B2B program',
          content: `Welcome ${payload.customer.companyName}! Your account has been set up with a credit limit of $${payload.customer.creditLimit}.`,
          status: 'scheduled',
        },
        payload.userId
      );

      // Assign to sales rep if specified
      if (payload.customer.salesRepId) {
        // Notify sales rep of new customer assignment
        // This would typically send an internal notification
      }

      this.logger.log(`Processed B2B customer created for ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle B2B customer created event:`, error);
    }
  }

  private calculateLoyaltyTier(lifetimePoints: number): string {
    if (lifetimePoints >= 10000) return 'diamond';
    if (lifetimePoints >= 5000) return 'platinum';
    if (lifetimePoints >= 2500) return 'gold';
    if (lifetimePoints >= 1000) return 'silver';
    return 'bronze';
  }

  private async evaluateCustomerForSegments(tenantId: string, customerId: string): Promise<void> {
    try {
      // Get all active segments
      const segments = await this.segmentationService.getSegments(tenantId, true);

      for (const segment of segments) {
        const isMember = await this.segmentationService.evaluateSegmentMembership(
          tenantId,
          segment.id,
          customerId
        );

        // This would typically update segment memberships
        // For now, just log the evaluation result
        this.logger.debug(`Customer ${customerId} ${isMember ? 'matches' : 'does not match'} segment ${segment.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to evaluate customer ${customerId} for segments:`, error);
    }
  }

  @OnEvent('loyalty.points.redeemed')
  async handleLoyaltyPointsRedeemed(payload: {
    tenantId: string;
    customerId: string;
    points: number;
    transactionId: string;
    reason: string;
  }) {
    try {
      this.logger.log(`Redeeming ${payload.points} loyalty points from customer ${payload.customerId}`);

      await this.customerService.updateLoyaltyPoints(
        payload.tenantId,
        payload.customerId,
        -payload.points, // Negative for redemption
        payload.reason,
      );

      this.logger.log(`Redeemed ${payload.points} loyalty points from customer ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle loyalty points redeemed event:`, error);
    }
  }

  @OnEvent('loyalty.points.reversed')
  async handleLoyaltyPointsReversed(payload: {
    tenantId: string;
    customerId: string;
    points: number;
    transactionId: string;
    reason: string;
  }) {
    try {
      this.logger.log(`Reversing ${payload.points} loyalty points from customer ${payload.customerId}`);

      await this.customerService.updateLoyaltyPoints(
        payload.tenantId,
        payload.customerId,
        -payload.points, // Negative for reversal
        payload.reason,
      );

      this.logger.log(`Reversed ${payload.points} loyalty points from customer ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle loyalty points reversed event:`, error);
    }
  }

  @OnEvent('loyalty.points.adjusted')
  async handleLoyaltyPointsAdjusted(payload: {
    tenantId: string;
    customerId: string;
    points: number;
    transactionId: string;
    reason: string;
  }) {
    try {
      this.logger.log(`Adjusting ${payload.points} loyalty points for customer ${payload.customerId}`);

      await this.customerService.updateLoyaltyPoints(
        payload.tenantId,
        payload.customerId,
        payload.points,
        payload.reason,
      );

      this.logger.log(`Adjusted ${payload.points} loyalty points for customer ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle loyalty points adjusted event:`, error);
    }
  }

  @OnEvent('customer.deleted')
  async handleCustomerDeleted(payload: {
    tenantId: string;
    customerId: string;
    customer: any;
    userId: string;
  }) {
    try {
      this.logger.log(`Customer ${payload.customerId} deleted for tenant ${payload.tenantId}`);

      // Here you could add logic for:
      // - Cleaning up related data
      // - Removing from segments
      // - Canceling scheduled communications
      // - Archiving customer data

      // For now, just log the event
      this.logger.log(`Customer deletion event processed for ${payload.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to handle customer deleted event:`, error);
    }
  }
}