import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { BaseEntity } from '../../../common/graphql/base.types';
import {
  ComplianceCheckType,
  ComplianceStatus,
  ViolationType,
  ViolationSeverity,
  BreakType,
} from '../inputs/compliance.input';

@ObjectType({ description: 'Compliance check record' })
export class ComplianceCheckGQL extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  checkDate!: Date;

  @Field(() => ComplianceCheckType)
  checkType!: ComplianceCheckType;

  @Field(() => ComplianceStatus)
  status!: ComplianceStatus;

  @Field(() => Int, { nullable: true })
  totalViolations?: number;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Break time record' })
export class BreakTimeRecordType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  startTime!: Date;

  @Field()
  endTime!: Date;

  @Field(() => BreakType)
  breakType!: BreakType;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  isPaid?: boolean;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Labor law violation record' })
export class LaborLawViolationType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  complianceCheckId?: string;

  @Field(() => ViolationType)
  violationType!: ViolationType;

  @Field()
  violationDate!: Date;

  @Field()
  description!: string;

  @Field(() => ViolationSeverity)
  severity!: ViolationSeverity;

  @Field({ nullable: true })
  correctiveAction?: string;

  @Field({ nullable: true })
  correctedDate?: Date;

  @Field(() => ID, { nullable: true })
  correctedBy?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Training requirement record' })
export class TrainingRequirement extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  trainingName!: string;

  @Field()
  dueDate!: Date;

  @Field({ nullable: true })
  completionDate?: Date;

  @Field({ nullable: true })
  certificationNumber?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Training completion record' })
export class TrainingCompletionType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  trainingName!: string;

  @Field()
  completionDate!: Date;

  @Field({ nullable: true })
  certificateNumber?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Certification record' })
export class Certification extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  name!: string;

  @Field()
  issuingOrganization!: string;

  @Field()
  issueDate!: Date;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field({ nullable: true })
  certificationNumber?: string;

  @Field({ nullable: true })
  isActive!: boolean;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: 'Compliance remediation record' })
export class ComplianceRemediationType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  violationId!: string;

  @Field()
  correctiveAction!: string;

  @Field({ nullable: true })
  targetCompletionDate?: Date;

  @Field(() => ID, { nullable: true })
  assignedTo?: string;

  @Field({ nullable: true })
  completedDate?: Date;

  @Field(() => ID, { nullable: true })
  completedBy?: string;

  @Field({ nullable: true })
  completionNotes?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType({ description: 'Compliance status summary' })
export class ComplianceStatusType extends BaseEntity {
  @Field(() => ID)
  declare id: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  isCompliant!: boolean;

  @Field(() => Int)
  totalViolations!: number;

  @Field(() => Int)
  openViolations!: number;

  @Field(() => Int)
  resolvedViolations!: number;

  @Field(() => [LaborLawViolationType], { nullable: true })
  recentViolations?: LaborLawViolationType[];

  @Field(() => [TrainingRequirement], { nullable: true })
  requiredTraining?: TrainingRequirement[];

  @Field(() => [Certification], { nullable: true })
  certifications?: Certification[];

  @Field({ nullable: true })
  lastCheckDate?: Date;
}
