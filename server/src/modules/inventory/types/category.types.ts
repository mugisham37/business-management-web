import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class Category extends BaseEntity {
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

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Int)
  level!: number;

  @Field({ nullable: true })
  path?: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field()
  isVisible!: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field()
  isActive!: boolean;

  @Field(() => [Category], { nullable: true })
  children?: Category[];

  @Field(() => Category, { nullable: true })
  parent?: Category;

  @Field(() => Int, { nullable: true })
  productCount?: number;
}