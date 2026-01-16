import { ObjectType, Field, ID, InputType, Int, registerEnumType } from '@nestjs/graphql';

// ===== ENUMS =====

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'Notification delivery status',
});

registerEnumType(NotificationPriority, {
  name: 'NotificationPriority',
  description: 'Notification priority level',
});

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Notification type',
});

// ===== OBJECT TYPES =====

@ObjectType()
export class Notification {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  recipientId!: string;

  @Field()
  type!: string;

  @Field()
  channel!: string;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  message!: string;

  @Field(() => NotificationStatus)
  status!: NotificationStatus;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  sentAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  readAt?: Date;

  @Field(() => Int)
  deliveryAttempts!: number;

  @Field({ nullable: true })
  failureReason?: string;

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class NotificationConnection {
  @Field(() => [Notification])
  nodes!: Notification[];

  @Field(() => Int)
  totalCount!: number;

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class MarkNotificationReadResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Notification, { nullable: true })
  notification?: Notification;
}

@ObjectType()
export class DeleteNotificationResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

// ===== INPUT TYPES =====

@InputType()
export class GetNotificationsInput {
  @Field(() => Int, { defaultValue: 50 })
  limit!: number;

  @Field(() => Int, { defaultValue: 0 })
  offset!: number;

  @Field({ nullable: true })
  type?: string;

  @Field(() => NotificationStatus, { nullable: true })
  status?: NotificationStatus;

  @Field({ defaultValue: false })
  unreadOnly!: boolean;
}

@InputType()
export class MarkNotificationReadInput {
  @Field(() => ID)
  notificationId!: string;
}

@InputType()
export class DeleteNotificationInput {
  @Field(() => ID)
  notificationId!: string;
}
// ===== ACTION INPUT TYPE =====

@InputType()
export class NotificationActionInput {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  style?: 'primary' | 'secondary' | 'danger';
}

// ===== CREATE NOTIFICATION INPUT =====

@InputType()
export class CreateNotificationInput {
  @Field()
  type!: string;

  @Field(() => [ID])
  recipients!: string[];

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  message!: string;

  @Field({ nullable: true })
  htmlContent?: string;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field(() => [String], { nullable: true })
  channels?: string[];

  @Field(() => String, { nullable: true })
  variables?: string; // JSON string

  @Field(() => [NotificationActionInput], { nullable: true })
  actions?: NotificationActionInput[];

  @Field({ nullable: true })
  groupId?: string;

  @Field({ nullable: true })
  threadId?: string;

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string
}

// ===== CREATE TEMPLATE INPUT =====

@InputType()
export class CreateTemplateInput {
  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  channel!: string;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  bodyTemplate!: string;

  @Field({ nullable: true })
  htmlTemplate?: string;

  @Field(() => [String])
  variables!: string[];

  @Field({ defaultValue: true })
  isActive!: boolean;

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string
}

// ===== NOTIFICATION PREFERENCE INPUT =====

@InputType()
export class NotificationPreferenceInput {
  @Field()
  notificationType!: string;

  @Field()
  channel!: string;

  @Field()
  isEnabled!: boolean;

  @Field({ nullable: true })
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';

  @Field({ nullable: true })
  quietHoursStart?: string;

  @Field({ nullable: true })
  quietHoursEnd?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field(() => String, { nullable: true })
  settings?: string; // JSON string
}

// ===== UPDATE PREFERENCES INPUT =====

@InputType()
export class UpdatePreferencesInput {
  @Field({ nullable: true })
  userId?: string;

  @Field(() => [NotificationPreferenceInput])
  preferences!: NotificationPreferenceInput[];
}

// ===== REGISTER DEVICE TOKEN INPUT =====

@InputType()
export class RegisterDeviceTokenInput {
  @Field()
  token!: string;

  @Field()
  platform!: 'ios' | 'android' | 'web';

  @Field({ nullable: true })
  deviceId?: string;

  @Field({ nullable: true })
  appVersion?: string;
}

// ===== NOTIFICATION HISTORY QUERY INPUT =====

@InputType()
export class NotificationHistoryQueryInput {
  @Field(() => Int, { defaultValue: 50 })
  limit!: number;

  @Field(() => Int, { defaultValue: 0 })
  offset!: number;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ defaultValue: false })
  unreadOnly!: boolean;
}

// ===== NOTIFICATION STATS QUERY INPUT =====

@InputType()
export class NotificationStatsQueryInput {
  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  userId?: string;
}

// ===== BULK NOTIFICATION INPUT =====

@InputType()
export class BulkNotificationInput {
  @Field(() => [CreateNotificationInput])
  notifications!: CreateNotificationInput[];

  @Field(() => String, { nullable: true })
  options?: string; // JSON string
}

// ===== NOTIFICATION WEBHOOK INPUT =====

@InputType()
export class NotificationWebhookInput {
  @Field()
  url!: string;

  @Field(() => [String])
  events!: string[];

  @Field({ nullable: true })
  secret?: string;

  @Field({ defaultValue: true })
  isActive!: boolean;
}

// ===== NOTIFICATION STATS OBJECT TYPE =====

@ObjectType()
export class ChannelStats {
  @Field(() => Int)
  sent!: number;

  @Field(() => Int)
  delivered!: number;

  @Field(() => Int)
  failed!: number;

  @Field()
  deliveryRate!: number;
}

@ObjectType()
export class NotificationStats {
  @Field(() => Int)
  totalSent!: number;

  @Field(() => Int)
  totalDelivered!: number;

  @Field(() => Int)
  totalRead!: number;

  @Field(() => Int)
  totalFailed!: number;

  @Field()
  deliveryRate!: number;

  @Field()
  readRate!: number;

  @Field(() => String)
  byChannel!: string; // JSON string

  @Field(() => String)
  byType!: string; // JSON string
}