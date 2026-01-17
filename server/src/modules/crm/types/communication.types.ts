import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class CommunicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  customerId!: string;

  @Field({ nullable: true })
  employeeId?: string;

  @Field()
  type!: string; // 'email', 'phone', 'meeting', 'note', 'sms'

  @Field()
  direction!: string; // 'inbound', 'outbound'

  @Field({ nullable: true })
  subject?: string;

  @Field()
  content!: string;

  @Field()
  status!: string; // 'scheduled', 'completed', 'cancelled'

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  outcome?: string;

  @Field()
  followUpRequired!: boolean;

  @Field({ nullable: true })
  followUpDate?: Date;

  @Field(() => Object)
  metadata!: Record<string, any>;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field()
  createdBy!: string;

  @Field()
  updatedBy!: string;
}

@ObjectType()
export class CommunicationSummary {
  @Field(() => ID)
  customerId!: string;

  @Field(() => Int)
  totalCommunications!: number;

  @Field(() => Int)
  emailCount!: number;

  @Field(() => Int)
  phoneCount!: number;

  @Field(() => Int)
  meetingCount!: number;

  @Field(() => Int)
  noteCount!: number;

  @Field(() => Int)
  smsCount!: number;

  @Field({ nullable: true })
  lastCommunicationDate?: Date;

  @Field({ nullable: true })
  lastCommunicationType?: string;

  @Field(() => Int)
  scheduledCommunications!: number;

  @Field(() => Int)
  completedCommunications!: number;

  @Field(() => Int)
  cancelledCommunications!: number;

  @Field(() => Int)
  followUpRequired!: number;
}

@ObjectType()
export class CommunicationMetrics {
  @Field(() => Int)
  totalCommunications!: number;

  @Field(() => Int)
  totalCustomersContacted!: number;

  @Field(() => Float)
  averageCommunicationsPerCustomer!: number;

  @Field(() => Float)
  responseRate!: number;

  @Field(() => Int)
  averageResponseTimeHours!: number;

  @Field(() => Int)
  scheduledCommunications!: number;

  @Field(() => Int)
  completedCommunications!: number;

  @Field(() => Int)
  cancelledCommunications!: number;

  @Field(() => Int)
  followUpsPending!: number;

  @Field(() => Float)
  completionRate!: number;
}