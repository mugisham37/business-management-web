import { ObjectType, Field, ID, registerEnumType, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Enums
export enum CommunicationChannelType {
  SLACK = 'slack',
  TEAMS = 'teams',
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum EmailProviderType {
  SENDGRID = 'sendgrid',
  SES = 'ses',
  SMTP = 'smtp',
  MAILGUN = 'mailgun',
  POSTMARK = 'postmark',
}

export enum SMSProviderType {
  TWILIO = 'twilio',
  AWS_SNS = 'aws-sns',
  NEXMO = 'nexmo',
  MESSAGEBIRD = 'messagebird',
  PLIVO = 'plivo',
}

export enum ActionStyle {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
}

// Register enums with GraphQL
registerEnumType(CommunicationChannelType, {
  name: 'CommunicationChannelType',
  description: 'Available communication channel types',
});

registerEnumType(NotificationPriority, {
  name: 'NotificationPriority',
  description: 'Notification priority levels',
});

registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Alert severity levels',
});

registerEnumType(EmailProviderType, {
  name: 'EmailProviderType',
  description: 'Available email provider types',
});

registerEnumType(SMSProviderType, {
  name: 'SMSProviderType',
  description: 'Available SMS provider types',
});

registerEnumType(ActionStyle, {
  name: 'ActionStyle',
  description: 'Action button styles',
});

// Base Types
@ObjectType()
export class CommunicationChannel {
  @Field(() => CommunicationChannelType)
  type: CommunicationChannelType;

  @Field()
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  configuration?: any;

  @Field({ nullable: true })
  priority?: number;

  @Field(() => [String], { nullable: true })
  fallbackChannels?: string[];
}

@ObjectType()
export class CommunicationResult {
  @Field()
  channel: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  messageId?: string;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  recipientCount?: number;
}

@ObjectType()
export class BulkCommunicationResult {
  @Field()
  totalChannels: number;

  @Field()
  successfulChannels: number;

  @Field()
  failedChannels: number;

  @Field(() => [CommunicationResult])
  results: CommunicationResult[];

  @Field()
  overallSuccess: boolean;
}

@ObjectType()
export class NotificationAction {
  @Field(() => ID)
  id: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => ActionStyle, { nullable: true })
  style?: ActionStyle;
}

@ObjectType()
export class NotificationRecipients {
  @Field(() => [ID], { nullable: true })
  userIds?: string[];

  @Field(() => [String], { nullable: true })
  emails?: string[];

  @Field(() => [String], { nullable: true })
  phoneNumbers?: string[];

  @Field(() => [String], { nullable: true })
  slackChannels?: string[];

  @Field(() => [String], { nullable: true })
  teamsChannels?: string[];

  @Field(() => [String], { nullable: true })
  roles?: string[];
}

@ObjectType()
export class MultiChannelNotification {
  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationPriority)
  priority: NotificationPriority;

  @Field()
  type: string;

  @Field(() => [CommunicationChannelType])
  channels: CommunicationChannelType[];

  @Field(() => NotificationRecipients, { nullable: true })
  recipients?: NotificationRecipients;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field(() => [NotificationAction], { nullable: true })
  actions?: NotificationAction[];

  @Field({ nullable: true })
  templateName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  templateVariables?: Record<string, any>;

  @Field({ nullable: true })
  scheduledAt?: Date;
}

// Email Types
@ObjectType()
export class EmailAttachment {
  @Field()
  filename: string;

  @Field({ nullable: true })
  contentType?: string;

  @Field({ nullable: true })
  cid?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  content?: any;
}

@ObjectType()
export class EmailMessage {
  @Field(() => [String])
  to: string[];

  @Field(() => [String], { nullable: true })
  cc?: string[];

  @Field(() => [String], { nullable: true })
  bcc?: string[];

  @Field()
  subject: string;

  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  html?: string;

  @Field(() => [EmailAttachment], { nullable: true })
  attachments?: EmailAttachment[];

  @Field({ nullable: true })
  replyTo?: string;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;

  @Field(() => GraphQLJSON, { nullable: true })
  headers?: Record<string, string>;
}

@ObjectType()
export class EmailTemplate {
  @Field()
  name: string;

  @Field()
  subject: string;

  @Field()
  htmlTemplate: string;

  @Field({ nullable: true })
  textTemplate?: string;

