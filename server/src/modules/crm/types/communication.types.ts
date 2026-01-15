import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsDate, IsObject } from 'class-validator';
import { BaseEntity } from '../../../common/graphql/base.types';
import { Customer } from '../entities/customer.entity';

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

@ObjectType()
export class CommunicationType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field()
  @ApiProperty()
  tenantId!: string;

  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  employeeId?: string;

  @Field(() => CommunicationTypeEnum)
  @ApiProperty({ enum: CommunicationTypeEnum })
  type!: CommunicationTypeEnum;

  @Field(() => CommunicationDirection)
  @ApiProperty({ enum: CommunicationDirection })
  direction!: CommunicationDirection;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  subject?: string;

  @Field()
  @ApiProperty()
  content!: string;

  @Field(() => CommunicationStatus)
  @ApiProperty({ enum: CommunicationStatus })
  status!: CommunicationStatus;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  scheduledAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  duration?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  outcome?: string;

  @Field()
  @ApiProperty()
  followUpRequired!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  followUpDate?: Date;

  @Field()
  @ApiProperty()
  createdAt!: Date;

  @Field()
  @ApiProperty()
  updatedAt!: Date;

  // Field resolvers
  @Field(() => Customer)
  @ApiProperty({ type: () => Customer })
  customer?: Customer;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ required: false })
  employee?: any;
}

@InputType()
export class CreateCommunicationInput {
  @Field(() => ID)
  @ApiProperty()
  @IsString()
  customerId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Field(() => CommunicationTypeEnum)
  @ApiProperty({ enum: CommunicationTypeEnum })
  @IsEnum(CommunicationTypeEnum)
  type!: CommunicationTypeEnum;

  @Field(() => CommunicationDirection)
  @ApiProperty({ enum: CommunicationDirection })
  @IsEnum(CommunicationDirection)
  direction!: CommunicationDirection;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field()
  @ApiProperty()
  @IsString()
  content!: string;

  @Field(() => CommunicationStatus, { nullable: true })
  @ApiProperty({ enum: CommunicationStatus, required: false })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  scheduledAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  duration?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  outcome?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  followUpDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

@InputType()
export class ScheduleCommunicationInput {
  @Field(() => ID)
  @ApiProperty()
  @IsString()
  customerId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @Field(() => CommunicationTypeEnum)
  @ApiProperty({ enum: CommunicationTypeEnum })
  @IsEnum(CommunicationTypeEnum)
  type!: CommunicationTypeEnum;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field()
  @ApiProperty()
  @IsString()
  content!: string;

  @Field()
  @ApiProperty()
  @IsDate()
  scheduledAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
