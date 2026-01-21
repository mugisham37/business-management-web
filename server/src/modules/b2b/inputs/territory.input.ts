import { InputType, Field, ID, Int } from '@nestjs/graphql';

/**
 * Territory Input Types
 */

@InputType()
export class CreateTerritoryInput {
  @Field()
  territoryName!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  territoryCode!: string;

  @Field(() => ID)
  salesRepId!: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  metadata?: string;
}

@InputType()
export class UpdateTerritoryInput {
  @Field(() => ID)
  territoryId!: string;

  @Field({ nullable: true })
  territoryName?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  salesRepId?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class TerritoryQueryInput {
  @Field(() => ID, { nullable: true })
  salesRepId?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
