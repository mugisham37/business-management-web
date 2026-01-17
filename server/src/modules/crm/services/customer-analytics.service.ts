import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { 
  CustomerLifetimeValue, 
  SegmentAnalytics, 
  PurchasePattern, 
  ChurnRiskAnalysis,
  CustomerMetrics 
} from '../types/customer-analytics.types';
import { customers, transactions, customerSegments, customerSegmentMemberships } from '../../database/schema';
import { eq, and, gte, lte, desc, sql, count, avg, sum, isNull } from 'drizzle-orm';

@Injectable()
export class CustomerAnalyticsService {
  private readonly logger = new Logger(CustomerAnalyticsService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly customerRepository: CustomerRepository,
    private readonly cacheService: IntelligentCacheService,
  ) {}

  async calculateCustomerLifetimeValue(tenantId: string, customerId: string): Promise<CustomerLifetimeValue> {
    try {
      const cacheKey = `customer-ltv:${tenantId}:${customerId}`;
      
      let ltv = await this.cacheService.get<CustomerLifetimeValue>(cacheKey);
      
      if (!ltv) {
        const customer = await this.customerRepository.findById(tenantId, customerId);
        if (!customer) {
          throw new Error(`Customer ${customerId} not found`);
        }

        // Calculate purchase frequency (orders per day)
        const daysSinceFirst = customer.firstPurchaseDate 
          ? Math.max(1, Math.floor((Date.now() - customer.firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 1;
        
        const purchaseFrequency = customer.totalOrders / daysSinceFirst;
        
        // Calculate churn probability using simple heuristics
        const daysSinceLastPurchase = customer.lastPurchaseDate
          ? Math.floor((Date.now() - customer.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
          : 365;
        
        const churnProbability = Math.min(0.95, daysSinceLastPurchase / 365);
        
        // Predict future value based on historical patterns
        const predictedValue = customer.lifetimeValue * (1 + (purchaseFrequency * 365 * (1 - churnProbability)));

        ltv = {
          customerId,
          currentValue: customer.lifetimeValue,
          predictedValue,
          averageOrderValue: customer.averageOrderValue,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          daysSinceFirstPurchase: daysSinceFirst,
          purchaseFrequency,
          churnProbability,
        };

        // Cache for 1 hour
        await this.cacheService.set(cacheKey, ltv, { ttl: 3600, tenantId });
      }

      return ltv;
    } catch (error) {
      this.logger.error(`Failed to calculate LTV for customer ${customerId}:`, error);
      throw error;
    }
  }

  async getCustomerSegmentAnalytics(tenantId: string, segmentId: string): Promise<SegmentAnalytics> {
    try {
      const cacheKey = `segment-analytics:${tenantId}:${segmentId}`;
      
      let analytics = await this.cacheService.get<SegmentAnalytics>(cacheKey);
      
      if (!analytics) {
        // Get segment info
        const [segment] = await this.drizzle.getDb()
          .select()
          .from(customerSegments)
          .where(and(
            eq(customerSegments.tenantId, tenantId),
            eq(customerSegments.id, segmentId),
            isNull(customerSegments.deletedAt)
          ));

        if (!segment) {
          throw new Error(`Segment ${segmentId} not found`);
        }

        // Get segment members and their metrics
        const segmentStats = await this.drizzle.getDb()
          .select({
            customerCount: count(customers.id),
            averageLifetimeValue: avg(customers.lifetimeValue),
            averageOrderValue: avg(customers.averageOrderValue),
            totalRevenue: sum(customers.totalSpent),
          })
          .from(customers)
          .innerJoin(customerSegmentMemberships, eq(customers.id, customerSegmentMemberships.customerId))
          .where(and(
            eq(customers.tenantId, tenantId),
            eq(customerSegmentMemberships.segmentId, segmentId),
            eq(customerSegmentMemberships.isActive, true),
            isNull(customers.deletedAt)
          ));

        const stats = segmentStats[0] || {
          customerCount: 0,
          averageLifetimeValue: 0,
          averageOrderValue: 0,
          totalRevenue: 0,
        };

        analytics = {
          segmentId,
          segmentName: segment.name,
          customerCount: Number(stats.customerCount) || 0,
          averageLifetimeValue: Number(stats.averageLifetimeValue) || 0,
          averageOrderValue: Number(stats.averageOrderValue) || 0,
          totalRevenue: Number(stats.totalRevenue) || 0,
          conversionRate: 0.15, // Placeholder - would need transaction data
          churnRate: 0.05, // Placeholder - would need historical data
          averageDaysBetweenPurchases: 30, // Placeholder
        };

        // Cache for 30 minutes
        await this.cacheService.set(cacheKey, analytics, { ttl: 1800, tenantId });
      }

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get segment analytics for ${segmentId}:`, error);
      throw error;
    }
  }

  async analyzePurchasePatterns(tenantId: string, customerId: string): Promise<PurchasePattern> {
    try {
      const cacheKey = `purchase-patterns:${tenantId}:${customerId}`;
      
      let patterns = await this.cacheService.get<PurchasePattern>(cacheKey);
      
      if (!patterns) {
        const customer = await this.customerRepository.findById(tenantId, customerId);
        if (!customer) {
          throw new Error(`Customer ${customerId} not found`);
        }

        // This would typically analyze transaction history
        // For now, providing reasonable defaults based on customer data
        patterns = {
          customerId,
          preferredCategories: customer.tags.filter(tag => tag.includes('category:')).map(tag => tag.replace('category:', '')),
          preferredBrands: customer.tags.filter(tag => tag.includes('brand:')).map(tag => tag.replace('brand:', '')),
          seasonalityScore: 0.3, // Low seasonality
          primaryShoppingDay: 'Saturday',
          primaryShoppingTime: '14:00-16:00',
          pricesensitivity: 0.6, // Moderate price sensitivity
          promotionResponsiveness: 0.7, // Good response to promotions
          averageDaysBetweenPurchases: customer.totalOrders > 0 
            ? Math.floor(365 / (customer.totalOrders / Math.max(1, customer.firstPurchaseDate ? 
                Math.floor((Date.now() - customer.firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)) : 1)))
            : 30,
          basketSizeVariability: 0.4, // Moderate variability
        };

        // Cache for 2 hours
        await this.cacheService.set(cacheKey, patterns, { ttl: 7200, tenantId });
      }

      return patterns;
    } catch (error) {
      this.logger.error(`Failed to analyze purchase patterns for customer ${customerId}:`, error);
      throw error;
    }
  }

  async predictChurnRisk(tenantId: string, customerId: string): Promise<ChurnRiskAnalysis> {
    try {
      const cacheKey = `churn-risk:${tenantId}:${customerId}`;
      
      let churnRisk = await this.cacheService.get<ChurnRiskAnalysis>(cacheKey);
      
      if (!churnRisk) {
        const customer = await this.customerRepository.findById(tenantId, customerId);
        if (!customer) {
          throw new Error(`Customer ${customerId} not found`);
        }

        const daysSinceLastPurchase = customer.lastPurchaseDate
          ? Math.floor((Date.now() - customer.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        // Simple churn risk calculation
        let churnProbability = 0;
        const riskFactors: string[] = [];
        const recommendedActions: string[] = [];

        // Days since last purchase factor
        if (daysSinceLastPurchase > 90) {
          churnProbability += 0.3;
          riskFactors.push('Long time since last purchase');
          recommendedActions.push('Send re-engagement email');
        }

        // Low engagement factor
        if (customer.totalOrders < 3) {
          churnProbability += 0.2;
          riskFactors.push('Low purchase frequency');
          recommendedActions.push('Offer onboarding discount');
        }

        // Declining spend pattern (simplified)
        if (customer.averageOrderValue < 50) {
          churnProbability += 0.1;
          riskFactors.push('Low average order value');
          recommendedActions.push('Recommend higher-value products');
        }

        // Opt-out factors
        if (!customer.marketingOptIn) {
          churnProbability += 0.15;
          riskFactors.push('Marketing opt-out');
          recommendedActions.push('Request permission for targeted offers');
        }

        churnProbability = Math.min(0.95, churnProbability);

        let riskLevel = 'low';
        if (churnProbability > 0.7) riskLevel = 'critical';
        else if (churnProbability > 0.5) riskLevel = 'high';
        else if (churnProbability > 0.3) riskLevel = 'medium';

        const predictedChurnDate = churnProbability > 0.5 
          ? new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)) // 90 days from now
          : null;

        churnRisk = {
          customerId,
          churnProbability,
          riskLevel,
          riskFactors,
          daysSinceLastPurchase,
          engagementScore: Math.max(0, 1 - churnProbability),
          satisfactionScore: 0.8, // Placeholder - would come from surveys
          recommendedActions,
          ...(predictedChurnDate && { predictedChurnDate }),
        } as ChurnRiskAnalysis;

        // Cache for 1 hour
        await this.cacheService.set(cacheKey, churnRisk, { ttl: 3600, tenantId });
      }

      return churnRisk!;
    } catch (error) {
      this.logger.error(`Failed to predict churn risk for customer ${customerId}:`, error);
      throw error;
    }
  }

  async getCustomerMetrics(tenantId: string): Promise<CustomerMetrics> {
    try {
      const cacheKey = `customer-metrics:${tenantId}`;
      
      let metrics = await this.cacheService.get<CustomerMetrics>(cacheKey);
      
      if (!metrics) {
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        
        // Get customer counts and metrics
        const customerStats = await this.drizzle.getDb()
          .select({
            totalCustomers: count(customers.id),
            averageLifetimeValue: avg(customers.lifetimeValue),
            averageOrderValue: avg(customers.averageOrderValue),
          })
          .from(customers)
          .where(and(
            eq(customers.tenantId, tenantId),
            isNull(customers.deletedAt)
          ));

        const activeCustomerStats = await this.drizzle.getDb()
          .select({
            activeCustomers: count(customers.id),
          })
          .from(customers)
          .where(and(
            eq(customers.tenantId, tenantId),
            eq(customers.status, 'active'),
            isNull(customers.deletedAt)
          ));

        const newCustomerStats = await this.drizzle.getDb()
          .select({
            newCustomers: count(customers.id),
          })
          .from(customers)
          .where(and(
            eq(customers.tenantId, tenantId),
            gte(customers.createdAt, thirtyDaysAgo),
            isNull(customers.deletedAt)
          ));

        const stats = customerStats[0] || {
          totalCustomers: 0,
          averageLifetimeValue: 0,
          averageOrderValue: 0,
        };
        const activeStats = activeCustomerStats[0] || { activeCustomers: 0 };
        const newStats = newCustomerStats[0] || { newCustomers: 0 };

        const totalCustomers = Number(stats.totalCustomers) || 0;
        const newCustomersThisMonth = Number(newStats.newCustomers) || 0;

        metrics = {
          totalCustomers,
          activeCustomers: Number(activeStats.activeCustomers) || 0,
          newCustomersThisMonth,
          customerGrowthRate: totalCustomers > 0 ? (newCustomersThisMonth / totalCustomers) * 100 : 0,
          averageLifetimeValue: Number(stats.averageLifetimeValue) || 0,
          averageOrderValue: Number(stats.averageOrderValue) || 0,
          churnRate: 5.0, // Placeholder - would need historical data
          retentionRate: 95.0, // Placeholder
          averageDaysBetweenPurchases: 30, // Placeholder
          customerSatisfactionScore: 4.2, // Placeholder - would come from surveys
        };

        // Cache for 15 minutes
        await this.cacheService.set(cacheKey, metrics, { ttl: 900, tenantId });
      }

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to get customer metrics for tenant ${tenantId}:`, error);
      throw error;
    }
  }
}