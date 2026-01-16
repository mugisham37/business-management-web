import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { MessagePriority, UserStatus } from '../types/realtime.types';

@InputType()
export class UpdateUserStatusInput {
  @Field(() => UserStatus)
  status!: UserStatus;

  @Field({ nullable: true })
  customMessage?: string;
}

@InputType()
export class JoinRoomInput {
  @Field()
  roomName!: string;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
export class LeaveRoomInput {
  @Field()
  roomName!: string;
}

@InputType()
export class DirectMessageInput {
  @Field(() => ID)
  recipientId!: string;

  @Field()
  content!: string;

  @Field(() => MessagePriority, { defaultValue: MessagePriority.MEDIUM })
  priority!: MessagePriority;

  @Field(() => String, { nullable: true })
  metadata?: string;
}

@InputType()
export class RoomMessageInput {
  @Field()
  roomName!: string;

  @Field()
  content!: string;

  @Field(() => MessagePriority, { defaultValue: MessagePriority.MEDIUM })
  priority!: MessagePriority;

  @Field(() => String, { nullable: true })
  metadata?: string;
}

@InputType()
export class GetOnlineUsersInput {
  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;

  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;

  @Field({ nullable: true })
  roomName?: string;
}

@InputType()
export class GetMessageHistoryInput {
  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;

  @Field(() => ID, { nullable: true })
  recipientId?: string;

  @Field({ nullable: true })
  roomName?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class TypingIndicatorInput {
  @Field(() => ID, { nullable: true })
  recipientId?: string;

  @Field({ nullable: true })
  roomName?: string;

  @Field()
  isTyping!: boolean;
}

@InputType()
export class MessageReactionInput {
  @Field(() => ID)
  messageId!: string;

  @Field()
  emoji!: string;

  @Field({ defaultValue: true })
  add!: boolean;
}

@InputType()
export class MarkMessageReadInput {
  @Field(() => [ID])
  messageIds!: string[];
}
