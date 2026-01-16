import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class LiveInventoryQueryInput {
  @Field(() => [ID])
  productIds!: string[];

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true, defaultValue: false })
  includeReserved?: boolean;

  @Field({ nullable: true, defaultValue: false })
  includeHistory?: boolean;
}

@InputType()
export class LiveSalesQueryInput {
  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true, defaultValue: false })
  includeVoided?: boolean;

  @Field({ nullable: true, defaultValue: false })
  includeRefunded?: boolean;
}

@InputType()
export class LiveCustomerActivityQueryInput {
  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;

  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field(() => [String], { nullable: true })
  activityTypes?: string[];

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class LiveAnalyticsQueryInput {
  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  metrics?: string[];

  @Field({ nullable: true, defaultValue: false })
  includeComparison?: boolean;
}

@InputType()
export class CreateAnalyticsAlertInput {
  @Field()
  type!: string;

  @Field()
  severity!: string;

  @Field()
  title!: string;

  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  data?: string;

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  threshold?: ThresholdInput;
}

@InputType()
export class ThresholdInput {
  @Field()
  metric!: string;

  @Field(() => Int)
  value!: number;

  @Field()
  operator!: string;
}

@InputType()
export class InventoryAlertConfigInput {
  @Field(() => [ID])
  productIds!: string[];

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field(() => Int)
  threshold!: number;

  @Field()
  alertType!: string;

  @Field({ defaultValue: true })
  enabled!: boolean;
}

@InputType()
export class SalesTargetInput {
  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field(() => Int)
  dailyTarget!: number;

  @Field(() => Int, { nullable: true })
  weeklyTarget?: number;

  @Field(() => Int, { nullable: true })
  monthlyTarget?: number;

  @Field({ defaultValue: true })
  enableAlerts!: boolean;
}
