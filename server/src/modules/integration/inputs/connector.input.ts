import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

@InputType()
export class InstallConnectorInput {
  @Field()
  @ApiProperty({ description: 'Connector type' })
  @IsString()
  type!: string;

  @Field()
  @ApiProperty({ description: 'Connector name' })
  @IsString()
  name!: string;

  @Field(() => Object)
  @ApiProperty({ description: 'Connector configuration' })
  @IsObject()
  config!: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;
}

@InputType()
export class ConfigureConnectorInput {
  @Field(() => Object)
  @ApiProperty({ description: 'Connector configuration' })
  @IsObject()
  config!: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;
}

@InputType()
export class UpdateConnectorInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Display name', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
