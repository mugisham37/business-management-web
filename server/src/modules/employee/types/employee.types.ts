import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class Employee extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  userId?: string;

  @Field()
  @ApiProperty()
  employeeNumber!: string;

  @Field()
  @ApiProperty()
  firstName!: string;

  @Field()
  @ApiProperty()
  lastName!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  middleName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  displayName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  email?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  phone?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  department?: string;

  @Field()
  @ApiProperty()
  position!: string;

  @Field()
  @ApiProperty()
  employmentType!: string;

  @Field()
  @ApiProperty()
  employmentStatus!: string;

  @Field()
  @ApiProperty()
  hireDate!: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  terminationDate?: Date;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  baseSalary?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  hourlyRate?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  managerId?: string;

  @Field()
  @ApiProperty()
  isActive!: boolean;

  // Field resolvers
  @Field(() => Employee, { nullable: true })
  manager?: Employee;

  @Field(() => [Employee], { nullable: true })
  directReports?: Employee[];
}

@ObjectType()
export class EmployeeConnection {
  @Field(() => [Employee])
  employees!: Employee[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}
