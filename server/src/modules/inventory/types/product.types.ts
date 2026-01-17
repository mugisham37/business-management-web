import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';

// Enums
export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  GROUPED = 'grouped',
  DIGITAL = 'digital',
  SERVICE = 'service',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum UnitOfMeasure {
  PIECE = 'piece',
  KILOGRAM = 'kilogram',
  GRAM = 'gram',
  LITER = 'liter',
  MILLILITER = 'milliliter',
  METER = 'meter',
  CENTIMETER = 'centimeter',
  SQUARE_METER = 'square_meter',
  CUBIC_METER = 'cubic_meter',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
}

// Register enums for GraphQL
registerEnumType(ProductType, { name: 'ProductType' });
registerEnumType(ProductStatus, { name: 'ProductStatus' });
registerEnumType(UnitOfMeasure, { name: 'UnitOfMeasure' });

@ObjectType()
export class ProductDimensions {
  @Field(() => Float, { nullable: true })
  length?: number;

  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field({ nullable: true })
  unit?: string;
}

@ObjectType()
export class ProductImage {
  @Field()
  url!: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isPrimary?: boolean;
}

@ObjectType()
export class ProductVariantAttribute {
  @Field()
  name!: string;

  @Field()
  value!: string;
}

@ObjectType()
export class ProductVariant extends BaseEntity {
  @Field(() => ID)
  override id: string = '';

  @Field(() => ID)
  productId!: string;

  @Field()
  sku!: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => [ProductVariantAttribute])
  attributes!: ProductVariantAttribute[];

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => ProductDimensions, { nullable: true })
  dimensions?: ProductDimensions;

  @Field(() => [ProductImage], { nullable: true })
  images?: ProductImage[];

  @Field(() => ProductStatus)
  status!: ProductStatus;

  @Field(() => Int)
  minStockLevel!: number;

  @Field(() => Int, { nullable: true })
  maxStockLevel?: number;

  @Field(() => Int)
  reorderPoint!: number;

  @Field(() => Int)
  reorderQuantity!: number;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class Product extends BaseEntity {
  @Field(() => ID)
  override id: string = '';

  @Field(() => ID)
  override tenantId: string = '';

  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field(() => ProductType)
  type!: ProductType;

  @Field(() => ProductStatus)
  status!: ProductStatus;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  brandId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Float)
  basePrice!: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  msrp?: number;

  @Field()
  trackInventory!: boolean;

  @Field(() => UnitOfMeasure)
  unitOfMeasure!: UnitOfMeasure;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => ProductDimensions, { nullable: true })
  dimensions?: ProductDimensions;

  @Field()
  taxable!: boolean;

  @Field(() => ID, { nullable: true })
  taxCategoryId?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [ProductImage], { nullable: true })
  images?: ProductImage[];

  @Field({ nullable: true })
  primaryImageUrl?: string;

  @Field(() => ID, { nullable: true })
  supplierId?: string;

  @Field({ nullable: true })
  supplierSku?: string;

  @Field(() => Int)
  minStockLevel!: number;

  @Field(() => Int, { nullable: true })
  maxStockLevel?: number;

  @Field(() => Int)
  reorderPoint!: number;

  @Field(() => Int)
  reorderQuantity!: number;

  @Field()
  requiresBatchTracking!: boolean;

  @Field()
  requiresExpiryDate!: boolean;

  @Field(() => Int, { nullable: true })
  shelfLife?: number;

  @Field()
  isFeatured!: boolean;

  @Field()
  allowBackorders!: boolean;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  launchedAt?: Date;

  @Field({ nullable: true })
  discontinuedAt?: Date;

  @Field(() => [ProductVariant], { nullable: true })
  variants?: ProductVariant[];

  // Field resolvers will populate these
  @Field(() => Object, { nullable: true })
  category?: any;

  @Field(() => Object, { nullable: true })
  brand?: any;

  @Field(() => Object, { nullable: true })
  supplier?: any;
}