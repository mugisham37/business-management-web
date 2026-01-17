import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  SYNC_TRIGGER = 'sync_trigger',
  WEBHOOK_CREATE = 'webhook_create',
  WEBHOOK_UPDATE = 'webhook_update',
  WEBHOOK_DELETE = 'webhook_delete',
  API_KEY_CREATE = 'api_key_create',
  API_KEY_REVOKE = 'api_key_revoke',
  CONFIG_UPDATE = 'config_update',
}

registerEnumType(AuditAction, { name: 'AuditAction' });

@ObjectType()
export class AuditLogType {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  integrationId!: string;

  @Field(() => AuditAction)
  action!: AuditAction;

  @Field()
  entityType!: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field({ nullable: true })
  oldValues?: string;

  @Field({ nullable: true })
  newValues?: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  userEmail?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  timestamp!: Date;
}

@ObjectType()
export class AuditSummaryType {
  @Field()
  integrationId!: string;

  @Field()
  totalActions!: number;

  @Field()
  lastActivity!: Date;

  @Field(() => [AuditActionCountType])
  actionCounts!: AuditActionCountType[];

  @Field(() => [UserActivityType])
  userActivity!: UserActivityType[];
}

@ObjectType()
export class AuditActionCountType {
  @Field(() => AuditAction)
  action!: AuditAction;

  @Field()
  count!: number;
}

@ObjectType()
export class UserActivityType {
  @Field()
  userId!: string;

  @Field()
  userEmail!: string;

  @Field()
  actionCount!: number;

  @Field()
  lastActivity!: Date;
}