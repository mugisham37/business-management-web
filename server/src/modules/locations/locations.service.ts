import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Location } from '@prisma/client';

export interface CreateLocationDto {
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'warehouse' | 'store';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface UpdateLocationDto {
  name?: string;
  code?: string;
  type?: 'headquarters' | 'branch' | 'warehouse' | 'store';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

/**
 * Locations Service for location management
 * 
 * Features:
 * - Location CRUD operations
 * - User-location assignments
 * - Organization-scoped location queries
 * 
 * Requirements: 10.1
 */
@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new location for an organization
   * 
   * @param organizationId - Organization ID
   * @param dto - Location creation data
   * @returns Created location
   */
  async create(organizationId: string, dto: CreateLocationDto): Promise<Location> {
    try {
      // Check if location code already exists in organization
      const existing = await this.prisma.location.findUnique({
        where: {
          organizationId_code: {
            organizationId,
            code: dto.code,
          },
        },
      });

      if (existing) {
        throw new ForbiddenException(`Location code '${dto.code}' already exists in this organization`);
      }

      const location = await this.prisma.location.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          type: dto.type,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          country: dto.country,
          postalCode: dto.postalCode,
          phone: dto.phone,
          email: dto.email,
        },
      });

      this.logger.log(`Location created: ${location.id} (${location.code}) for organization ${organizationId}`);

      return location;
    } catch (error) {
      this.logger.error('Failed to create location:', error);
      throw error;
    }
  }

  /**
   * Find location by ID within organization context
   * 
   * @param id - Location ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Location or null
   */
  async findById(id: string, organizationId: string): Promise<Location | null> {
    try {
      return await this.prisma.location.findFirst({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find location by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all locations for an organization
   * 
   * @param organizationId - Organization ID
   * @param includeInactive - Whether to include inactive locations
   * @returns Array of locations
   */
  async findByOrganization(organizationId: string, includeInactive = false): Promise<Location[]> {
    try {
      return await this.prisma.location.findMany({
        where: {
          organizationId,
          ...(includeInactive ? {} : { isActive: true }),
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find locations for organization: ${organizationId}`, error);
      throw error;
    }
  }

  /**
   * Update location
   * 
   * @param id - Location ID
   * @param organizationId - Organization ID for tenant isolation
   * @param dto - Update data
   * @returns Updated location
   */
  async update(id: string, organizationId: string, dto: UpdateLocationDto): Promise<Location> {
    try {
      // Verify location exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Location not found: ${id}`);
      }

      // If code is being changed, check for conflicts
      if (dto.code && dto.code !== existing.code) {
        const codeExists = await this.prisma.location.findUnique({
          where: {
            organizationId_code: {
              organizationId,
              code: dto.code,
            },
          },
        });

        if (codeExists) {
          throw new ForbiddenException(`Location code '${dto.code}' already exists in this organization`);
        }
      }

      const location = await this.prisma.location.update({
        where: { id },
        data: dto,
      });

      this.logger.log(`Location updated: ${id}`);

      return location;
    } catch (error) {
      this.logger.error(`Failed to update location: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete location (soft delete by setting isActive to false)
   * 
   * @param id - Location ID
   * @param organizationId - Organization ID for tenant isolation
   */
  async delete(id: string, organizationId: string): Promise<void> {
    try {
      // Verify location exists and belongs to organization
      const existing = await this.findById(id, organizationId);
      if (!existing) {
        throw new NotFoundException(`Location not found: ${id}`);
      }

      // Soft delete by setting isActive to false
      await this.prisma.location.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Location deleted (soft): ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete location: ${id}`, error);
      throw error;
    }
  }

  /**
   * Assign user to location
   * Creates a UserLocation record linking the user to the location
   * 
   * @param userId - User ID
   * @param locationId - Location ID
   * @param organizationId - Organization ID for tenant isolation
   * @param assignedById - ID of user performing the assignment
   * @param isPrimary - Whether this is the user's primary location
   * @returns Created UserLocation record
   */
  async assignUserToLocation(
    userId: string,
    locationId: string,
    organizationId: string,
    assignedById: string,
    isPrimary = false,
  ) {
    try {
      // Verify location exists and belongs to organization
      const location = await this.findById(locationId, organizationId);
      if (!location) {
        throw new NotFoundException(`Location not found: ${locationId}`);
      }

      // Check if assignment already exists
      const existing = await this.prisma.userLocation.findUnique({
        where: {
          userId_locationId: {
            userId,
            locationId,
          },
        },
      });

      if (existing) {
        // If already assigned, just update isPrimary if needed
        if (isPrimary && !existing.isPrimary) {
          return await this.prisma.userLocation.update({
            where: { id: existing.id },
            data: { isPrimary: true },
          });
        }
        return existing;
      }

      // If setting as primary, unset other primary locations for this user
      if (isPrimary) {
        await this.prisma.userLocation.updateMany({
          where: {
            userId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      const userLocation = await this.prisma.userLocation.create({
        data: {
          userId,
          locationId,
          assignedById,
          isPrimary,
        },
      });

      this.logger.log(`User ${userId} assigned to location ${locationId}${isPrimary ? ' (primary)' : ''}`);

      return userLocation;
    } catch (error) {
      this.logger.error(`Failed to assign user to location: ${userId} -> ${locationId}`, error);
      throw error;
    }
  }

  /**
   * Remove user from location
   * Deletes the UserLocation record
   * 
   * @param userId - User ID
   * @param locationId - Location ID
   * @param organizationId - Organization ID for tenant isolation
   */
  async removeUserFromLocation(
    userId: string,
    locationId: string,
    organizationId: string,
  ): Promise<void> {
    try {
      // Verify location exists and belongs to organization
      const location = await this.findById(locationId, organizationId);
      if (!location) {
        throw new NotFoundException(`Location not found: ${locationId}`);
      }

      // Check if assignment exists
      const existing = await this.prisma.userLocation.findUnique({
        where: {
          userId_locationId: {
            userId,
            locationId,
          },
        },
      });

      if (!existing) {
        throw new NotFoundException(`User ${userId} is not assigned to location ${locationId}`);
      }

      await this.prisma.userLocation.delete({
        where: {
          userId_locationId: {
            userId,
            locationId,
          },
        },
      });

      this.logger.log(`User ${userId} removed from location ${locationId}`);
    } catch (error) {
      this.logger.error(`Failed to remove user from location: ${userId} -> ${locationId}`, error);
      throw error;
    }
  }

  /**
   * Get all locations assigned to a user
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Array of locations with assignment details
   */
  async getUserLocations(userId: string, organizationId: string) {
    try {
      const userLocations = await this.prisma.userLocation.findMany({
        where: {
          userId,
          location: {
            organizationId,
          },
        },
        include: {
          location: true,
        },
        orderBy: [
          { isPrimary: 'desc' }, // Primary location first
          { location: { name: 'asc' } },
        ],
      });

      return userLocations.map((ul) => ({
        ...ul.location,
        isPrimary: ul.isPrimary,
        assignedAt: ul.assignedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get user locations: ${userId}`, error);
      throw error;
    }
  }
}
