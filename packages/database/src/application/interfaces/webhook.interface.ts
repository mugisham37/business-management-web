import type {
  CreateWebhookDeliveryInput,
  CreateWebhookEventInput,
  CreateWebhookInput,
  UpdateWebhookDeliveryInput,
  UpdateWebhookInput,
  Webhook,
  WebhookDelivery,
  WebhookEvent,
  WebhookWithRelations,
} from '../../domain/entities/webhook';

// Webhook repository interface
export interface IWebhookRepository {
  // Basic CRUD operations
  create(webhookData: CreateWebhookInput): Promise<Webhook>;
  findById(id: string): Promise<Webhook | null>;
  findByUrl(url: string): Promise<Webhook | null>;
  update(id: string, webhookData: UpdateWebhookInput): Promise<Webhook>;
  delete(id: string): Promise<void>;

  // Advanced queries
  findMany(options?: FindManyWebhookOptions): Promise<Webhook[]>;
  findWithRelations(id: string): Promise<WebhookWithRelations | null>;
  findByIds(ids: string[]): Promise<Webhook[]>;

  // Event subscription management
  findByEvent(eventType: string): Promise<Webhook[]>;
  getActiveWebhooks(): Promise<Webhook[]>;

  // Status management
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  suspend(id: string): Promise<void>;

  // Statistics updates
  incrementDeliveryCount(id: string, success: boolean): Promise<void>;
  updateLastDelivery(id: string, deliveredAt: Date): Promise<void>;

  // Soft delete
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;

  // Statistics
  count(options?: CountWebhookOptions): Promise<number>;
  getWebhookStats(id: string): Promise<WebhookStats>;
}

// Webhook event repository interface
export interface IWebhookEventRepository {
  // Basic CRUD operations
  create(eventData: CreateWebhookEventInput): Promise<WebhookEvent>;
  findById(id: string): Promise<WebhookEvent | null>;
  findMany(options?: FindManyEventOptions): Promise<WebhookEvent[]>;

  // Event queries
  findByType(type: string, limit?: number): Promise<WebhookEvent[]>;
  findRecent(limit?: number): Promise<WebhookEvent[]>;
  findPending(): Promise<WebhookEvent[]>;

  // Cleanup
  deleteOldEvents(olderThan: Date): Promise<number>;

  // Statistics
  count(options?: CountEventOptions): Promise<number>;
  getEventStats(): Promise<EventStats>;
}

// Webhook delivery repository interface
export interface IWebhookDeliveryRepository {
  // Basic CRUD operations
  create(deliveryData: CreateWebhookDeliveryInput): Promise<WebhookDelivery>;
  findById(id: string): Promise<WebhookDelivery | null>;
  update(id: string, deliveryData: UpdateWebhookDeliveryInput): Promise<WebhookDelivery>;
  findMany(options?: FindManyDeliveryOptions): Promise<WebhookDelivery[]>;

  // Delivery status management
  markAsDelivered(id: string, response: DeliveryResponse): Promise<void>;
  markAsFailed(id: string, error: string, nextRetryAt?: Date): Promise<void>;
  markAsAbandoned(id: string): Promise<void>;

  // Retry management
  findPendingRetries(): Promise<WebhookDelivery[]>;
  incrementAttempt(id: string): Promise<void>;

  // Webhook and event queries
  findByWebhook(webhookId: string, options?: FindManyDeliveryOptions): Promise<WebhookDelivery[]>;
  findByEvent(eventId: string): Promise<WebhookDelivery[]>;

  // Cleanup
  deleteOldDeliveries(olderThan: Date): Promise<number>;

  // Statistics
  count(options?: CountDeliveryOptions): Promise<number>;
  getDeliveryStats(webhookId?: string): Promise<DeliveryStats>;
}

// Supporting types and interfaces
export interface FindManyWebhookOptions {
  where?: WebhookWhereInput;
  orderBy?: WebhookOrderByInput;
  skip?: number;
  take?: number;
  include?: WebhookIncludeInput;
}

export interface FindManyEventOptions {
  where?: EventWhereInput;
  orderBy?: EventOrderByInput;
  skip?: number;
  take?: number;
}

export interface FindManyDeliveryOptions {
  where?: DeliveryWhereInput;
  orderBy?: DeliveryOrderByInput;
  skip?: number;
  take?: number;
  include?: DeliveryIncludeInput;
}

export interface CountWebhookOptions {
  where?: WebhookWhereInput;
}

export interface CountEventOptions {
  where?: EventWhereInput;
}

export interface CountDeliveryOptions {
  where?: DeliveryWhereInput;
}

export interface WebhookWhereInput {
  id?: string | string[];
  url?: string | StringFilter;
  status?: string | string[];
  events?: string[] | ArrayFilter;
  createdAt?: DateFilter;
  updatedAt?: DateFilter;
  deletedAt?: DateFilter | null;
}

export interface EventWhereInput {
  id?: string | string[];
  type?: string | string[] | StringFilter;
  source?: string | StringFilter;
  createdAt?: DateFilter;
}

export interface DeliveryWhereInput {
  id?: string | string[];
  webhookId?: string | string[];
  eventId?: string | string[];
  status?: string | string[];
  httpStatus?: number | NumberFilter;
  attemptNumber?: number | NumberFilter;
  createdAt?: DateFilter;
  deliveredAt?: DateFilter | null;
}

export interface WebhookOrderByInput {
  id?: 'asc' | 'desc';
  url?: 'asc' | 'desc';
  status?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  lastDeliveryAt?: 'asc' | 'desc';
}

export interface EventOrderByInput {
  id?: 'asc' | 'desc';
  type?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

export interface DeliveryOrderByInput {
  id?: 'asc' | 'desc';
  status?: 'asc' | 'desc';
  attemptNumber?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  deliveredAt?: 'asc' | 'desc';
}

export interface WebhookIncludeInput {
  deliveries?: boolean;
  events?: boolean;
}

export interface DeliveryIncludeInput {
  webhook?: boolean;
  event?: boolean;
}

export interface StringFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'default' | 'insensitive';
}

export interface NumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
}

export interface ArrayFilter {
  has?: string;
  hasEvery?: string[];
  hasSome?: string[];
  isEmpty?: boolean;
}

export interface DateFilter {
  equals?: Date;
  in?: Date[];
  notIn?: Date[];
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
}

export interface DeliveryResponse {
  httpStatus: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  duration?: number;
}

export interface WebhookStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageResponseTime?: number;
  lastDeliveryAt?: Date;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
}

export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  averageAttempts: number;
  successRate: number;
  averageResponseTime?: number;
}
