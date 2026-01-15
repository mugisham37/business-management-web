import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';
import {
  ComplianceCheckType as ComplianceCheckTypeEnum,
  ComplianceStatus as ComplianceStatusEnum,
  ViolationType,
  ViolationSeverity,
  BreakType,
} from '../dto/compliance.dto';

// Register enums for GraphQL
registerEnumType(ComplianceCheckTypeEnum, {
  name: 'ComplianceCheckType',
  description: 'Type of compliance check performed',
});

registerEnumType(ComplianceStatusEnum, {
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

@ObjectType({ description: 'Compliance check record' })
export class ComplianceCheckGQL extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  checkDate!: Date;

  @Field(() => ComplianceCheckTypeEnum)
  @ApiProperty({ enum: ComplianceCheckTypeEnum })
  checkType!: ComplianceCheckTypeEnum;

  @Field(() => ComplianceStatusEnum)
  @ApiProperty({ enum: ComplianceStatusEnum })
  status!: ComplianceStatusEnum;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  totalViolations?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  notes?: string;
}

@ObjectType({ description: 'Break time record' })
export class BreakTimeRecordType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  startTime!: Date;

  @Field()
  @ApiProperty()
  endTime!: Date;

  @Field(() => BreakType)
  @ApiProperty({ enum: BreakType })
  breakType!: BreakType;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  duration?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  isPaid?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  location?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  notes?: string;
}

@ObjectType({ description: 'Labor law violation record' })
export class LaborLawViolationType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  complianceCheckId?: string;

  @Field(() => ViolationType)
  @ApiProperty({ enum: ViolationType })
  violationType!: ViolationType;

  @Field()
  @ApiProperty()
  violationDate!: Date;

  @Field()
  @ApiProperty()
  description!: string;

  @Field(() => ViolationSeverity)
  @ApiProperty({ enum: ViolationSeverity })
  severity!: ViolationSeverity;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  correctiveAction?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  correctedDate?: Date;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  correctedBy?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  notes?: string;
}

@ObjectType({ description: 'Training requirement' })
export class TrainingRequirement {
  @Field(() => ID)
  @ApiProperty()
  id!: string;

  @Field()
  @ApiProperty()
  name!: string;

  @Field()
  @ApiProperty()
  description!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  dueDate?: Date;

  @Field()
  @ApiProperty()
  isRequired!: boolean;

  @Field()
  @ApiProperty()
  isCompleted!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  completedDate?: Date;
}

@ObjectType({ description: 'Certification record' })
export class Certification extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  name!: string;

  @Field()
  @ApiProperty()
  issuingOrganization!: string;

  @Field()
  @ApiProperty()
  issueDate!: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  expirationDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  certificationNumber?: string;

  @Field()
  @ApiProperty()
  isActive!: boolean;
}

@ObjectType({ description: 'Compliance status summary' })
export class ComplianceStatus {
  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  isCompliant!: boolean;

  @Field(() => Int)
  @ApiProperty()
  totalViolations!: number;

  @Field(() => Int)
  @ApiProperty()
  openViolations!: number;

  @Field(() => Int)
  @ApiProperty()
  resolvedViolations!: number;

  @Field(() => [LaborLawViolationType])
  @ApiProperty({ type: [LaborLawViolationType] })
  recentViolations!: LaborLawViolationType[];

  @Field(() => [TrainingRequirement])
  @ApiProperty({ type: [TrainingRequirement] })
  requiredTraining!: TrainingRequirement[];

  @Field(() => [Certification])
  @ApiProperty({ type: [Certification] })
  certifications!: Certification[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  lastCheckDate?: Date;
}
