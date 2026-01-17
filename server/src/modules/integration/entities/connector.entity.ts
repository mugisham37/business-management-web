export enum IntegrationType {
  ACCOUNTING = 'accounting',
  ECOMMERCE = 'ecommerce',
  PAYMENT = 'payment',
  CRM = 'crm',
  INVENTORY = 'inventory',
  SHIPPING = 'shipping',
  MARKETING = 'marketing',
  CUSTOM = 'custom',
}

export enum ConnectorCapability {
  READ = 'read',
  WRITE = 'write',
  SYNC = 'sync',
  WEBHOOK = 'webhook',
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  SEARCH = 'search',
  EXPORT = 'export',
  IMPORT = 'import',
}

export class Connector {
  id!: string;
  name!: string;
  displayName!: string;
  description?: string;
  type!: IntegrationType;
  version!: string;
  minVersion?: string;
  maxVersion?: string;
  configSchema!: any;
  authSchema!: any;
  capabilities!: ConnectorCapability[];
  supportedEvents!: string[];
  supportedOperations!: string[];
  documentationUrl?: string;
  exampleConfig!: Record<string, any>;
  isOfficial!: boolean;
  author?: string;
  license?: string;
  tags!: string[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}