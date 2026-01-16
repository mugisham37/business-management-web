import { ObjectType, Field, ID, InputType, Int, registerEnumType } from '@nestjs/graphql';

// ===== ENUMS =====

export enum CommunicationChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  TEAMS = 'teams',
  PUSH = 'push',
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

registerEnumType(CommunicationChannelType, {
  name: 'CommunicationChannelType',
  description: 'Communication channel type',
});

registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Alert severity level',
});

registerEnumType(EmailProviderType, {
  name: 'EmailProviderType',
  description: 'Email provider type',
});

registerEnumType(SMSProviderType, {
  name: 'SMSProviderType',
  description: 'SMS provider type',
});

// ===== ACTION INPUT TYPE =====

@InputType()
export class ActionInput {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  style?: 'primary' | 'secondary' | 'danger';
}

// ===== RECIPIENTS INPUT TYPE =====

@InputType()
export class RecipientsInput {
  @Field(() => [String], { nullable: true })
  userIds?: string[];

  @Field(() => [String], { nullable: true })
  emails?: string[];

  @Field(() => [String], { nullable: true })
  phoneNumbers?: string[];

  @Field(() => [String], { nullable: true })
  slackChannels?: string[];

  @Field(() => [String], { nullable: true })
  teamsChannels?: string[];
}

// ===== NOTIFICATION OPTIONS INPUT =====

@InputType()
export class NotificationOptionsInput {
  @Field({ nullable: true })
  enableFallback?: boolean;

  @Field(() => Int, { nullable: true })
  retryAttempts?: number;

  @Field(() => Int, { nullable: true })
  batchSize?: number;

  @Field(() => Int, { nullable: true })
  delayBetweenBatches?: number;
}

// ===== SEND EMAIL INPUT =====

@InputType()
export class SendEmailInput {
  @Field(() => [String])
  to!: string[];

  @Field()
  subject!: string;

  @Field()
  message!: string;

  @Field({ nullable: true })
  htmlContent?: string;

  @Field({ nullable: true })
  replyTo?: string;

  @Field({ nullable: true })
  priority?: 'high' | 'normal' | 'low';
}

// ===== SEND SMS INPUT =====

@InputType()
export class SendSMSInput {
  @Field(() => [String])
  to!: string[];

  @Field()
  message!: string;

  @Field({ nullable: true })
  from?: string;
}

// ===== SEND PUSH NOTIFICATION INPUT =====

@InputType()
export class SendPushNotificationInput {
  @Field(() => [ID])
  userIds!: string[];

  @Field()
  title!: string;

  @Field()
  message!: string;

  @Field({ nullable: true })
  data?: string; // JSON string

  @Field({ nullable: true })
  priority?: 'high' | 'normal' | 'low';
}

// ===== GET COMMUNICATION HISTORY INPUT =====

@InputType()
export class GetCommunicationHistoryInput {
  @Field(() => Int, { defaultValue: 50 })
  limit!: number;

  @Field(() => Int, { defaultValue: 0 })
  offset!: number;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

// ===== SEND MULTI-CHANNEL NOTIFICATION INPUT =====

@InputType()
export class SendMultiChannelNotificationInput {
  @Field()
  title!: string;

  @Field()
  message!: string;

  @Field()
  priority!: 'low' | 'medium' | 'high' | 'urgent';

  @Field()
  type!: string;

  @Field(() => [String])
  channels!: string[];

  @Field({ nullable: true })
  recipients?: RecipientsInput;

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string

  @Field(() => [ActionInput], { nullable: true })
  actions?: ActionInput[];

  @Field({ nullable: true })
  templateName?: string;

  @Field(() => String, { nullable: true })
  templateVariables?: string; // JSON string

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  options?: NotificationOptionsInput;
}

// ===== SEND ALERT INPUT =====

@InputType()
export class SendAlertInput {
  @Field()
  title!: string;

  @Field()
  message!: string;

  @Field(() => AlertSeverity)
  severity!: AlertSeverity;

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string

  @Field({ nullable: true })
  actionUrl?: string;

