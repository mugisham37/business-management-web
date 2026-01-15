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
}
