import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConflictResolutionStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

@InputType({ description: 'Input for syncing offline transactions' })
export class SyncOfflineTransactionsInput {
  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Device ID to sync (optional, syncs all if not provided)' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

@InputType({ description: 'Input for resolving sync conflicts' })
export class ResolveConflictInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Conflict ID' })
  @IsString()
  conflictId!: string;

  @Field()
  @ApiProperty({ description: 'Resolution strategy', enum: ['server_wins', 'client_wins', 'merge', 'manual'] })
  @IsString()
  strategy!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ description: 'Resolved data (required for manual strategy)' })
  @IsOptional()
  resolvedData?: any;
}
