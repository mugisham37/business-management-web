import { InputType, Field, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, IsDate, IsBoolean } from 'class-validator';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @ApiProperty()
  @IsString()
  employeeNumber!: string;

  @Field()
  @ApiProperty()
  @IsString()
  firstName!: string;

  @Field()
  @ApiProperty()
  @IsString()
  lastName!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @Field()
  @ApiProperty()
  @IsString()
  position!: string;

  @Field()
  @ApiProperty()
  @IsString()
  employmentType!: string;

  @Field()
  @ApiProperty()
  @IsString()
  employmentStatus!: string;

  @Field()
  @ApiProperty()
  @IsDate()
  hireDate!: Date;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerId?: string;
}

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerId?: string;
}

@InputType()
export class EmployeeQueryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  page?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
