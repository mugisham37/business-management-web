import { z } from 'zod';

// Webhook status enum
export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
  SUSPENDED = 'suspended',
}

// Webhook event type enum
export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  SESSION_CREATED = 'session.created',
  SESSION_EXPIRED = 'session.expired',
  LOGIN_FAILED = 'login.failed',
  PASSWORD_CHANGED = 'password.changed',
  MFA_ENABLED = 'mfa.enabled',
  MFA_DISABLED = 'mfa.disabled',
}

// Delivery status enum
export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  ABANDONED = 'abandoned',
}

// Webhook entity schema
export const WebhookSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().nullable().optional(),
  status: z.nativeEnum(WebhookStatus).default(WebhookStatus.ACTIVE),

  // Configuration
  timeout: z.number().default(30000), // 30 seconds
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000), // 1 second

  // Headers
  headers: z.record(z.string()).default({}),

  // Metadata
  description: z.string().nullable().optional(),
  metadata: z.record(z.any()).default({}),

  // Statistics
  totalDeliveries: z.number().default(0),
  successfulDeliveries: z.number().default(0),
  failedDeliveries: z.number().default(0),
  lastDeliveryAt: z.date().nullable().optional(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type Webhook = z.infer<typeof WebhookSchema>;

// Webhook event entity schema
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.any()),

  // Metadata
  source: z.string().default('system'),
  version: z.string().default('1.0'),

  // Timestamps
  createdAt: z.date(),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

// Webhook delivery entity schema
export const WebhookDeliverySchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  eventId: z.string(),

  // Delivery details
  url: z.string().url(),
  method: z.string().default('POST'),
  headers: z.record(z.string()).default({}),
  payload: z.record(z.any()),

  // Response details
  status: z.nativeEnum(DeliveryStatus).default(DeliveryStatus.PENDING),
  httpStatus: z.number().nullable().optional(),
  responseBody: z.string().nullable().optional(),
  responseHeaders: z.record(z.string()).default({}),

  // Timing
  attemptNumber: z.number().default(1),
  deliveredAt: z.date().nullable().optional(),
  duration: z.number().nullable().optional(), // milliseconds

  // Error handling
  error: z.string().nullable().optional(),
  nextRetryAt: z.date().nullable().optional(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;

// Creation inputs
export const CreateWebhookSchema = WebhookSchema.omit({
  id: true,
  totalDeliveries: true,
  successfulDeliveries: true,
  failedDeliveries: true,
  lastDeliveryAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial({
  status: true,
  timeout: true,
  retryAttempts: true,
  retryDelay: true,
  headers: true,
  metadata: true,
});

export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;

export const CreateWebhookEventSchema = WebhookEventSchema.omit({
  id: true,
  createdAt: true,
}).partial({
  source: true,
  version: true,
});

export type CreateWebhookEventInput = z.infer<typeof CreateWebhookEventSchema>;

export const CreateWebhookDeliverySchema = WebhookDeliverySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  method: true,
  headers: true,
  status: true,
  responseHeaders: true,
  attemptNumber: true,
});

export type CreateWebhookDeliveryInput = z.infer<typeof CreateWebhookDeliverySchema>;

// Update inputs
export const UpdateWebhookSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateWebhookInput = z.infer<typeof UpdateWebhookSchema>;

export const UpdateWebhookDeliverySchema = WebhookDeliverySchema.omit({
  id: true,
  webhookId: true,
  eventId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateWebhookDeliveryInput = z.infer<typeof UpdateWebhookDeliverySchema>;

// Relations
export interface WebhookWithRelations extends Webhook {
  deliveries?: WebhookDelivery[];
  events?: WebhookEvent[];
}

export interface WebhookEventWithRelations extends WebhookEvent {
  deliveries?: WebhookDelivery[];
}

export interface WebhookDeliveryWithRelations extends WebhookDelivery {
  webhook?: Webhook;
  event?: WebhookEvent;
}
