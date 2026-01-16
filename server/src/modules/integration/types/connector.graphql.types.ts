import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

export enum ConnectorCapability {
  SYNC = 'sync',
  WEBHOOK = 'webhook',
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  OAUTH = 'oauth',
  API_KEY = 'api_key',
}

registerEnumType(ConnectorCapability, { name: 'ConnectorCapability' });

@ObjectType()
export class ConnectorType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Connector ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Connector name' })
  name!: string;

  @Field()
  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Connector description', required: false })
  description?: string;

  @Field()
  @ApiProperty({ description: 'Connector type' })
  type!: string;

  @Field()
  @ApiProperty({ description: 'Connector version' })
  version!: string;

  @Field(() => [ConnectorCapability])
  @ApiProperty({ enum: ConnectorCapability, isArray: true, description: 'Connector capabilities' })
  capabilities!: ConnectorCapability[];

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Supported events' })
  supportedEvents!: string[];

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Supported operations' })
  supportedOperations!: string[];

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  @Field()
  @ApiProperty({ description: 'Is official connector' })
  isOfficial!: boolean;

  @Field()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}

@ObjectType()
export class ConnectorMetadataType {
  @Field()
  @ApiProperty({ description: 'Connector name' })
  name!: string;

  @Field()
  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @Field()
  @ApiProperty({ description: 'Description' })
  description!: string;

  @Field()
  @ApiProperty({ description: 'Connector type' })
  type!: string;

  @Field()
  @ApiProperty({ description: 'Version' })
  version!: string;

  @Field(() => [ConnectorCapability])
  @ApiProperty({ enum: ConnectorCapability, isArray: true })
  capabilities!: ConnectorCapability[];

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  supportedEvents!: string[];

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  supportedOperations!: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  documentationUrl?: string;

  @Field()
  @ApiProperty()
  isOfficial!: boolean;
}

@ObjectType()
export class ConnectorTestResult {
  @Field()
  @ApiProperty({ description: 'Test success status' })
  success!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message if failed', required: false })
  error?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Test details', required: false })
  details?: string;

  @Field()
  @ApiProperty({ description: 'Test timestamp' })
  timestamp!: Date;
}
