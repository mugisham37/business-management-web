import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  IsEnum, 
  ValidateNested, 
  Min, 
  Max, 
  Length,
  IsUUID,
  IsInt,
  ArrayMinSize,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus, UnitOfMeasure } from '../types/product.types';

@InputType()
export class ProductDimensionsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;
}

@InputType()
export class ProductImageInput {
  @Field()
  @IsString()
  @IsUrl()
  url!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  alt?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

@InputType()
export class ProductVariantAttributeInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  value!: string;
}

@InputType()
export class CreateProductVariantInput {
  @Field()
  @IsString()
  @Length(1, 100)
  sku!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Field(() => [ProductVariantAttributeInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantAttributeInput)
  @ArrayMinSize(1)
  attributes!: ProductVariantAttributeInput[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field(() => ProductDimensionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsInput)
  dimensions?: ProductDimensionsInput;

  @Field(() => [ProductImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images?: ProductImageInput[];

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @Length(1, 100)
  sku!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  shortDescription?: string;

  @Field(() => ProductType, { nullable: true })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  msrp?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @Field(() => UnitOfMeasure, { nullable: true })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field(() => ProductDimensionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsInput)
  dimensions?: ProductDimensionsInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field(() => [ProductImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images?: ProductImageInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  primaryImageUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  supplierSku?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresBatchTracking?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresExpiryDate?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  shelfLife?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  launchedAt?: string;

  @Field(() => [CreateProductVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantInput)
  variants?: CreateProductVariantInput[];

  @Field(() => Object, { nullable: true })
  @IsOptional()
  attributes?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  shortDescription?: string;

  @Field(() => ProductType, { nullable: true })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  msrp?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @Field(() => UnitOfMeasure, { nullable: true })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field(() => ProductDimensionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsInput)
  dimensions?: ProductDimensionsInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field(() => [ProductImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images?: ProductImageInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  primaryImageUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  supplierSku?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresBatchTracking?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresExpiryDate?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  shelfLife?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  launchedAt?: string;

  @Field(() => [CreateProductVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantInput)
  variants?: CreateProductVariantInput[];

  @Field(() => Object, { nullable: true })
  @IsOptional()
  attributes?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;
}

@InputType()
export class ProductFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field(() => ProductType, { nullable: true })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tags?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

@InputType()
export class BulkUpdateProductsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  productIds!: string[];

  @Field(() => UpdateProductInput)
  @ValidateNested()
  @Type(() => UpdateProductInput)
  updates!: UpdateProductInput;
}