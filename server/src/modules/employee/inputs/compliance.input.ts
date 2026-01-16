import { InputType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsNumber,
  Length,
  Min,
  Max,
  IsArray,
  IsObject,
} from 'class-validator';

// Enums for GraphQL
export enum ComplianceCheckType {
  LABOR_LAW_COMPLIANCE = 'labor_law_compliance',
  BREAK_TIME_COMPLIANCE = 'break_time_compliance',
  OVERTIME_COMPLIANCE = 'overtime_compliance',
  SAFETY_COMPLIANCE = 'safety_compliance',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  VIOLATIONS_FOUND = 'violations_found',
  PENDING_REVIEW = 'pending_review',
  REMEDIATED = 'remediated',
}

export enum ViolationType {
  DAILY_HOURS_EXCEEDED = 'daily_hours_exceeded',
  WEEKLY_HOURS_EXCEEDED = 'weekly_hours_exceeded',
  INSUFFICIENT_BREAK_TIME = 'insufficient_break_time',
  INSUFFICIENT_BREAK_TIME_EXTENDED = 'insufficient_break_time_extended',
  CONSECUTIVE_WORK_DAYS_EXCEEDED = 'consecutive_work_days_exceeded',
  INSUFFICIENT_REST_PERIOD = 'insufficient_rest_period',
  OVERTIME_WITHOUT_APPROVAL = 'overtime_without_approval',
  SAFETY_VIOLATION = 'safety_violation',
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BreakType {
  MEAL_BREAK = 'meal_break',
  REST_BREAK = 'rest_break',
  PERSONAL_BREAK = 'personal_break',
  SMOKE_BREAK = 'smoke_break',
}

// Register enums for GraphQL
registerEnumType(ComplianceCheckType, {
  name: 'ComplianceCheckType',
  description: 'Type of compliance check performed',
});

registerEnumType(ComplianceStatus, {
  name: 'ComplianceStatus',
  description: 'Status of compliance check',
});

registerEnumType(ViolationType, {
  name: 'ViolationType',
  description: 'Type of labor law violation',
});

registerEnumType(ViolationSeverity, {
  name: 'ViolationSeverity',
  description: 'Severity level of violation',
});

registerEnumType(BreakType, {
  name: 'BreakType',
  description: 'Type of break',
});

// Compliance Check Input
@InputType({ description: 'Input for creating compliance check' })
export class CreateComplianceCheckInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsDateString()
  checkDate!: string;

  @Field(() => ComplianceCheckType)
  @IsEnum(ComplianceCheckType)
  checkType!: ComplianceCheckType;

  @Field(() => ComplianceStatus)
  @IsEnum(ComplianceStatus)
  status!: ComplianceStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalViolations?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  violations?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

@InputType({ description: 'Input for updating compliance check' })
export class UpdateComplianceCheckInput {
  @Field(() => ComplianceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalViolations?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Break Time Input
@InputType({ description: 'Input for recording break time' })
export class RecordBreakTimeInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsDateString()
  startTime!: string;

  @Field()
  @IsDateString()
  endTime!: string;

  @Field(() => BreakType)
  @IsEnum(BreakType)
  breakType!: BreakType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating break time record' })
export class UpdateBreakTimeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @Field(() => BreakType, { nullable: true })
  @IsOptional()
  @IsEnum(BreakType)
  breakType?: BreakType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Labor Law Violation Input
@InputType({ description: 'Input for recording labor law violation' })
export class RecordLaborLawViolationInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  complianceCheckId?: string;

  @Field(() => ViolationType)
  @IsEnum(ViolationType)
  violationType!: ViolationType;

  @Field()
  @IsDateString()
  violationDate!: string;

  @Field()
  @IsString()
  @Length(1, 500)
  description!: string;

  @Field(() => ViolationSeverity)
  @IsEnum(ViolationSeverity)
  severity!: ViolationSeverity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  correctedDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  correctedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

@InputType({ description: 'Input for updating labor law violation' })
export class UpdateLaborLawViolationInput {
  @Field(() => ViolationType, { nullable: true })
  @IsOptional()
  @IsEnum(ViolationType)
  violationType?: ViolationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @Field(() => ViolationSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(ViolationSeverity)
  severity?: ViolationSeverity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  correctedDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  correctedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Training Completion Input
@InputType({ description: 'Input for recording training completion' })
export class RecordTrainingCompletionInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  trainingName!: string;

  @Field()
  @IsDateString()
  completionDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificateNumber?: string;
}

// Certification Input
@InputType({ description: 'Input for recording certification' })
export class RecordCertificationInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field()
  @IsString()
  @Length(1, 255)
  issuingOrganization!: string;

  @Field()
  @IsDateString()
  issueDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  certificationNumber?: string;
}

// Compliance Report Query Input
@InputType({ description: 'Input for querying compliance reports' })
export class ComplianceReportQueryInput {
  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field(() => ComplianceCheckType, { nullable: true })
  @IsOptional()
  @IsEnum(ComplianceCheckType)
  checkType?: ComplianceCheckType;

  @Field(() => ViolationType, { nullable: true })
  @IsOptional()
  @IsEnum(ViolationType)
  violationType?: ViolationType;

  @Field(() => ViolationSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(ViolationSeverity)
  severity?: ViolationSeverity;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeRemediated?: boolean;
}

// Audit Trail Query Input
@InputType({ description: 'Input for querying audit trails' })
export class AuditTrailQueryInput {
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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  eventTypes?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

// Compliance Remediation Input
@InputType({ description: 'Input for compliance remediation' })
export class ComplianceRemediationInput {
  @Field(() => ID)
  @IsUUID()
  violationId!: string;

  @Field()
  @IsString()
  @Length(1, 1000)
  correctiveAction!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType({ description: 'Input for updating compliance remediation' })
export class UpdateComplianceRemediationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  correctiveAction?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  completedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Compliance Settings Input
@InputType({ description: 'Input for compliance settings' })
export class ComplianceSettingsInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  maxDailyHours?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  maxWeeklyHours?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxConsecutiveDays?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  minRestHours?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(480)
  minBreakTimeFor6Hours?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(480)
  minBreakTimeFor8Hours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableAutomaticChecks?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  notificationEmails?: string[];
}

// Query Inputs
@InputType({ description: 'Input for querying required training' })
export class RequiredTrainingQueryInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeCompleted?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  onlyOverdue?: boolean;
}

@InputType({ description: 'Input for querying certifications' })
export class CertificationsQueryInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  onlyActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;
}