  @Field(() => [String])
  variables: string[];

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class EmailProvider {
  @Field(() => EmailProviderType)
  type: EmailProviderType;

  @Field(() => GraphQLJSON)
  configuration: any;

  @Field()
  isEnabled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BulkEmailResult {
  @Field()
  totalSent: number;

  @Field()
  totalFailed: number;

  @Field(() => [EmailSendResult])
  results: EmailSendResult[];
}

@ObjectType()
export class EmailSendResult {
  @Field(() => ID)
  userId: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  messageId?: string;
}

// SMS Types
@ObjectType()
export class SMSMessage {
  @Field(() => [String])
  to: string[];

  @Field()
  message: string;

  @Field({ nullable: true })
  from?: string;

  @Field(() => [String], { nullable: true })
  mediaUrls?: string[];

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  validityPeriod?: number;

  @Field(() => NotificationPriority, { nullable: true })
  priority?: NotificationPriority;
}

@ObjectType()
export class SMSTemplate {
  @Field()
  name: string;

  @Field()
  message: string;

  @Field(() => [String])
  variables: string[];

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  maxLength?: number;
}

@ObjectType()
export class SMSProvider {
  @Field(() => SMSProviderType)
  type: SMSProviderType;

  @Field(() => GraphQLJSON)
  configuration: any;

  @Field()
  isEnabled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BulkSMSResult {
  @Field()
  totalSent: number;

  @Field()
  totalFailed: number;

  @Field(() => [SMSSendResult])
  results: SMSSendResult[];
}

@ObjectType()
export class SMSSendResult {
  @Field(() => ID)
  userId: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  messageId?: string;
}

// Slack Types
@ObjectType()
export class SlackAttachment {
  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  pretext?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  text?: string;

  @Field(() => [SlackField], { nullable: true })
  fields?: SlackField[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbUrl?: string;

  @Field({ nullable: true })
  footer?: string;

  @Field({ nullable: true })
  timestamp?: number;
}

@ObjectType()
export class SlackField {
  @Field()
  title: string;

  @Field()
  value: string;

  @Field({ nullable: true })
  short?: boolean;
}

@ObjectType()
export class SlackMessage {
  @Field()
  channel: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  iconEmoji?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field(() => [SlackAttachment], { nullable: true })
  attachments?: SlackAttachment[];

  @Field({ nullable: true })
  threadTs?: string;
}

@ObjectType()
export class SlackIntegrationConfig {
  @Field()
  webhookUrl: string;

  @Field({ nullable: true })
  botToken?: string;

  @Field({ nullable: true })
  defaultChannel?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  iconEmoji?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field({ nullable: true })
  enableThreads?: boolean;

  @Field({ nullable: true })
  enableMentions?: boolean;

  @Field(() => [String], { nullable: true })
  mentionUsers?: string[];

  @Field(() => [String], { nullable: true })
  mentionChannels?: string[];
}

// Teams Types
@ObjectType()
export class TeamsSection {
  @Field({ nullable: true })
  activityTitle?: string;

  @Field({ nullable: true })
  activitySubtitle?: string;

  @Field({ nullable: true })
  activityImage?: string;

  @Field(() => [TeamsFact], { nullable: true })
  facts?: TeamsFact[];

  @Field({ nullable: true })
  markdown?: boolean;

  @Field({ nullable: true })
  text?: string;
}

@ObjectType()
export class TeamsFact {
  @Field()
  name: string;

  @Field()
  value: string;
}

@ObjectType()
export class TeamsMessage {
  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  themeColor?: string;

  @Field(() => [TeamsSection], { nullable: true })
  sections?: TeamsSection[];
}

@ObjectType()
export class TeamsIntegrationConfig {
  @Field()
  webhookUrl: string;

  @Field({ nullable: true })
  defaultTitle?: string;

  @Field({ nullable: true })
  defaultThemeColor?: string;

  @Field({ nullable: true })
  enableMentions?: boolean;

  @Field(() => [String], { nullable: true })
  mentionUsers?: string[];

  @Field({ nullable: true })
  enableActivityImages?: boolean;

  @Field({ nullable: true })
  activityImageUrl?: string;
}

// Test Results
@ObjectType()
export class ChannelTestResult {
  @Field()
  channel: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  responseTime?: number;
}

@ObjectType()
export class IntegrationTestResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  messageId?: string;

  @Field({ nullable: true })
  responseTime?: number;
}

// Analytics Types
@ObjectType()
export class CommunicationStats {
  @Field()
  totalSent: number;

  @Field()
  totalFailed: number;

  @Field()
  successRate: number;

  @Field(() => GraphQLJSON)
  channelBreakdown: Record<string, number>;

  @Field(() => GraphQLJSON)
  priorityBreakdown: Record<string, number>;

  @Field()
  period: string;

  @Field()
  generatedAt: Date;
}

@ObjectType()
export class ChannelUsageStats {
  @Field(() => CommunicationChannelType)
  channel: CommunicationChannelType;

  @Field()
  totalMessages: number;

  @Field()
  successfulMessages: number;

  @Field()
  failedMessages: number;

  @Field()
  successRate: number;

  @Field()
  averageResponseTime: number;

  @Field()
  lastUsed?: Date;
}

// Subscription Types
@ObjectType()
export class CommunicationEvent {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field(() => CommunicationChannelType)
  channel: CommunicationChannelType;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  timestamp: Date;

  @Field(() => ID)
  tenantId: string;
}

@ObjectType()
export class NotificationDeliveryStatus {
  @Field(() => ID)
  notificationId: string;

  @Field(() => CommunicationChannelType)
  channel: CommunicationChannelType;

  @Field()
  status: string;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}