/**
 * Shared Interfaces
 */

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Interface
export interface Auditable {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// Timestamped Interface
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// Soft Delete Interface
export interface SoftDeletable {
  deletedAt?: Date;
  isDeleted: boolean;
}

// Pagination Interface
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Sort Interface
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter Interface
export interface FilterParams {
  [key: string]: any;
}

// Search Interface
export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

// Event Interface
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: any;
  metadata: {
    timestamp: Date;
    userId?: string;
    correlationId?: string;
    causationId?: string;
  };
}

// Repository Interface
export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(params?: SearchParams): Promise<PaginationResult<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Service Interface
export interface Service {
  readonly name: string;
  readonly version: string;
}

// Health Check Interface
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  details?: Record<string, any>;
}
