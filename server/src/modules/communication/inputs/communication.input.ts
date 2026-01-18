import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsEmail, IsPhoneNumber, IsUrl, IsOptional, IsEnum, IsString, IsBoolean, IsArray, IsNumber, Min, Max, IsDateString } from 'class-validator';
import {
  CommunicationChannelType,
  NotificationPriority,
  AlertSeverity,
  EmailProviderType,
  SMSProviderType,
  ActionStyle,
} from '../types/communication.types';

// Base Input Types
@InputType()
export class NotificationActionInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field()
  @IsString()
  label: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field(() => ActionStyle, { nullable: true })
  @IsOptional()
  @IsEnum(ActionStyle)
  style?: ActionStyle;
}

@InputType()
export class NotificationRecipientsInput {
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(null, { each: true })
  phoneNumbers?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  slackChannels?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamsChannels?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

@InputType()
export class NotificationOptionsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableFallback?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  retryAttempts?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  batchSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60000)
  delayBetweenBatches?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(300000)
  timeout?: number;
}

// Multi-Channel Notification Input
@InputType()
export class MultiChannelNotificationInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => NotificationPriority)
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @Field()
  @IsString()
  type: string;

  @Field(() => [CommunicationChannelType])
  @IsArray()
  @IsEnum(CommunicationChannelType, { each: true })
  channels: CommunicationChannelType[];

  @Field(() => NotificationRecipientsInput, { nullable: true })
  @IsOptional()
  recipients?: NotificationRecipientsInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [NotificationActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  actions?: NotificationActionInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  templateName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  templateVariables?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @Field(() => NotificationOptionsInput, { nullable: true })
  @IsOptional()
  options?: NotificationOptionsInput;
}

// Alert Input
@InputType()
export class AlertInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => AlertSeverity)
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionLabel?: string;

  @Field(() => NotificationRecipientsInput, { nullable: true })
  @IsOptional()
  recipients?: NotificationRecipientsInput;
}

// Business Notification Input
@InputType()
export class BusinessNotificationInput {
  @Field()
  @IsString()
  type: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => NotificationPriority, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @Field(() => NotificationRecipientsInput, { nullable: true })
  @IsOptional()
  recipients?: NotificationRecipientsInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  templateName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  templateVariables?: Record<string, any>;
}

// Email Input Types
@InputType()
export class EmailAttachmentInput {
  @Field()
  @IsString()
  filename: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contentType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cid?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  content?: any;
}

@InputType()
export class EmailMessageInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @Field()
  @IsString()
  subject: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  html?: string;

  @Field(() => [EmailAttachmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: EmailAttachmentInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @Field(() => NotificationPriority, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  headers?: Record<string, string>;
}

@InputType()
export class EmailNotificationInput {
  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @Field(() => NotificationPriority, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  templateName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  templateVariables?: Record<string, any>;

  @Field(() => [EmailAttachmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: EmailAttachmentInput[];
}

@InputType()
export class EmailTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  htmlTemplate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  textTemplate?: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;
}

@InputType()
export class EmailProviderConfigInput {
  @Field(() => EmailProviderType)
  @IsEnum(EmailProviderType)
  type: EmailProviderType;

  @Field(() => GraphQLJSON)
  configuration: any;
}

// SMS Input Types
@InputType()
export class SMSMessageInput {
  @Field(() => [String])
  @IsArray()
  @IsPhoneNumber(null, { each: true })
  to: string[];

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  from?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  validityPeriod?: number;

  @Field(() => NotificationPriority, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;
}

@InputType()
export class SMSNotificationInput {
  @Field()
  @IsString()
  message: string;

  @Field(() => NotificationPriority, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  templateName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  templateVariables?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}

@InputType()
export class SMSTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1600)
  maxLength?: number;
}

@InputType()
export class SMSProviderConfigInput {
  @Field(() => SMSProviderType)
  @IsEnum(SMSProviderType)
  type: SMSProviderType;

  @Field(() => GraphQLJSON)
  configuration: any;
}

@InputType()
export class OTPInput {
  @Field()
  @IsPhoneNumber()
  phoneNumber: string;

  @Field()
  @IsString()
  otp: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  validityMinutes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandName?: string;
}

// Slack Input Types
@InputType()
export class SlackFieldInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  value: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  short?: boolean;
}

@InputType()
export class SlackAttachmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pretext?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field(() => [SlackFieldInput], { nullable: true })
  @IsOptional()
  @IsArray()
  fields?: SlackFieldInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  thumbUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  footer?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

@InputType()
export class SlackMessageInput {
  @Field()
  @IsString()
  channel: string;

  @Field()
  @IsString()
  text: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  iconEmoji?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @Field(() => [SlackAttachmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: SlackAttachmentInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  threadTs?: string;
}

@InputType()
export class SlackNotificationInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => NotificationPriority)
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @Field()
  @IsString()
  type: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  channel?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [NotificationActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  actions?: NotificationActionInput[];
}

@InputType()
export class SlackAlertInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => AlertSeverity)
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  channel?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionUsers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  mentionChannel?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class SlackIntegrationConfigInput {
  @Field()
  @IsUrl()
  webhookUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  botToken?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultChannel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  iconEmoji?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableThreads?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableMentions?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionUsers?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionChannels?: string[];
}

// Teams Input Types
@InputType()
export class TeamsFactInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  value: string;
}

@InputType()
export class TeamsSectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  activityTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  activitySubtitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  activityImage?: string;

  @Field(() => [TeamsFactInput], { nullable: true })
  @IsOptional()
  @IsArray()
  facts?: TeamsFactInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  markdown?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;
}

@InputType()
export class TeamsMessageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  themeColor?: string;

  @Field(() => [TeamsSectionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  sections?: TeamsSectionInput[];
}

@InputType()
export class TeamsNotificationInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => NotificationPriority)
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @Field()
  @IsString()
  type: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => [NotificationActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  actions?: NotificationActionInput[];
}

@InputType()
export class TeamsAlertInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => AlertSeverity)
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionLabel?: string;
}

@InputType()
export class TeamsRichCardInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  themeColor?: string;

  @Field(() => [TeamsSectionInput])
  @IsArray()
  sections: TeamsSectionInput[];

  @Field(() => [NotificationActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  actions?: NotificationActionInput[];
}

@InputType()
export class TeamsIntegrationConfigInput {
  @Field()
  @IsUrl()
  webhookUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultThemeColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableMentions?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionUsers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableActivityImages?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  activityImageUrl?: string;
}

// Channel Configuration Input
@InputType()
export class CommunicationChannelConfigInput {
  @Field(() => CommunicationChannelType)
  @IsEnum(CommunicationChannelType)
  type: CommunicationChannelType;

  @Field()
  @IsBoolean()
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  configuration?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @Field(() => [CommunicationChannelType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CommunicationChannelType, { each: true })
  fallbackChannels?: CommunicationChannelType[];
}

// Filter and Pagination Inputs
@InputType()
export class CommunicationStatsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Field(() => [CommunicationChannelType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CommunicationChannelType, { each: true })
  channels?: CommunicationChannelType[];

  @Field(() => [NotificationPriority], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationPriority, { each: true })
  priorities?: NotificationPriority[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];
}

@InputType()
export class CommunicationEventFilterInput {
  @Field(() => [CommunicationChannelType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CommunicationChannelType, { each: true })
  channels?: CommunicationChannelType[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  successOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  since?: Date;
}