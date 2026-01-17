import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class Brand extends BaseEntity {
  @Field(() => ID)
  override id: string = '';

  @Field(() => ID)
  override tenantId: string = '';

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field()
  isActive!: boolean;

  @Field(() => Int, { nullable: true })
  productCount?: number;
}