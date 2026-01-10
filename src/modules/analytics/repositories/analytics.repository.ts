import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { sql } from 'drizzle-orm';

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: Record<string, any>;
}

export interface SavedQuery {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sql: string;
  parameters: any[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

@Injectable()
export class AnalyticsRepository {
  private readonly logger = new Logger(AnalyticsRepository.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly cacheService: IntelligentCacheService,
  ) {}

  /**
   * Store analytics event
   */
  async storeEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.drizzle.execute(sql`
        INSERT INTO analytics_events (
          id, tenant_id, event_type, entity_type, entity_id, 
          timestamp, data, metadata, created_at
        ) VALUES (
          ${event.id}, ${event.tenantId}, ${event.eventType}, 
          ${event.entityType}, ${event.entityId}, ${event.timestamp},
          ${JSON.stringify(event.data)}, ${JSON.stringify(event.metadata)},
          NOW()
        )
      `);

      this.logger.debug(`Analytics event stored: ${event.id}`);
    } catch (error) {
      this.logger.error(`Failed to store analytics event: ${event.id}`, error);
      throw error;
    }
  }

  /**
   * Get events by tenant and time range
   */
  async getEvents(
    tenantId: string,
    startTime: Date,
    endTime: Date,
    eventTypes?: string[],
    limit: number = 1000
  ): Promise<AnalyticsEvent[]> {
    try {
      let query = sql`
        SELECT id, tenant_id, event_type, entity_type, entity_id,
               timestamp, data, metadata
        FROM analytics_events
        WHERE tenant_id = ${tenantId}
          AND timestamp >= ${startTime}
          AND timestamp <= ${endTime}
      `;

      if (eventTypes && eventTypes.length > 0) {
        query = sql`${query} AND event_type = ANY(${eventTypes})`;
      }

      query = sql`${query} ORDER BY timestamp DESC LIMIT ${limit}`;

      const results = await this.drizzle.execute(query);

      return results.map(row => ({
        id: row.id,
        tenantId: row.tenant_id,
        even