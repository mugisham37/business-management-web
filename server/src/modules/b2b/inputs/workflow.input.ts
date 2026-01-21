import { InputType, Field, ID, Int } from '@nestjs/graphql';

/**
 * Workflow Input Types
 */

@InputType()
export class ApprovalStepInput {
  @Field(() => Int)
  stepNumber!: number;

  @Field(() => ID)
  approverId!: string;

  @Field({ nullable: true })
  approverName?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CreateWorkflowInput {
  @Field()
  workflowName!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  entityType!: string;

  @Field(() => ID)
  entityId!: string;

  @Field(() => [ApprovalStepInput])
  approvalSteps!: ApprovalStepInput[];

  @Field({ nullable: true })
  expiryDays?: number;
}

@InputType()
export class UpdateWorkflowInput {
  @Field(() => ID)
  workflowId!: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  completionNotes?: string;

  @Field({ nullable: true })
  cancellationReason?: string;
}

@InputType()
export class WorkflowQueryInput {
  @Field({ nullable: true })
  entityType?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => ID, { nullable: true })
  initiatedBy?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
