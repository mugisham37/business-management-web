import { InputType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsBoolean, IsDate, IsObject, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum CommunicationTypeEnum {
  EMAIL = 'email',
  PHONE = 'phone',
  MEETING = 'meeting',
  NOTE = 'note',
  SMS = 'sms',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CommunicationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(CommunicationTypeEnum, {
  name: 'CommunicationTypeEnum',
});

registerEnumType(CommunicationDirection, {
  name: 'CommunicationDirection',
});

registerEnumType(CommunicationStatus, {
  name: 'CommunicationStatus',
});

@InputType()
export class CreateCommunicationInput {
  @Field(() => ID)
  @IsString()
  customerId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Field(() => CommunicationTypeEnum)
  @IsEnum(CommunicationTypeEnum)
  type!: CommunicationTypeEnum;

  @Field(() => CommunicationDirection)
  @IsEnum(CommunicationDirection)
  direction!: CommunicationDirection;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field()
  @IsString()
  content!: string;

  @Field(() => CommunicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outcome?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  followUpDate?: Date;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateCommunicationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => CommunicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outcome?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  followUpDate?: Date;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class ScheduleCommunicationInput {
  @Field(() => ID)
  @IsString()
  customerId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Field(() => CommunicationTypeEnum)
  @IsEnum(CommunicationTypeEnum)
  type!: CommunicationTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field()
  @IsString()
  content!: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class CommunicationFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Field(() => CommunicationTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(CommunicationTypeEnum)
  type?: CommunicationTypeEnum;

  @Field(() => CommunicationDirection, { nullable: true })
  @IsOptional()
  @IsEnum(CommunicationDirection)
  direction?: CommunicationDirection;

  @Field(() => CommunicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
