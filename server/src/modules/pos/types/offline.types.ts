import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

// Enums
export enum OfflineOperationType {
  CREATE_TRANSACTION = 'create_transaction',
  UPDATE_TRANSACTION = 'update_transaction',
  VOID_TRANSACTION = 'void_transaction',
  REFUND_TRANSACTION = 'refund_transaction',
}

export enum OfflineSyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

registerEnumType(OfflineOperationType, { name: 'OfflineOperationType' });
registerEnumType(OfflineSyncStatus, { name: 'OfflineSyncStatus' });

// Offline Queue Item Type
@ObjectType({ description: 'Offline operation queued for sync' })
export class OfflineQueueItem {
  @Field(() => ID)
  @ApiProperty({ description: 'Queue item ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Queue ID' })
  queueId!: string;

  @Field()
  @ApiProperty({ description: 'Device ID' })
  deviceId!: string;

  @Field(() => OfflineOperationType)
  @ApiProperty({ enum: OfflineOperationType, description: 'Operation type' })
  operationType!: OfflineOperationType;

  @Field(() => OfflineSyncStatus)
  @ApiProperty({ enum: OfflineSyncStatus, description: 'Sync status' })
  syncStatus!: OfflineSyncStatus;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of sync attempts' })
  syncAttempts!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last sync attempt timestamp', required: false })
  lastSyncAttempt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Synced at timestamp', required: false })
  syncedAt?: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Priority (lower = higher priority)' })
  priority!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Sequence number' })
  sequenceNumber!: number;

  @Field()
  @ApiProperty({ description: 'Created at' })
  createdAt!: Date;
}

// Offline Status Type
@ObjectType({ description: 'Offline sync status for a device' })
export class OfflineStatus {
  @Field()
  @ApiProperty({ description: 'Device ID' })
  deviceId!: string;

  @Field()
  @ApiProperty({ description: 'Is online' })
  isOnline!: boolean;

  @Field(() => Int)
  @ApiProperty({ description: 'Pending operations count' })
  pendingOperations!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Failed operations count' })
  failedOperations!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last sync timestamp', required: false })
  lastSync?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last sync error', required: false })
  lastSyncError?: string;
}

// Sync Result Type
@ObjectType({ description: 'Result of offline sync operation' })
export class SyncResult {
  @Field()
  @ApiProperty({ description: 'Sync success status' })
  success!: boolean;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of processed operations' })
  processedOperations!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of failed operations' })
  failedOperations!: number;

  @Field(() => [SyncError])
  @ApiProperty({ type: [SyncError], description: 'List of sync errors' })
  errors!: SyncError[];
}

// Sync Error Type
@ObjectType({ description: 'Error from sync operation' })
export class SyncError {
  @Field()
  @ApiProperty({ description: 'Operation ID that failed' })
  operationId!: string;

  @Field()
  @ApiProperty({ description: 'Error message' })
  error!: string;
}

// Conflict Type
@ObjectType({ description: 'Data conflict detected during sync' })
export class SyncConflict {
  @Field(() => ID)
  @ApiProperty({ description: 'Conflict ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Conflict type' })
  type!: string;

  @Field()
  @ApiProperty({ description: 'Conflict description' })
  description!: string;

  @Field()
  @ApiProperty({ description: 'Operation ID' })
  operationId!: string;

  @Field()
  @ApiProperty({ description: 'Detected at' })
  detectedAt!: Date;
}
