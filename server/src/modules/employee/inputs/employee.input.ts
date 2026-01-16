import { InputType, Field, Float, Int, ID, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  IsDecimal,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums for GraphQL
export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  PROBATION = 'probation',
  SUSPENDED = 'suspended',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum PayFrequency {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  SEMI_MONTHLY = 'semi_monthly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum TimeEntryType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  HOLIDAY = 'holiday',
  SICK_LEAVE = 'sick_leave',
  VACATION = 'vacation',
  PERSONAL_LEAVE = 'personal_leave',
  TRAINING = 'training',
}

export enum PerformanceRating {
  OUTSTANDING = 'outstanding',
  EXCEEDS_EXPECTATIONS = 'exceeds_expectations',
  MEETS_EXPECTATIONS = 'meets_expectations',
  BELOW_EXPECTATIONS = 'below_expectations',
  UNSATISFACTORY = 'unsatisfactory',
}

// Register enums for GraphQL
registerEnumType(EmploymentStatus, {
  name: 'EmploymentStatus',
  description: 'Employment status of an employee',
});

registerEnumType(EmploymentType, {
  name: 'EmploymentType',
  description: 'Type of employment',
});

registerEnumType(PayFrequency, {
  name: 'PayFrequency',
  description: 'Frequency of pay',
});

registerEnumType(ScheduleStatus, {
  name: 'ScheduleStatus',
  description: 'Status of a scheduled shift',
});

registerEnumType(TimeEntryType, {
  name: 'TimeEntryType',
  description: 'Type of time entry',
});

registerEnumType(PerformanceRating, {
  name: 'PerformanceRating',
  description: 'Performance rating scale',
});

// Address Input
@InputType()
export class AddressInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;
}

// Create Employee Input
@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsString()
  @Length(1, 50)
  employeeNumber!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  lastName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  emergencyContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @Field(() => AddressInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInput)
  address?: AddressInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string;

  @Field()
  @IsString()
  @Length(1, 100)
  position!: string;

  @Field(() => EmploymentType, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @Field(() => EmploymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @Field()
  @IsDateString()
  hireDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  baseSalary?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  hourlyRate?: number;

  @Field(() => PayFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(PayFrequency)
  payFrequency?: PayFrequency;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  benefits?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

// Update Employee Input
@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  employeeNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  position?: string;

  @Field(() => EmploymentType, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @Field(() => EmploymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  baseSalary?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  hourlyRate?: number;

  @Field(() => PayFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(PayFrequency)
  payFrequency?: PayFrequency;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Employee Schedule Input
@InputType()
export class CreateEmployeeScheduleInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsDateString()
  scheduleDate!: string;

  @Field()
  @IsDateString()
  startTime!: string;

  @Field()
  @IsDateString()
  endTime!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  breakDuration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lunchBreakStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lunchBreakEnd?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scheduleType?: string;

  @Field(() => ScheduleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateEmployeeScheduleInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduleDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  breakDuration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lunchBreakStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lunchBreakEnd?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scheduleType?: string;

  @Field(() => ScheduleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Time Entry Input
@InputType()
export class CreateTimeEntryInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsDateString()
  clockInTime!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  clockOutTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  breakStartTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  breakEndTime?: string;

  @Field(() => TimeEntryType, { nullable: true })
  @IsOptional()
  @IsEnum(TimeEntryType)
  entryType?: TimeEntryType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateTimeEntryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  clockInTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  clockOutTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  breakStartTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  breakEndTime?: string;

  @Field(() => TimeEntryType, { nullable: true })
  @IsOptional()
  @IsEnum(TimeEntryType)
  entryType?: TimeEntryType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  totalHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  regularHours?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  overtimeHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isApproved?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adjustmentReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Clock In/Out Inputs
@InputType()
export class ClockInInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class ClockOutInput {
  @Field(() => ID)
  @IsUUID()
  timeEntryId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Performance Review Input
@InputType()
export class CreatePerformanceReviewInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID)
  @IsUUID()
  reviewerId!: string;

  @Field()
  @IsDateString()
  reviewPeriodStart!: string;

  @Field()
  @IsDateString()
  reviewPeriodEnd!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewType?: string;

  @Field(() => PerformanceRating, { nullable: true })
  @IsOptional()
  @IsEnum(PerformanceRating)
  overallRating?: PerformanceRating;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewerComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;
}

@InputType()
export class UpdatePerformanceReviewInput {
  @Field(() => PerformanceRating, { nullable: true })
  @IsOptional()
  @IsEnum(PerformanceRating)
  overallRating?: PerformanceRating;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewerComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;
}

// Training Record Input
@InputType()
export class CreateTrainingRecordInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  trainingName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trainingType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  provider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificationBody?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  score?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  passingScore?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  cost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  documents?: Record<string, any>[];
}

@InputType()
export class UpdateTrainingRecordInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trainingName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trainingType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  provider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificationBody?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  score?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  passingScore?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  cost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  documents?: Record<string, any>[];
}

// Employee Goal Input
@InputType()
export class CreateEmployeeGoalInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  targetDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  targetValue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  currentValue?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  metrics?: Record<string, any>[];

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  updates?: Record<string, any>[];
}

@InputType()
export class UpdateEmployeeGoalInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  targetValue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  currentValue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  metrics?: Record<string, any>[];

  @Field(() => [Object], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  updates?: Record<string, any>[];
}

// Query Inputs
@InputType()
export class EmployeeQueryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  position?: string;

  @Field(() => EmploymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @Field(() => EmploymentType, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string = 'lastName';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

@InputType()
export class TimeEntryQueryInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => TimeEntryType, { nullable: true })
  @IsOptional()
  @IsEnum(TimeEntryType)
  entryType?: TimeEntryType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isApproved?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
