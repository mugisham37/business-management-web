import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

@InputType()
export class OAuth2ConfigInput {
  @Field()
  @IsString()
  provider!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  additionalParams?: Record<string, any>;
}

@InputType()
export class OAuth2AuthorizeInput {
  @Field()
  @IsString()
  tenantId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shop?: string;
}

@InputType()
export class OAuth2CallbackInput {
  @Field()
  @IsString()
  code!: string;

  @Field()
  @IsString()
  state!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  error?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shop?: string;
}

@InputType()
export class OAuth2RefreshInput {
  @Field()
  @IsString()
  integrationId!: string;
}