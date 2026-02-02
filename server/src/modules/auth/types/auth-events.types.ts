import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { GraphQLJSON } from 'graphql-scalars';

/**
 * Auth event types for subscriptions
 */
export enum AuthEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SOCIAL_PROVIDER_LINKED = 'SOCIAL_PROVIDER_LINKED',
  SOCIAL_PROVIDER_UNLINKED = 'SOCIAL_PROVIDER_UNLINKED',
  SECURITY_ALERT = 'SECURITY_ALERT',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
}

// Register enum for GraphQL
registerEnumType(AuthEventType, {
  name: 'AuthEventType',
  description: 'Types of authentication and authorization events',
});

/**
 * Auth event payload
 */
@ObjectType()
export class AuthEvent {
  @Field(() => AuthEventType)
  @ApiProperty({ description: 'Event type', enum: AuthEventType })
  type!: AuthEventType;

  @Field()
  @ApiProperty({ description: 'User ID associated with the event' })
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID associated with the event' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Event timestamp' })
  timestamp!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  @ApiProperty({ description: 'Event metadata', required: false })
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'IP address', required: false })
  ipAddress?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User agent', required: false })
  userAgent?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Event description', required: false })
  description?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Event severity level', required: false })
  severity?: string;
}