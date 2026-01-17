import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsInt, IsDate, Min } from 'class-validator';

@InputType()
export class CreateAPIKeyInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  scopes!: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
