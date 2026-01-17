import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsUUID,
  IsInt,
  Min,
  Length,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreateCategoryInput {
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
  @Length(1, 255)
  slug?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  iconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  attributes?: Record<string, any>;
}

@InputType()
export class UpdateCategoryInput {
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
  @Length(1, 255)
  slug?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  iconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

@InputType()
export class CategoryFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number;
}