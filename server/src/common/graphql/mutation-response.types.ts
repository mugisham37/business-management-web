import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ErrorDetail {
  @Field()
  message!: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  field?: string;

  @Field()
  timestamp!: Date;
}

@ObjectType()
export class MutationResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => [ErrorDetail], { nullable: true })
  errors?: ErrorDetail[];

  @Field({ nullable: true })
  timestamp?: Date;
}