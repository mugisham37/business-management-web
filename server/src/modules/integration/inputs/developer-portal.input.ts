import { InputType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt, IsDate, Min } from 'class-validator';

@InputType()
export class CreateAPIKeyInput {
  @Field()
  @ApiProperty({ description: 'API Key name' })
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Scopes' })
  @IsArray()
  @IsString({ each: true })
  scopes!: string[];

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Rate limit per hour', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimit?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Expiration date', required: false })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
