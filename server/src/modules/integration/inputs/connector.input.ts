import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsObject, IsArray, IsEnum } from 'class-validator';
import { IntegrationType } from '../types/integration.graphql.types';

@InputType()
export class CreateConnectorInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  displayName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => IntegrationType)
  @IsEnum(IntegrationType)
  type!: IntegrationType;

  @Field()
  @IsString()
  version!: string;

  @Field()
  @IsObject()
  configSchema!: any;

  @Field()
  @IsObject()
  authSchema!: any;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  capabilities!: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  supportedEvents!: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  supportedOperations!: string[];
}

@InputType()
export class ConnectorFilterInput {
  @Field(() => IntegrationType, { nullable: true })
  @IsOptional()
  @IsEnum(IntegrationType)
  type?: IntegrationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class InstallConnectorInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => Object)
  @IsObject()
  config!: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;
}

@InputType()
export class ConfigureConnectorInput {
  @Field(() => Object)
  @IsObject()
  config!: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;
}

@InputType()
export class UpdateConnectorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
