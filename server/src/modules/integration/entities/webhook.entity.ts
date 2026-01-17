export enum AuthType {
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  BASIC_AUTH = 'basic_auth',
  BEARER_TOKEN = 'bearer_token',
  CUSTOM = 'custom',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
  SUSPENDED = 'suspended',
}

export class Webhook {
  id!: string;
  integrationId!: string;
  name!: string;
  url!: string;
  method!: string;
  events!: string[];
  filters?: Record<string, any>;
  authType!: AuthType;
  authConfig!: Record<string, any>;
  secretKey?: string;
  headers!: Record<string, any>;
  timeout!: number;
  retryAttempts!: number;
  retryDelay!: number;
  status!: WebhookStatus;
  isActive!: boolean;
  successCount!: number;
  failureCount!: number;
  lastDeliveryAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  lastError?: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}

export class WebhookDelivery {
  id!: string;
  webhookId!: string;
  eventType!: string;
  payload!: any;
  headers!: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  responseHeaders!: Record<string, any>;
  deliveredAt?: Date;
  duration?: number;
  success!: boolean;
  error?: string;
  retryCount!: number;
  nextRetryAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}