import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SegmentationRepository } from '../repositories/segmentation.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

export interface Segment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  rules: SegmentRule[];
  isActive: boolean;
  memberCount: number;
  lastCalculatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface CreateSegmentDto {
  name: string;
  description?: string;
  rules: SegmentRule[];
  isActive?: boolean;
}

export interface UpdateSegmentDto {
  name?: string;
  description?: string;
  rules?: SegmentRule[];
  isActive?: boolean;
}

@Injectable()
export class SegmentationService {
  private readonly logger = new Logger(SegmentationService.name);

  constructor(
    private readonly segmentationRepository: SegmentationRepository,
    private readonly cacheService: IntelligentCacheService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue('segmentation') private readonly segmentationQueue: Queue,
  ) {}

  async getSegment(tenantId: string, id: string): Promise<Segment> {
    try {
      const cacheKey = `segment:${tenantId}:${id}`;
      
      let segment = await this.cacheService.get<Segment>(cacheKey);
      
      if (!segment) {
        segment = await this.segmentationRepository.findById(tenantId, id);
        
        if (!segment) {
          throw new NotFoundException(`Segment ${id} not found`);
        }

        // Cache for 10 minutes
        await this.cacheService.set(cacheKey, segment, { ttl: 600, tenantId });
      }

      return segment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get segment ${id}:`, error);
      throw error;
    }
  }

  async getSegments(tenantId: string, isActive?: boolean): Promise<Segment[]> {
    try {
      const cacheKey = `segments:${tenantId}:${isActive}`;
      
      let segments = await this.cacheService.get<Segment[]>(cacheKey);
      
      if (!segments) {
        segments = await this.segmentationRepository.findMany(tenantId, isActive);

        // Cache for 10 minutes
        await this.cacheService.set(cacheKey, segments, { ttl: 600, tenantId });
      }

      return segments;
    } catch (error) {
      this.logger.error(`Failed to get segments for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async createSegment(tenantId: string, data: CreateSegmentDto, userId: string): Promise<Segment> {
    try {
      const segment = await this.segmentationRepository.create(tenantId, data, userId);

      // Clear caches
      await this.invalidateSegmentCaches(tenantId);

      // Enqueue segment calculation
      await this.segmentationQueue.add('calculate-segment', {
        tenantId,
        segmentId: segment.id,
      });

      // Emit event
      this.eventEmitter.emit('segment.created', {
        tenantId,
        segmentId: segment.id,
        segment,
        userId,
      });

      this.logger.log(`Created segment ${segment.id} for tenant ${tenantId}`);
      return segment;
    } catch (error) {
      this.logger.error(`Failed to create segment:`, error);
      throw error;
    }
  }

  async updateSegment(
    tenantId: string,
    id: string,
    data: UpdateSegmentDto,
    userId: string,
  ): Promise<Segment> {
    try {
      const existing = await this.getSegment(tenantId, id);

      const segment = await this.segmentationRepository.update(tenantId, id, data, userId);

      // Clear caches
      await this.invalidateSegmentCaches(tenantId, id);

      // If rules changed, recalculate segment
      if (data.rules) {
        await this.segmentationQueue.add('calculate-segment', {
          tenantId,
          segmentId: id,
        });
      }

      // Emit event
      this.eventEmitter.emit('segment.updated', {
        tenantId,
        segmentId: id,
        segment,
        previousData: existing,
        userId,
      });

      this.logger.log(`Updated segment ${id}`);
      return segment;
    } catch (error) {
      this.logger.error(`Failed to update segment ${id}:`, error);
      throw error;
    }
  }

  async deleteSegment(tenantId: string, id: string, userId: string): Promise<void> {
    try {
      const segment = await this.getSegment(tenantId, id);

      await this.segmentationRepository.delete(tenantId, id, userId);

      // Clear caches
      await this.invalidateSegmentCaches(tenantId, id);

      // Emit event
      this.eventEmitter.emit('segment.deleted', {
        tenantId,
        segmentId: id,
        segment,
        userId,
      });

      this.logger.log(`Deleted segment ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete segment ${id}:`, error);
      throw error;
    }
  }

  async getSegmentMembers(tenantId: string, segmentId: string, limit: number = 100): Promise<any[]> {
    try {
      const cacheKey = `segment-members:${tenantId}:${segmentId}:${limit}`;
      
      let members = await this.cacheService.get<any[]>(cacheKey);
      
      if (!members) {
        members = await this.segmentationRepository.findMembers(tenantId, segmentId, limit);

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, members, { ttl: 300, tenantId });
      }

      return members;
    } catch (error) {
      this.logger.error(`Failed to get segment members for ${segmentId}:`, error);
      throw error;
    }
  }

  async evaluateSegmentMembership(
    tenantId: string,
    segmentId: string,
    customerId: string,
  ): Promise<boolean> {
    try {
      const segment = await this.getSegment(tenantId, segmentId);
      
      // Evaluate rules against customer data
      const isMember = await this.segmentationRepository.evaluateMembership(
        tenantId,
        segment.rules,
        customerId,
      );

      return isMember;
    } catch (error) {
      this.logger.error(`Failed to evaluate segment membership:`, error);
      throw error;
    }
  }

  async recalculateSegment(tenantId: string, segmentId: string): Promise<{ jobId: string }> {
    try {
      const job = await this.segmentationQueue.add('calculate-segment', {
        tenantId,
        segmentId,
      });

      this.logger.log(`Enqueued segment recalculation for ${segmentId}, job ID: ${job.id}`);
      
      return { jobId: job.id!.toString() };
    } catch (error) {
      this.logger.error(`Failed to enqueue segment recalculation:`, error);
      throw error;
    }
  }

  async batchLoadByIds(ids: readonly string[]): Promise<(Segment | Error)[]> {
    try {
      const segments = await this.segmentationRepository.findByIds([...ids]);
      const segmentMap = new Map<string, Segment>();
      
      segments.forEach(seg => segmentMap.set(seg.id, seg));

      return ids.map(id => segmentMap.get(id) || new Error(`Segment not found: ${id}`));
    } catch (error) {
      return ids.map(() => error as Error);
    }
  }

  private async invalidateSegmentCaches(tenantId: string, segmentId?: string): Promise<void> {
    try {
      await this.cacheService.invalidatePattern(`segments:${tenantId}:*`);
      
      if (segmentId) {
        await this.cacheService.invalidatePattern(`segment:${tenantId}:${segmentId}`);
        await this.cacheService.invalidatePattern(`segment-members:${tenantId}:${segmentId}:*`);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate segment caches:`, error);
    }
  }
}
