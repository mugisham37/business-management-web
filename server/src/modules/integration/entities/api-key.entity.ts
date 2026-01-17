export class ApiKey {
  id!: string;
  tenantId!: string;
  integrationId?: string;
  name!: string;
  keyHash!: string;
  keyPrefix!: string;
  scopes!: string[];
  permissions!: string[];
  rateLimit!: number;
  rateLimitWindow!: number;
  requestCount!: number;
  lastUsedAt?: Date;
  isActive!: boolean;
  expiresAt?: Date;
  description?: string;
  ipWhitelist!: string[];
  userAgent?: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  createdBy!: string;
  updatedBy!: string;
}

export class ApiKeyUsage {
  id!: string;
  apiKeyId!: string;
  timestamp!: Date;
  requestCount!: number;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
}