import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Permission type
 */
@ObjectType()
export class Permission {
  @Field(() => ID)
  @ApiProperty({ description: 'Permission ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'User ID' })
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Permission name' })
  permission!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource type', required: false })
  resource?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Resource ID', required: false })
  resourceId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User who granted the permission', required: false })
  grantedBy?: string;

  @Field()
  @ApiProperty({ description: 'When the permission was granted' })
  grantedAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'When the permission expires', required: false })
  expiresAt?: Date;

  @Field()
  @ApiProperty({ description: 'Whether the permission is inherited from role' })
  isInherited!: boolean;
}

/**
 * Role type
 */
@ObjectType()
export class Role {
  @Field()
  @ApiProperty({ description: 'Role name' })
  name!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Permissions associated with this role', type: [String] })
  permissions!: string[];
}

/**
 * User permissions response
 */
@ObjectType()
export class UserPermissionsResponse {
  @Field(() => [String])
  @ApiProperty({ description: 'List of permission strings', type: [String] })
  permissions!: string[];

  @Field()
  @ApiProperty({ description: 'User role' })
  role!: string;

  @Field(() => [Permission])
  @ApiProperty({ description: 'Detailed permission objects', type: [Permission] })
  detailedPermissions!: Permission[];

  @Field()
  @ApiProperty({ description: 'Whether permissions include inherited role permissions' })
  includesInherited!: boolean;
}

/**
 * Permission check response
 */
@ObjectType()
export class PermissionCheckResponse {
  @Field()
  @ApiProperty({ description: 'Whether user has the permission' })
  hasPermission!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Source of permission (role, direct, inherited)', required: false })
  source?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Permission expiration date', required: false })
  expiresAt?: Date;
}

/**
 * Bulk permission operation response
 */
@ObjectType()
export class BulkPermissionResponse {
  @Field()
  @ApiProperty({ description: 'Number of users affected' })
  affectedUsers!: number;

  @Field()
  @ApiProperty({ description: 'Number of permissions processed' })
  processedPermissions!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'List of failed user IDs', type: [String] })
  failedUsers!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Error messages for failed operations', type: [String] })
  errors!: string[];
}

/**
 * Available permissions response
 */
@ObjectType()
export class AvailablePermissionsResponse {
  @Field(() => [String])
  @ApiProperty({ description: 'All available permission strings', type: [String] })
  permissions!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Available resource types', type: [String] })
  resources!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Available actions', type: [String] })
  actions!: string[];
}
