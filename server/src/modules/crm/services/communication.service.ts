import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommunicationRepository } from '../repositories/communication.repository';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';

export interface Communication {
  id: string;
  tenantId: string;
  customerId: string;
  employeeId?: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'sms';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  completedAt?: Date;
  duration?: number;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateCommunicationDto {
  customerId: string;
  employeeId?: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'sms';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  completedAt?: Date;
  duration?: number;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  metadata?: Record<string, any>;
}

export interface ScheduleCommunicationDto {
  customerId: string;
  employeeId?: string;
  type: 'email' | 'phone' | 'meeting' | 'sms';
  subject?: string;
  content: string;
  scheduledAt: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    private readonly communicationRepository: CommunicationRepository,
    private readonly cacheService: IntelligentCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getCommunications(
    tenantId: string,
    customerId?: string,
    employeeId?: string,
    type?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Communication[]> {
    try {
      const cacheKey = `communications:${tenantId}:${customerId}:${employeeId}:${type}:${startDate}:${endDate}`;
      
      let communications = await this.cacheService.get<Communication[]>(cacheKey);
      
      if (!communications) {
        communications = await this.communicationRepository.findMany(
          tenantId,
          customerId,
          employeeId,
          type,
          startDate,
          endDate,
        );

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, communications, { ttl: 300, tenantId });
      }

      return communications;
    } catch (error) {
      this.logger.error(`Failed to get communications for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async getCommunicationById(tenantId: string, id: string): Promise<Communication> {
    try {
      const communication = await this.communicationRepository.findById(tenantId, id);
      
      if (!communication) {
        throw new NotFoundException(`Communication ${id} not found`);
      }

      return communication;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get communication ${id}:`, error);
      throw error;
    }
  }

  async getCommunicationTimeline(
    tenantId: string,
    customerId: string,
    limit: number = 50,
  ): Promise<Communication[]> {
    try {
      const cacheKey = `communication-timeline:${tenantId}:${customerId}:${limit}`;
      
      let timeline = await this.cacheService.get<Communication[]>(cacheKey);
      
      if (!timeline) {
        timeline = await this.communicationRepository.findTimeline(tenantId, customerId, limit);

        // Cache for 5 minutes
        await this.cacheService.set(cacheKey, timeline, { ttl: 300, tenantId });
      }

      return timeline;
    } catch (error) {
      this.logger.error(`Failed to get communication timeline for customer ${customerId}:`, error);
      throw error;
    }
  }

  async recordCommunication(
    tenantId: string,
    data: CreateCommunicationDto,
    userId: string,
  ): Promise<Communication> {
    try {
      const communication = await this.communicationRepository.create(tenantId, data, userId);

      // Clear caches
      await this.invalidateCommunicationCaches(tenantId, data.customerId);

      // Emit event
      this.eventEmitter.emit('communication.recorded', {
        tenantId,
        communicationId: communication.id,
        customerId: data.customerId,
        communication,
        userId,
      });

      this.logger.log(`Recorded communication ${communication.id} for customer ${data.customerId}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to record communication:`, error);
      throw error;
    }
  }

  async scheduleCommunication(
    tenantId: string,
    data: ScheduleCommunicationDto,
    userId: string,
  ): Promise<Communication> {
    try {
      const communicationData: CreateCommunicationDto = {
        ...data,
        direction: 'outbound',
        status: 'scheduled',
        followUpRequired: false,
      };

      const communication = await this.communicationRepository.create(
        tenantId,
        communicationData,
        userId,
      );

      // Clear caches
      await this.invalidateCommunicationCaches(tenantId, data.customerId);

      // Emit event for subscription
      this.eventEmitter.emit('communication.scheduled', {
        tenantId,
        communicationId: communication.id,
        customerId: data.customerId,
        scheduledAt: data.scheduledAt,
        communication,
        userId,
      });

      this.logger.log(`Scheduled communication ${communication.id} for ${data.scheduledAt}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to schedule communication:`, error);
      throw error;
    }
  }

  async updateCommunication(
    tenantId: string,
    id: string,
    data: Partial<CreateCommunicationDto>,
    userId: string,
  ): Promise<Communication> {
    try {
      const existing = await this.getCommunicationById(tenantId, id);

      const communication = await this.communicationRepository.update(tenantId, id, data, userId);

      // Clear caches
      await this.invalidateCommunicationCaches(tenantId, existing.customerId);

      // Emit event
      this.eventEmitter.emit('communication.updated', {
        tenantId,
        communicationId: id,
        customerId: existing.customerId,
        communication,
        userId,
      });

      this.logger.log(`Updated communication ${id}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to update communication ${id}:`, error);
      throw error;
    }
  }

  async deleteCommunication(tenantId: string, id: string, userId: string): Promise<void> {
    try {
      const communication = await this.getCommunicationById(tenantId, id);

      await this.communicationRepository.delete(tenantId, id, userId);

      // Clear caches
      await this.invalidateCommunicationCaches(tenantId, communication.customerId);

      // Emit event
      this.eventEmitter.emit('communication.deleted', {
        tenantId,
        communicationId: id,
        customerId: communication.customerId,
        userId,
      });

      this.logger.log(`Deleted communication ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete communication ${id}:`, error);
      throw error;
    }
  }

  async batchLoadByIds(ids: readonly string[]): Promise<(Communication | Error)[]> {
    try {
      const communications = await this.communicationRepository.findByIds([...ids]);
      const communicationMap = new Map<string, Communication>();
      
      communications.forEach(comm => communicationMap.set(comm.id, comm));

      return ids.map(id => communicationMap.get(id) || new Error(`Communication not found: ${id}`));
    } catch (error) {
      return ids.map(() => error as Error);
    }
  }

  async batchLoadByCustomerIds(customerIds: readonly string[]): Promise<Communication[][]> {
    try {
      const communications = await this.communicationRepository.findByCustomerIds([...customerIds]);
      const communicationMap = new Map<string, Communication[]>();
      
      communications.forEach(comm => {
        if (!communicationMap.has(comm.customerId)) {
          communicationMap.set(comm.customerId, []);
        }
        communicationMap.get(comm.customerId)!.push(comm);
      });

      return customerIds.map(id => communicationMap.get(id) || []);
    } catch (error) {
      return customerIds.map(() => []);
    }
  }

  async batchLoadByEmployeeIds(employeeIds: readonly string[]): Promise<Communication[][]> {
    try {
      const communications = await this.communicationRepository.findByEmployeeIds([...employeeIds]);
      const communicationMap = new Map<string, Communication[]>();
      
      communications.forEach(comm => {
        if (comm.employeeId) {
          if (!communicationMap.has(comm.employeeId)) {
            communicationMap.set(comm.employeeId, []);
          }
          communicationMap.get(comm.employeeId)!.push(comm);
        }
      });

      return employeeIds.map(id => communicationMap.get(id) || []);
    } catch (error) {
      return employeeIds.map(() => []);
    }
  }

  private async invalidateCommunicationCaches(tenantId: string, customerId?: string): Promise<void> {
    try {
      await this.cacheService.invalidatePattern(`communications:${tenantId}:*`);
      
      if (customerId) {
        await this.cacheService.invalidatePattern(`communication-timeline:${tenantId}:${customerId}:*`);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate communication caches:`, error);
    }
  }
}