  @Field({ nullable: true })
  actionLabel?: string;

  @Field({ nullable: true })
  recipients?: RecipientsInput;
}

// ===== SEND BUSINESS NOTIFICATION INPUT =====

@InputType()
export class SendBusinessNotificationInput {
  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field()
  message!: string;

  @Field({ nullable: true })
  priority?: 'low' | 'medium' | 'high';

  @Field(() => String, { nullable: true })
  recipients?: string; // JSON string

  @Field(() => String, { nullable: true })
  metadata?: string; // JSON string

  @Field({ nullable: true })
  templateName?: string;

  @Field(() => String, { nullable: true })
  templateVariables?: string; // JSON string
}

// ===== COMMUNICATION CHANNEL INPUT =====

@InputType()
export class CommunicationChannelInput {
  @Field()
  type!: string;

  @Field()
  enabled!: boolean;

  @Field(() => String, { nullable: true })
  configuration?: string; // JSON string

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => [String], { nullable: true })
  fallbackChannels?: string[];
}

// ===== CONFIGURE COMMUNICATION CHANNELS INPUT =====

@InputType()
export class ConfigureCommunicationChannelsInput {
  @Field(() => [CommunicationChannelInput])
  channels!: CommunicationChannelInput[];
}

// ===== SLACK INTEGRATION INPUT =====

@InputType()
export class CreateSlackIntegrationInput {
  @Field()
  webhookUrl!: string;

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

// ===== TEAMS INTEGRATION INPUT =====

@InputType()
export class CreateTeamsIntegrationInput {
  @Field()
  webhookUrl!: string;

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

// ===== EMAIL PROVIDER INPUT =====

@InputType()
export class CreateEmailProviderInput {
  @Field(() => EmailProviderType)
  type!: EmailProviderType;

  @Field(() => String)
  configuration!: string; // JSON string
}

// ===== SMS PROVIDER INPUT =====

@InputType()
export class CreateSMSProviderInput {
  @Field(() => SMSProviderType)
  type!: SMSProviderType;

  @Field(() => String)
  configuration!: string; // JSON string
}

// ===== SENDGRID CONFIG INPUT =====

@InputType()
export class SendGridConfigInput {
  @Field()
  apiKey!: string;

  @Field()
  fromEmail!: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  replyToEmail?: string;

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  enableTracking?: boolean;

  @Field({ nullable: true })
  enableClickTracking?: boolean;

  @Field({ nullable: true })
  enableOpenTracking?: boolean;
}

// ===== TWILIO CONFIG INPUT =====

@InputType()
export class TwilioConfigInput {
  @Field()
  accountSid!: string;

  @Field()
  authToken!: string;

  @Field()
  fromNumber!: string;

  @Field({ nullable: true })
  messagingServiceSid?: string;

  @Field({ nullable: true })
  enableDeliveryReceipts?: boolean;

  @Field({ nullable: true })
  enableStatusCallbacks?: boolean;

  @Field({ nullable: true })
  callbackUrl?: string;
}

// ===== SMTP CONFIG INPUT =====

@InputType()
export class SMTPConfigInput {
  @Field()
  host!: string;

  @Field(() => Int)
  port!: number;

  @Field()
  secure!: boolean;

  @Field(() => String)
  auth!: string; // JSON string with user and pass

  @Field()
  fromEmail!: string;

  @Field({ nullable: true })
  fromName?: string;
}

// ===== RESPONSE TYPES =====

@ObjectType()
export class CommunicationResult {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => ID, { nullable: true })
  jobId?: string;

  @Field(() => Int, { nullable: true })
  recipientCount?: number;
}

@ObjectType()
export class CommunicationHistoryItem {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  channel!: string;

  @Field({ nullable: true })
  recipient?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  message!: string;

  @Field()
  status!: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  sentAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  failureReason?: string;
}

@ObjectType()
export class CommunicationHistory {
  @Field(() => [CommunicationHistoryItem])
  items!: CommunicationHistoryItem[];

  @Field(() => Int)
  totalCount!: number;

  @Field()
  hasMore!: boolean;
}
