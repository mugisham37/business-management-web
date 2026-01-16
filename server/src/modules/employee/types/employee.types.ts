import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';
import { EmploymentType, EmploymentStatus } from '../inputs/employee.input';

@ObjectType()
export class Employee extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  employeeNumber!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  department?: string;

  @Field()
  position!: string;

  @Field(() => EmploymentType)
  employmentType!: EmploymentType;

  @Field(() => EmploymentStatus)
  employmentStatus!: EmploymentStatus;

  @Field()
  hireDate!: Date;

  @Field({ nullable: true })
  terminationDate?: Date;

  @Field(() => Float, { nullable: true })
  baseSalary?: number;

  @Field(() => Float, { nullable: true })
  hourlyRate?: number;

  @Field(() => ID, { nullable: true })
  managerId?: string;

  @Field()
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

  @Field(() => Int)
  totalPages!: number;
}

@ObjectType()
export class EmployeeScheduleType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  scheduleDate!: Date;

  @Field()
  startTime!: Date;

  @Field()
  endTime!: Date;

  @Field(() => Int, { nullable: true })
  breakDuration?: number;

  @Field({ nullable: true })
  lunchBreakStart?: Date;

  @Field({ nullable: true })
  lunchBreakEnd?: Date;

  @Field({ nullable: true })
  scheduleType?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class TimeEntryType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  clockInTime!: Date;

  @Field({ nullable: true })
  clockOutTime?: Date;

  @Field({ nullable: true })
  breakStartTime?: Date;

  @Field({ nullable: true })
  breakEndTime?: Date;

  @Field({ nullable: true })
  entryType?: string;

  @Field(() => Float, { nullable: true })
  totalHours?: number;

  @Field(() => Float, { nullable: true })
  regularHours?: number;

  @Field(() => Float, { nullable: true })
  overtimeHours?: number;

  @Field({ nullable: true })
  isApproved?: boolean;

  @Field(() => ID, { nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class PerformanceReviewType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  reviewerId!: string;

  @Field()
  reviewPeriodStart!: Date;

  @Field()
  reviewPeriodEnd!: Date;

  @Field({ nullable: true })
  reviewType?: string;

  @Field({ nullable: true })
  overallRating?: string;

  @Field({ nullable: true })
  reviewerComments?: string;

  @Field({ nullable: true })
  employeeComments?: string;

  @Field({ nullable: true })
  nextReviewDate?: Date;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  acknowledgedAt?: Date;
}

@ObjectType()
export class TrainingRecordType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  trainingName!: string;

  @Field({ nullable: true })
  trainingType?: string;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  completionDate?: Date;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  certificateNumber?: string;

  @Field({ nullable: true })
  certificationBody?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field(() => Float, { nullable: true })
  passingScore?: number;

  @Field(() => Float, { nullable: true })
  cost?: number;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class EmployeeGoalType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field()
  startDate!: Date;

  @Field()
  targetDate!: Date;

  @Field({ nullable: true })
  completedDate?: Date;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  progress?: number;

  @Field(() => Float, { nullable: true })
  targetValue?: number;

  @Field(() => Float, { nullable: true })
  currentValue?: number;

  @Field(() => ID, { nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lastReviewDate?: Date;
}
