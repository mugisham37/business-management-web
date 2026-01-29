import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class SocialAuthInput {
  @Field()
  @IsString()
  @ApiProperty({ description: 'Social provider (google, facebook)' })
  provider!: string;

  @Field()
  @IsString()
  @ApiProperty({ description: 'Provider user ID' })
  providerId!: string;

  @Field()
  @IsEmail()
  @ApiProperty({ description: 'User email from provider' })
  email!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Profile picture URL', required: false })
  picture?: string;

  @Field()
  @IsUUID()
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;
}

@InputType()
export class LinkSocialProviderInput {
  @Field()
  @IsString()
  @ApiProperty({ description: 'Social provider (google, facebook)' })
  provider!: string;

  @Field()
  @IsString()
  @ApiProperty({ description: 'Provider user ID' })
  providerId!: string;

  @Field()
  @IsEmail()
  @ApiProperty({ description: 'User email from provider' })
  email!: string;
}

@InputType()
export class UnlinkSocialProviderInput {
  @Field()
  @IsString()
  @ApiProperty({ description: 'Social provider to unlink (google, facebook)' })
  provider!: string;
}