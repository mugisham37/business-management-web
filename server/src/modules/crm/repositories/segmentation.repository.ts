import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { customerSegments, customerSegmentMemberships, customers } from '../../database/schema';
import { eq, and, or, like, ilike, gte, lte, desc, asc, sql, inArray, isNull, isNotNull } from 'drizzle-orm';

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

@Injectable()
export class SegmentationRepository {
  private readonly logger = new Logger(SegmentationRepository.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async findById(tenantId: string, id: string): Promise<any | null> {
    try {
      const [segment] = await this.drizzle.getDb()
        .select()
        .from(customerSegments)
        .where(and(
          eq(customerSegments.tenantId, tenantId),
          eq(customerSegments.id, id),
          isNull(customerSegments.deletedAt)
        ));

      if (!segment) {
        return null;
      }

      // Get member count
      const [memberCount] = await this.drizzle.getDb()
        .select({ count: sql<number>`COUNT(*)` })
        .from(customerSegmentMemberships)
        .where(and(
          eq(customerSegmentMemberships.segmentId, id),
          eq(customerSegmentMemberships.isActive, true)
        ));

      return {
        ...segment,
        memberCount: Number(memberCount?.count ?? 0),
        criteria: segment.criteria || [],
      };
    } catch (error) {
      this.logger.error(`Failed to find segment ${id}:`, error);
      throw error;
    }
  }

  async findMany(tenantId: string, isActive?: boolean): Promise<any[]> {
    try {
      const conditions = [
        eq(customerSegments.tenantId, tenantId),
        isNull(customerSegments.deletedAt)
      ];

      if (isActive !== undefined) {
        conditions.push(eq(customerSegments.isActive, isActive));
      }

      const segments = await this.drizzle.getDb()
        .select()
        .from(customerSegments)
        .where(and(...conditions))
        .orderBy(desc(customerSegments.createdAt));

      // Get member counts for all segments
      const segmentIds = segments.map(s => s.id);
      
      if (segmentIds.length === 0) {
        return [];
      }

      const memberCounts = await this.drizzle.getDb()
        .select({
          segmentId: customerSegmentMemberships.segmentId,
          count: sql<number>`COUNT(*)`,
        })
        .from(customerSegmentMemberships)
        .where(and(
          inArray(customerSegmentMemberships.segmentId, segmentIds),
          eq(customerSegmentMemberships.isActive, true)
        ))
        .groupBy(customerSegmentMemberships.segmentId);

      const memberCountMap = new Map<string, number>();
      memberCounts.forEach(mc => {
        memberCountMap.set(mc.segmentId, Number(mc.count));
      });

      return segments.map(segment => ({
        ...segment,
        memberCount: memberCountMap.get(segment.id) || 0,
        criteria: segment.criteria || [],
      }));
    } catch (error) {
      this.logger.error(`Failed to find segments for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async create(tenantId: string, data: any, userId: string): Promise<any> {
    try {
      const segmentData = {
        tenantId,
        name: data.name,
        description: data.description,
        type: data.type || 'demographic',
        criteria: data.criteria || data.rules || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: userId,
        updatedBy: userId,
      };

      const [createdSegment] = await this.drizzle.getDb()
        .insert(customerSegments)
        .values(segmentData)
        .returning();

      return {
        ...createdSegment,
        memberCount: 0,
        criteria: createdSegment?.criteria || [],
      };
    } catch (error) {
      this.logger.error(`Failed to create segment:`, error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, data: any, userId: string): Promise<any> {
    try {
      const updateData: any = {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      };

      // Convert 'rules' to 'criteria' if provided
      if (updateData.rules && !updateData.criteria) {
        updateData.criteria = updateData.rules;
        delete updateData.rules;
      }

      const [updatedSegment] = await this.drizzle.getDb()
        .update(customerSegments)
        .set(updateData)
        .where(and(
          eq(customerSegments.tenantId, tenantId),
          eq(customerSegments.id, id)
        ))
        .returning();

      // Get member count
      const [memberCount] = await this.drizzle.getDb()
        .select({ count: sql<number>`COUNT(*)` })
        .from(customerSegmentMemberships)
        .where(and(
          eq(customerSegmentMemberships.segmentId, id),
          eq(customerSegmentMemberships.isActive, true)
        ));

      return {
        ...updatedSegment,
        memberCount: Number(memberCount?.count ?? 0),
        criteria: updatedSegment?.criteria || [],
      };
    } catch (error) {
      this.logger.error(`Failed to update segment ${id}:`, error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    try {
      await this.drizzle.getDb()
        .update(customerSegments)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
        })
        .where(and(
          eq(customerSegments.tenantId, tenantId),
          eq(customerSegments.id, id)
        ));

      // Deactivate all memberships
      await this.drizzle.getDb()
        .update(customerSegmentMemberships)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(customerSegmentMemberships.segmentId, id));
    } catch (error) {
      this.logger.error(`Failed to delete segment ${id}:`, error);
      throw error;
    }
  }

  async findMembers(tenantId: string, segmentId: string, limit: number): Promise<any[]> {
    try {
      const members = await this.drizzle.getDb()
        .select({
          customer: customers,
          membership: customerSegmentMemberships,
        })
        .from(customerSegmentMemberships)
        .innerJoin(customers, eq(customers.id, customerSegmentMemberships.customerId))
        .where(and(
          eq(customerSegmentMemberships.segmentId, segmentId),
          eq(customerSegmentMemberships.isActive, true),
          eq(customers.tenantId, tenantId),
          isNull(customers.deletedAt)
        ))
        .limit(limit)
        .orderBy(desc(customerSegmentMemberships.addedAt));

      return members.map(m => ({
        ...m.customer,
        segmentMembership: {
          addedAt: m.membership.addedAt,
          isActive: m.membership.isActive,
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to find members for segment ${segmentId}:`, error);
      throw error;
    }
  }

  async evaluateMembership(tenantId: string, rules: SegmentRule[], customerId: string): Promise<boolean> {
    try {
      if (!rules || rules.length === 0) {
        return false;
      }

      // Get customer data
      const [customer] = await this.drizzle.getDb()
        .select()
        .from(customers)
        .where(and(
          eq(customers.tenantId, tenantId),
          eq(customers.id, customerId),
          isNull(customers.deletedAt)
        ));

      if (!customer) {
        return false;
      }

      // Evaluate each rule
      let result = true;
      let currentLogicalOperator = 'AND';

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (!rule) continue; // Skip undefined rules
        const ruleResult = this.evaluateRule(customer, rule);

        if (i === 0) {
          result = ruleResult;
        } else {
          if (currentLogicalOperator === 'AND') {
            result = result && ruleResult;
          } else {
            result = result || ruleResult;
          }
        }

        // Set logical operator for next iteration
        if (rule?.logicalOperator) {
          currentLogicalOperator = rule.logicalOperator;
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to evaluate membership for customer ${customerId}:`, error);
      return false;
    }
  }

  async findByIds(ids: string[]): Promise<any[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const segments = await this.drizzle.getDb()
        .select()
        .from(customerSegments)
        .where(and(
          inArray(customerSegments.id, ids),
          isNull(customerSegments.deletedAt)
        ));

      // Get member counts
      const memberCounts = await this.drizzle.getDb()
        .select({
          segmentId: customerSegmentMemberships.segmentId,
          count: sql<number>`COUNT(*)`,
        })
        .from(customerSegmentMemberships)
        .where(and(
          inArray(customerSegmentMemberships.segmentId, ids),
          eq(customerSegmentMemberships.isActive, true)
        ))
        .groupBy(customerSegmentMemberships.segmentId);

      const memberCountMap = new Map<string, number>();
      memberCounts.forEach(mc => {
        memberCountMap.set(mc.segmentId, Number(mc.count));
      });

      return segments.map(segment => ({
        ...segment,
        memberCount: memberCountMap.get(segment.id) || 0,
        criteria: segment.criteria || [],
      }));
    } catch (error) {
      this.logger.error(`Failed to find segments by IDs:`, error);
      throw error;
    }
  }

  async addCustomerToSegment(tenantId: string, segmentId: string, customerId: string): Promise<void> {
    try {
      // Check if membership already exists
      const [existing] = await this.drizzle.getDb()
        .select()
        .from(customerSegmentMemberships)
        .where(and(
          eq(customerSegmentMemberships.segmentId, segmentId),
          eq(customerSegmentMemberships.customerId, customerId)
        ));

      if (existing) {
        // Reactivate if inactive
        if (!existing.isActive) {
          await this.drizzle.getDb()
            .update(customerSegmentMemberships)
            .set({
              isActive: true,
              addedAt: new Date(),
            })
            .where(and(
              eq(customerSegmentMemberships.segmentId, segmentId),
              eq(customerSegmentMemberships.customerId, customerId)
            ));
        }
      } else {
        // Create new membership
        await this.drizzle.getDb()
          .insert(customerSegmentMemberships)
          .values({
            tenantId,
            segmentId,
            customerId,
            isActive: true,
            addedAt: new Date(),
          });
      }
    } catch (error) {
      this.logger.error(`Failed to add customer ${customerId} to segment ${segmentId}:`, error);
      throw error;
    }
  }

  async removeCustomerFromSegment(segmentId: string, customerId: string): Promise<void> {
    try {
      await this.drizzle.getDb()
        .update(customerSegmentMemberships)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(
          eq(customerSegmentMemberships.segmentId, segmentId),
          eq(customerSegmentMemberships.customerId, customerId)
        ));
    } catch (error) {
      this.logger.error(`Failed to remove customer ${customerId} from segment ${segmentId}:`, error);
      throw error;
    }
  }

  private evaluateRule(customer: any, rule: SegmentRule): boolean {
    const fieldValue = this.getFieldValue(customer, rule.field);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      
      case 'not_equals':
        return fieldValue !== rule.value;
      
      case 'greater_than':
        return Number(fieldValue) > Number(rule.value);
      
      case 'less_than':
        return Number(fieldValue) < Number(rule.value);
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
      
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
      
      default:
        return false;
    }
  }

  private getFieldValue(customer: any, field: string): any {
    // Handle nested field access (e.g., 'address.city')
    const fieldParts = field.split('.');
    let value = customer;
    
    for (const part of fieldParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  }
}
