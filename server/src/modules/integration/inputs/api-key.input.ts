import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateApiKeyInput {
  @Field()
  @IsString()
  name!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 1000 })
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 3600 })
  @IsOptional()
  @IsNumber()
  rateLimitWindow?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}

@InputType()
export class UpdateApiKeyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}