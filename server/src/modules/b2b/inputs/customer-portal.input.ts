import { InputType, Field, ID, Int } from '@nestjs/graphql';

/**
 * Customer Portal Input Types
 */

@InputType()
export class CustomerPortalSettingsInput {
  @Field(() => ID)
  customerId!: string;

  @Field({ nullable: true })
  portalTheme?: string;

  @Field({ nullable: true })
  orderApprovalRequired?: boolean;

  @Field({ nullable: true })
  emailNotificationsEnabled?: boolean;

  @Field({ nullable: true })
  autoReorderEnabled?: boolean;

  @Field({ nullable: true })
  metadata?: string;
}

@InputType()
export class CustomerPortalActivityInput {
  @Field(() => ID)
  customerId!: string;

  @Field()
  activityType!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  relatedEntityType?: string;

  @Field(() => ID, { nullable: true })
  relatedEntityId?: string;

  @Field({ nullable: true })
  metadata?: string;
}

@InputType()
export class CustomerPortalQueryInput {
  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  searchTerm?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
