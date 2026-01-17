import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsEnum, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

// Enums
export enum EDIDocumentTypeEnum {
  PURCHASE_ORDER = '850',
  PURCHASE_ORDER_ACKNOWLEDGMENT = '855',
  ADVANCE_SHIP_NOTICE = '856',
  INVOICE = '810',
  FUNCTIONAL_ACKNOWLEDGMENT = '997',
  INVENTORY_INQUIRY = '846',
  PRICE_CATALOG = '832',
}

export enum EDITransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  ACKNOWLEDGED = 'acknowledged',
}

export enum EDIDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

registerEnumType(EDIDocumentTypeEnum, { name: 'EDIDocumentType' });
registerEnumType(EDITransactionStatus, { name: 'EDITransactionStatus' });
registerEnumType(EDIDirection, { name: 'EDIDirection' });

// Object Types
@ObjectType('EDIDocument')
export class EDIDocumentType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  supplierId!: string;

  @Field(() => EDIDocumentTypeEnum)
  documentType!: EDIDocumentTypeEnum;

  @Field(() => EDIDirection)
  direction!: EDIDirection;

  @Field(() => EDITransactionStatus)
  status!: EDITransactionStatus;

  @Field()
  rawContent!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  parsedContent?: any;

  @Field({ nullable: true })
  relatedEntityId?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field({ nullable: true })
  acknowledgedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType('EDIStatus')
export class EDIStatusType {
  @Field(() => ID)
  documentId!: string;

  @Field(() => EDITransactionStatus)
  status!: EDITransactionStatus;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  processedAt?: Date;
}

@ObjectType('EDIJobResponse')
export class EDIJobResponseType {
  @Field(() => ID)
  jobId!: string;

  @Field(() => ID)
  documentId!: string;

  @Field()
  message!: string;
}

// Input Types
@InputType()
export class SendEDIDocumentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  supplierId!: string;

  @Field(() => EDIDocumentTypeEnum)
  @IsEnum(EDIDocumentTypeEnum)
  documentType!: EDIDocumentTypeEnum;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  entityId!: string;
}

@InputType()
export class ReceiveEDIDocumentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  supplierId!: string;

  @Field(() => EDIDocumentTypeEnum)
  @IsEnum(EDIDocumentTypeEnum)
  documentType!: EDIDocumentTypeEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  rawContent!: string;
}

@InputType()
export class RetryEDIDocumentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  documentId!: string;
}
