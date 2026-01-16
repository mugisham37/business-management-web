import { ObjectType, Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';

// ===== ENUMS =====

export enum DeviceType {
  PHONE = 'phone',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  OFFLINE = 'offline',
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ConflictResolution {
  CLIENT_WINS = 'client-wins',
  SERVER_WINS = 'server-wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

registerEnumType(DeviceType, {
  name: 'DeviceType',
  description: 'Type of mobile device',
});

registerEnumType(ConnectionType, {
  name: 'ConnectionType',
  description: 'Type of network connection',
});

registerEnumType(SyncStatus, {
  name: 'SyncStatus',
  description: 'Status of data synchronization',
});

registerEnumType(ConflictResolution, {
  name: 'ConflictResolution',
  description: 'Strategy for resolving data conflicts',
});

// ===== OBJECT TYPES =====

@ObjectType({ description: 'Mobile application configuration' })
export class MobileConfig {
  @Field(() => String, { description: 'Application ID' })
  appId: string;

  @Field(() => String, { description: 'Application version' })
  version: string;

  @Field(() => Boolean, { description: 'Whether compression is enabled' })
  compressionEnabled: boolean;

  @Field(() => Boolean, { description: 'Whether progressive loading is enabled' })
  progressiveLoadingEnabled: boolean;

  @Field(() => Boolean, { description: 'Whether offline mode is enabled' })
  offlineModeEnabled: boolean;

  @Field(() => Int, { description: 'Maximum cache size in MB' })
  maxCacheSize: number;

  @Field(() => Int, { description: 'Sync interval in seconds' })
  syncInterval: number;

  @Field(() => [String], { description: 'Enabled features' })
  enabledFeatures: string[];

  @Field(() => String, { nullable: true, description: 'API endpoint URL' })
  apiEndpoint?: string;
}

@ObjectType({ description: 'Mobile dashboard data' })
export class MobileDashboard {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => Int, { description: 'Unread notifications count' })
  unreadNotifications: number;

  @Field(() => Int, { description: 'Pending tasks count' })
  pendingTasks: number;

  @Field(() => Int, { description: 'Queued sync items count' })
  queuedSyncItems: number;

  @Field(() => [DashboardWidget], { description: 'Dashboard widgets' })
  widgets: DashboardWidget[];

  @Field(() => Date, { description: 'Last sync timestamp' })
  lastSync: Date;

  @Field(() => String, { description: 'Sync status' })
  syncStatus: string;
}

@ObjectType({ description: 'Dashboard widget data' })
export class DashboardWidget {
  @Field(() => String, { description: 'Widget ID' })
  id: string;

  @Field(() => String, { description: 'Widget type' })
  type: string;

  @Field(() => String, { description: 'Widget title' })
  title: string;

  @Field(() => String, { description: 'Widget data as JSON string' })
  data: string;

  @Field(() => Int, { description: 'Widget priority for ordering' })
  priority: number;
}

@ObjectType({ description: 'Sync result information' })
export class SyncResult {
  @Field(() => Boolean, { description: 'Whether sync was successful' })
  success: boolean;

  @Field(() => Int, { description: 'Number of items synced' })
  syncedItems: number;

  @Field(() => Int, { description: 'Number of items failed' })
  failedItems: number;

  @Field(() => Int, { description: 'Number of conflicts detected' })
  conflicts: number;

  @Field(() => Int, { description: 'Total sync time in milliseconds' })
  totalTime: number;

  @Field(() => [String], { description: 'Error messages' })
  errors: string[];

  @Field(() => Date, { description: 'Sync timestamp' })
  timestamp: Date;
}

@ObjectType({ description: 'Sync status information' })
export class SyncStatusInfo {
  @Field(() => Int, { description: 'Number of queued items' })
  queuedItems: number;

  @Field(() => Boolean, { description: 'Whether sync is in progress' })
  syncInProgress: boolean;

  @Field(() => Date, { nullable: true, description: 'Last sync timestamp' })
  lastSyncTime?: Date;

  @Field(() => Int, { description: 'Estimated sync time in milliseconds' })
  estimatedSyncTime: number;

  @Field(() => SyncStatus, { description: 'Current sync status' })
  status: SyncStatus;
}

@ObjectType({ description: 'Mobile error report acknowledgment' })
export class ErrorReportResponse {
  @Field(() => Boolean, { description: 'Whether error was reported successfully' })
  success: boolean;

  @Field(() => String, { description: 'Error report ID' })
  reportId: string;

  @Field(() => String, { description: 'Response message' })
  message: string;

  @Field(() => Date, { description: 'Report timestamp' })
  timestamp: Date;
}

// ===== INPUT TYPES =====

@InputType({ description: 'Input for getting mobile configuration' })
export class GetMobileConfigInput {
  @Field(() => String, { description: 'Application ID' })
  appId: string;

  @Field(() => String, { nullable: true, description: 'Device type' })
  deviceType?: DeviceType;

  @Field(() => String, { nullable: true, description: 'App version' })
  version?: string;
}

@InputType({ description: 'Input for getting mobile dashboard' })
export class GetMobileDashboardInput {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => DeviceType, { nullable: true, description: 'Device type for optimization' })
  deviceType?: DeviceType;

  @Field(() => ConnectionType, { nullable: true, description: 'Connection type for optimization' })
  connectionType?: ConnectionType;

  @Field(() => Boolean, { nullable: true, description: 'Whether to include only essential data' })
  minimalPayload?: boolean;
}

@InputType({ description: 'Input for syncing mobile data' })
export class SyncMobileDataInput {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => Date, { nullable: true, description: 'Last sync timestamp' })
  lastSync?: Date;

  @Field(() => Int, { nullable: true, description: 'Batch size for sync' })
  batchSize?: number;

  @Field(() => Int, { nullable: true, description: 'Maximum retry attempts' })
  maxRetries?: number;

  @Field(() => ConflictResolution, { nullable: true, description: 'Conflict resolution strategy' })
  conflictResolution?: ConflictResolution;

  @Field(() => Boolean, { nullable: true, description: 'Whether to prioritize by entity type' })
  prioritizeByType?: boolean;
}

@InputType({ description: 'Input for reporting mobile errors' })
export class ReportMobileErrorInput {
  @Field(() => String, { description: 'Error message' })
  message: string;

  @Field(() => String, { nullable: true, description: 'Error stack trace' })
  stack?: string;

  @Field(() => String, { nullable: true, description: 'Error code' })
  code?: string;

  @Field(() => String, { description: 'Device type' })
  deviceType: DeviceType;

  @Field(() => String, { nullable: true, description: 'App version' })
  appVersion?: string;

  @Field(() => String, { nullable: true, description: 'OS version' })
  osVersion?: string;

  @Field(() => String, { nullable: true, description: 'Additional context as JSON' })
  context?: string;
}

// ===== MUTATION RESPONSES =====

@ObjectType({ description: 'Response for sync mobile data mutation' })
export class SyncMobileDataResponse extends MutationResponse {
  @Field(() => SyncResult, { nullable: true, description: 'Sync result details' })
  syncResult?: SyncResult;
}
