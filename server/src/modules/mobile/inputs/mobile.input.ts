import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { DeviceType, ConnectionType, ConflictResolution } from '../types/mobile.types';

// ===== MOBILE CONFIG INPUTS =====

@InputType({ description: 'Input for getting mobile configuration' })
export class GetMobileConfigInput {
  @Field(() => String, { description: 'Application ID' })
  appId: string = '';

  @Field(() => DeviceType, { nullable: true, description: 'Device type' })
  deviceType?: DeviceType;

  @Field(() => String, { nullable: true, description: 'App version' })
  version?: string;
}

@InputType({ description: 'Input for getting mobile dashboard' })
export class GetMobileDashboardInput {
  @Field(() => String, { description: 'User ID' })
  userId: string = '';

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
  userId: string = '';

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
  message: string = '';

  @Field(() => String, { nullable: true, description: 'Error stack trace' })
  stack?: string;

  @Field(() => String, { nullable: true, description: 'Error code' })
  code?: string;

  @Field(() => DeviceType, { description: 'Device type' })
  deviceType: DeviceType = DeviceType.PHONE;

  @Field(() => String, { nullable: true, description: 'App version' })
  appVersion?: string;

  @Field(() => String, { nullable: true, description: 'OS version' })
  osVersion?: string;

  @Field(() => String, { nullable: true, description: 'Additional context as JSON' })
  context?: string;
}

// ===== PUSH NOTIFICATION INPUTS =====

@InputType({ description: 'Input for sending push notification' })
export class SendPushNotificationInput {
  @Field(() => [String], { description: 'User IDs to send notification to' })
  userIds: string[] = [];

  @Field(() => String, { description: 'Notification title' })
  title: string = '';

  @Field(() => String, { description: 'Notification body' })
  body: string = '';

  @Field(() => String, { nullable: true, description: 'Additional data as JSON' })
  data?: string;

  @Field(() => Int, { nullable: true, description: 'Badge count' })
  badge?: number;

  @Field(() => String, { nullable: true, description: 'Sound file name' })
  sound?: string;

  @Field(() => String, { nullable: true, description: 'Priority level' })
  priority?: string;
}

@InputType({ description: 'Input for registering device token' })
export class RegisterDeviceTokenInput {
  @Field(() => String, { description: 'Device token' })
  token: string = '';

  @Field(() => String, { description: 'Platform type' })
  platform: string = '';

  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => String, { description: 'App version' })
  appVersion: string = '';
}

// ===== BIOMETRIC AUTH INPUTS =====

@InputType({ description: 'Input for biometric authentication' })
export class BiometricAuthInput {
  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => String, { description: 'Biometric type' })
  biometricType: string = '';

  @Field(() => String, { description: 'Challenge string' })
  challenge: string = '';

  @Field(() => String, { description: 'Signature' })
  signature: string = '';

  @Field(() => String, { description: 'Public key' })
  publicKey: string = '';

  @Field(() => Float, { description: 'Timestamp' })
  timestamp: number = 0;
}

@InputType({ description: 'Input for registering biometric' })
export class RegisterBiometricInput {
  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => String, { description: 'Biometric type' })
  biometricType: string = '';

  @Field(() => String, { description: 'Public key' })
  publicKey: string = '';

  @Field(() => String, { description: 'Key algorithm' })
  keyAlgorithm: string = '';

  @Field(() => String, { description: 'Enrollment data' })
  enrollmentData: string = '';
}

// ===== LOCATION INPUTS =====

@InputType({ description: 'Input for location coordinates' })
export class LocationCoordinatesInput {
  @Field(() => Float, { description: 'Latitude' })
  latitude: number = 0;

  @Field(() => Float, { description: 'Longitude' })
  longitude: number = 0;

  @Field(() => Float, { nullable: true, description: 'Accuracy in meters' })
  accuracy?: number;

  @Field(() => Float, { nullable: true, description: 'Altitude in meters' })
  altitude?: number;

  @Field(() => Float, { nullable: true, description: 'Heading in degrees' })
  heading?: number;

