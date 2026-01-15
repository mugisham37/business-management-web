import { InputType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUUID,
  Length,
} from 'class-validator';
import { BreakType } from '../dto/compliance.dto';

@InputType({ description: 'Input for recording training completion' })
export class RecordTrainingCompletionInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  trainingName!: string;

  @Field()
  @ApiProperty()
  @IsDateString()
  completionDate!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificateNumber?: string;
}

@InputType({ description: 'Input for recording certification' })
export class RecordCertificationInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  issuingOrganization!: string;

  @Field()
  @ApiProperty()
  @IsDateString()
  issueDate!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationNumber?: string;
}

@InputType({ description: 'Input for querying required training' })
export class RequiredTrainingQueryInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  includeCompleted?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  onlyOverdue?: boolean;
}

@InputType({ description: 'Input for querying certifications' })
export class CertificationsQueryInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  onlyActive?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;
}
