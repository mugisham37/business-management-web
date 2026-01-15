import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate } from 'class-validator';

/**
 * Grant permission input
 */
@InputType()
export class GrantPermissionInput {
  @Field()
  @ApiProperty({ description: 'User ID to grant permission to' })
  @IsString()
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Permission name' })
  @IsString()
  permission!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource ID', required: false })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Permission expiration date', required: false })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}

/**
 * Revoke permission input
 */
@InputType()
export class RevokePermissionInput {
  @Field()
  @ApiProperty({ description: 'User ID to revoke permission from' })
  @IsString()
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Permission name' })
  @IsString()
  permission!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource ID', required: false })
  @IsOptional()
  @IsString()
  resourceId?: string;
}

/**
 * Assign role input
 */
@InputType()
export class AssignRoleInput {
  @Field()
  @ApiProperty({ description: 'User ID to assign role to' })
  @IsString()
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Role name' })
  @IsString()
  role!: string;
}

/**
 * Create role input
 */
@InputType()
export class CreateRoleInput {
  @Field()
  @ApiProperty({ description: 'Role name' })
  @IsString()
  name!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Permissions for this role', type: [String] })
  permissions!: string[];
}

/**
 * Update role permissions input
 */
@InputType()
export class UpdateRolePermissionsInput {
  @Field()
  @ApiProperty({ description: 'Role name' })
  @IsString()
  role!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'New permissions for this role', type: [String] })
  permissions!: string[];
}