  @Field(() => Float, { nullable: true, description: 'Speed in m/s' })
  speed?: number;
}

@InputType({ description: 'Input for tracking location' })
export class TrackLocationInput {
  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => LocationCoordinatesInput, { description: 'Location coordinates' })
  location!: LocationCoordinatesInput;
}

@InputType({ description: 'Input for creating geofence' })
export class CreateGeofenceInput {
  @Field(() => String, { description: 'Geofence name' })
  name: string = '';

  @Field(() => LocationCoordinatesInput, { description: 'Center coordinates' })
  center!: LocationCoordinatesInput;

  @Field(() => Float, { description: 'Radius in meters' })
  radius: number = 0;

  @Field(() => String, { description: 'Geofence type' })
  type: string = '';

  @Field(() => String, { nullable: true, description: 'Metadata as JSON' })
  metadata?: string;
}

// ===== CAMERA INPUTS =====

@InputType({ description: 'Input for scanning barcode' })
export class ScanBarcodeInput {
  @Field(() => String, { description: 'Image data as base64' })
  imageData: string = '';
}

@InputType({ description: 'Input for scanning document' })
export class ScanDocumentInput {
  @Field(() => String, { description: 'Image data as base64' })
  imageData: string = '';

  @Field(() => String, { description: 'Document type' })
  documentType: string = '';
}

@InputType({ description: 'Input for analyzing image' })
export class AnalyzeImageInput {
  @Field(() => String, { description: 'Image data as base64' })
  imageData: string = '';
}

// ===== BATTERY OPTIMIZATION INPUTS =====

@InputType({ description: 'Input for battery status' })
export class BatteryStatusInput {
  @Field(() => Float, { description: 'Battery level (0-100)' })
  level: number = 0;

  @Field(() => Boolean, { description: 'Is device charging' })
  charging: boolean = false;

  @Field(() => Int, { nullable: true, description: 'Minutes until fully charged' })
  chargingTime?: number;

  @Field(() => Int, { nullable: true, description: 'Minutes until empty' })
  dischargingTime?: number;
}

@InputType({ description: 'Input for optimizing battery' })
export class OptimizeBatteryInput {
  @Field(() => BatteryStatusInput, { description: 'Current battery status' })
  batteryStatus!: BatteryStatusInput;

  @Field(() => String, { description: 'Current settings as JSON' })
  currentSettings: string = '{}';
}

// ===== DATA USAGE INPUTS =====

@InputType({ description: 'Input for optimizing data usage' })
export class OptimizeDataUsageInput {
  @Field(() => ConnectionType, { description: 'Connection type' })
  connectionType!: ConnectionType;

  @Field(() => String, { description: 'Current settings as JSON' })
  currentSettings: string = '{}';
}

@InputType({ description: 'Input for setting data limit' })
export class SetDataLimitInput {
  @Field(() => Float, { description: 'Daily limit in bytes' })
  dailyLimit: number = 0;

  @Field(() => Float, { description: 'Monthly limit in bytes' })
  monthlyLimit: number = 0;

  @Field(() => Float, { nullable: true, description: 'Warning threshold percentage' })
  warningThreshold?: number;
}

// ===== SYNC SCHEDULER INPUTS =====

@InputType({ description: 'Input for scheduling sync' })
export class ScheduleSyncInput {
  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => String, { description: 'Data type to sync' })
  dataType: string = '';

  @Field(() => String, { description: 'Priority level' })
  priority: string = 'medium';

  @Field(() => Float, { nullable: true, description: 'Estimated data usage in bytes' })
  estimatedDataUsage?: number;
}

// ===== OFFLINE SYNC INPUTS =====

@InputType({ description: 'Input for queuing offline data' })
export class QueueOfflineDataInput {
  @Field(() => String, { description: 'Entity type' })
  entityType: string = '';

  @Field(() => String, { description: 'Entity ID' })
  entityId: string = '';

  @Field(() => String, { description: 'Operation type' })
  operation: string = '';

  @Field(() => String, { description: 'Data as JSON' })
  data: string = '';

  @Field(() => String, { nullable: true, description: 'Priority level' })
  priority?: string;
}
