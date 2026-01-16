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
  appId: string = '';

  @Field(() => String, { description: 'Application version' })
  version: string = '1.0.0';

  @Field(() => Boolean, { description: 'Whether compression is enabled' })
  compressionEnabled: boolean = false;

  @Field(() => Boolean, { description: 'Whether progressive loading is enabled' })
  progressiveLoadingEnabled: boolean = false;

  @Field(() => Boolean, { description: 'Whether offline mode is enabled' })
  offlineModeEnabled: boolean = false;

  @Field(() => Int, { description: 'Maximum cache size in MB' })
  maxCacheSize: number = 50;

  @Field(() => Int, { description: 'Sync interval in seconds' })
  syncInterval: number = 300;

  @Field(() => [String], { description: 'Enabled features' })
  enabledFeatures: string[] = [];

  @Field(() => String, { nullable: true, description: 'API endpoint URL' })
  apiEndpoint?: string;
}

@ObjectType({ description: 'Mobile dashboard data' })
export class MobileDashboard {
  @Field(() => String, { description: 'User ID' })
  userId: string = '';

  @Field(() => Int, { description: 'Unread notifications count' })
  unreadNotifications: number = 0;

  @Field(() => Int, { description: 'Pending tasks count' })
  pendingTasks: number = 0;

  @Field(() => Int, { description: 'Queued sync items count' })
  queuedSyncItems: number = 0;

  @Field(() => [DashboardWidget], { description: 'Dashboard widgets' })
  widgets: DashboardWidget[] = [];

  @Field(() => Date, { description: 'Last sync timestamp' })
  lastSync: Date = new Date();

  @Field(() => String, { description: 'Sync status' })
  syncStatus: string = 'idle';
}

@ObjectType({ description: 'Dashboard widget data' })
export class DashboardWidget {
  @Field(() => String, { description: 'Widget ID' })
  id: string = '';

  @Field(() => String, { description: 'Widget type' })
  type: string = '';

  @Field(() => String, { description: 'Widget title' })
  title: string = '';

  @Field(() => String, { description: 'Widget data as JSON string' })
  data: string = '{}';

  @Field(() => Int, { description: 'Widget priority for ordering' })
  priority: number = 0;
}

@ObjectType({ description: 'Sync result information' })
export class SyncResult {
  @Field(() => Boolean, { description: 'Whether sync was successful' })
  success: boolean = false;

  @Field(() => Int, { description: 'Number of items synced' })
  syncedItems: number = 0;

  @Field(() => Int, { description: 'Number of items failed' })
  failedItems: number = 0;

  @Field(() => Int, { description: 'Number of conflicts detected' })
  conflicts: number = 0;

  @Field(() => Int, { description: 'Total sync time in milliseconds' })
  totalTime: number = 0;

  @Field(() => [String], { description: 'Error messages' })
  errors: string[] = [];

  @Field(() => Date, { description: 'Sync timestamp' })
  timestamp: Date = new Date();
}

@ObjectType({ description: 'Sync status information' })
export class SyncStatusInfo {
  @Field(() => Int, { description: 'Number of queued items' })
  queuedItems: number = 0;

  @Field(() => Boolean, { description: 'Whether sync is in progress' })
  syncInProgress: boolean = false;

  @Field(() => Date, { nullable: true, description: 'Last sync timestamp' })
  lastSyncTime?: Date;

  @Field(() => Int, { description: 'Estimated sync time in milliseconds' })
  estimatedSyncTime: number = 0;

  @Field(() => SyncStatus, { description: 'Current sync status' })
  status: SyncStatus = SyncStatus.IDLE;
}

@ObjectType({ description: 'Mobile error report acknowledgment' })
export class ErrorReportResponse {
  @Field(() => Boolean, { description: 'Whether error was reported successfully' })
  success: boolean = false;

  @Field(() => String, { description: 'Error report ID' })
  reportId: string = '';

  @Field(() => String, { description: 'Response message' })
  message: string = '';

  @Field(() => Date, { description: 'Report timestamp' })
  timestamp: Date = new Date();
}

// ===== INPUT TYPES =====

@InputType({ description: 'Input for getting mobile configuration' })
export class GetMobileConfigInput {
  @Field(() => String, { description: 'Application ID' })
  appId: string = '';

  @Field(() => String, { nullable: true, description: 'Device type' })
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

  @Field(() => String, { description: 'Device type' })
  deviceType: DeviceType = DeviceType.PHONE;

  @Field(() => String, { nullable: true, description: 'App version' })
  appVersion?: string;

  @Field(() => String, { nullable: true, description: 'OS version' })
  osVersion?: string;

  @Field(() => String, { nullable: true, description: 'Additional context as JSON' })
  context?: string;
}

// ===== PUSH NOTIFICATION TYPES =====

@ObjectType({ description: 'Push notification result' })
export class PushNotificationResult {
  @Field(() => Boolean, { description: 'Whether notification was sent successfully' })
  success: boolean = false;

  @Field(() => String, { nullable: true, description: 'Message ID' })
  messageId?: string;

  @Field(() => Int, { description: 'Number of delivered tokens' })
  deliveredTokens: number = 0;

  @Field(() => Int, { description: 'Number of failed tokens' })
  failedTokens: number = 0;

  @Field(() => [String], { description: 'Invalid tokens' })
  invalidTokens: string[] = [];
}

@ObjectType({ description: 'Device token information' })
export class DeviceTokenInfo {
  @Field(() => String, { description: 'Token ID' })
  id: string = '';

  @Field(() => String, { description: 'Platform type' })
  platform: string = '';

  @Field(() => String, { description: 'Device ID' })
  deviceId: string = '';

  @Field(() => Boolean, { description: 'Whether token is active' })
  isActive: boolean = false;

  @Field(() => Date, { description: 'Last used timestamp' })
  lastUsed: Date = new Date();
}

// ===== BIOMETRIC AUTH TYPES =====

@ObjectType({ description: 'Biometric authentication result' })
export class BiometricAuthResult {
  @Field(() => Boolean, { description: 'Whether authentication was successful' })
  success: boolean = false;

  @Field(() => String, { nullable: true, description: 'Session token' })
  sessionToken?: string;

  @Field(() => Date, { nullable: true, description: 'Token expiration date' })
  expiresAt?: Date;

  @Field(() => String, { nullable: true, description: 'Error message' })
  error?: string;

  @Field(() => Boolean, { nullable: true, description: 'Whether reregistration is required' })
  requiresReregistration?: boolean;
}

@ObjectType({ description: 'Biometric registration information' })
export class BiometricRegistrationInfo {
  @Field(() => String, { description: 'Registration ID' })
  id: string = '';

  @Field(() => String, { description: 'Biometric type' })
  biometricType: string = '';

  @Field(() => Boolean, { description: 'Whether registration is active' })
  isActive: boolean = false;

  @Field(() => Date, { description: 'Registration date' })
  createdAt: Date = new Date();

  @Field(() => Date, { nullable: true, description: 'Last used date' })
  lastUsed?: Date;
}

@ObjectType({ description: 'Biometric capabilities' })
export class BiometricCapabilities {
  @Field(() => Boolean, { description: 'Fingerprint support' })
  fingerprint: boolean = false;

  @Field(() => Boolean, { description: 'Face recognition support' })
  face: boolean = false;

  @Field(() => Boolean, { description: 'Voice recognition support' })
  voice: boolean = false;

  @Field(() => Boolean, { description: 'Iris scanning support' })
  iris: boolean = false;

  @Field(() => Boolean, { description: 'Device is secure' })
  deviceSecure: boolean = false;

  @Field(() => Boolean, { description: 'Biometric is enrolled' })
  biometricEnrolled: boolean = false;
}

// ===== LOCATION TYPES =====

@ObjectType({ description: 'Location coordinates' })
export class LocationCoordinates {
  @Field(() => Number, { description: 'Latitude' })
  latitude: number = 0;

  @Field(() => Number, { description: 'Longitude' })
  longitude: number = 0;

  @Field(() => Number, { nullable: true, description: 'Accuracy in meters' })
  accuracy?: number;

  @Field(() => Number, { nullable: true, description: 'Altitude in meters' })
  altitude?: number;

  @Field(() => Number, { nullable: true, description: 'Heading in degrees' })
  heading?: number;

  @Field(() => Number, { nullable: true, description: 'Speed in m/s' })
  speed?: number;

  @Field(() => Date, { description: 'Timestamp' })
  timestamp: Date = new Date();
}

@ObjectType({ description: 'Location event' })
export class LocationEvent {
  @Field(() => String, { description: 'Event ID' })
  id: string = '';

  @Field(() => String, { description: 'Event type' })
  eventType: string = '';

  @Field(() => LocationCoordinates, { description: 'Location coordinates' })
  location!: LocationCoordinates;

  @Field(() => String, { nullable: true, description: 'Geofence ID' })
  geofenceId?: string;

  @Field(() => Date, { description: 'Event timestamp' })
  timestamp: Date = new Date();
}

@ObjectType({ description: 'Geofence area' })
export class GeofenceArea {
  @Field(() => String, { description: 'Geofence ID' })
  id: string = '';

  @Field(() => String, { description: 'Geofence name' })
  name: string = '';

  @Field(() => LocationCoordinates, { description: 'Center coordinates' })
  center!: LocationCoordinates;

  @Field(() => Number, { description: 'Radius in meters' })
  radius: number = 0;

  @Field(() => String, { description: 'Geofence type' })
  type: string = '';

  @Field(() => Boolean, { description: 'Whether geofence is active' })
  isActive: boolean = false;

  @Field(() => Date, { description: 'Creation date' })
  createdAt: Date = new Date();
}

@ObjectType({ description: 'Nearby location' })
export class NearbyLocation {
  @Field(() => String, { description: 'Location ID' })
  id: string = '';

  @Field(() => String, { description: 'Location name' })
  name: string = '';

  @Field(() => String, { description: 'Location type' })
  type: string = '';

  @Field(() => LocationCoordinates, { description: 'Location coordinates' })
  location!: LocationCoordinates;

  @Field(() => Number, { description: 'Distance in meters' })
  distance: number = 0;
}

@ObjectType({ description: 'Location-based recommendation' })
export class LocationRecommendation {
  @Field(() => String, { description: 'Recommendation type' })
  type: string = '';

  @Field(() => String, { description: 'Title' })
  title: string = '';

  @Field(() => String, { description: 'Description' })
  description: string = '';

  @Field(() => String, { description: 'Priority level' })
  priority: string = '';

  @Field(() => String, { nullable: true, description: 'Action URL' })
  actionUrl?: string;
}

@ObjectType({ description: 'Location tracking result' })
export class LocationTrackingResult {
  @Field(() => [LocationEvent], { description: 'Location events' })
  events: LocationEvent[] = [];

  @Field(() => [LocationRecommendation], { description: 'Recommendations' })
  recommendations: LocationRecommendation[] = [];

  @Field(() => [NearbyLocation], { description: 'Nearby locations' })
  nearbyLocations: NearbyLocation[] = [];
}

// ===== CAMERA TYPES =====

@ObjectType({ description: 'Barcode scan result' })
export class BarcodeResult {
  @Field(() => String, { description: 'Barcode type' })
  type: string = '';

  @Field(() => String, { description: 'Barcode data' })
  data: string = '';

  @Field(() => Number, { description: 'Confidence level' })
  confidence: number = 0;
}

@ObjectType({ description: 'Document scan result' })
export class DocumentScanResult {
  @Field(() => String, { description: 'Document type' })
  type: string = '';

  @Field(() => String, { description: 'Extracted text' })
  text: string = '';

  @Field(() => Number, { description: 'Confidence level' })
  confidence: number = 0;

  @Field(() => String, { nullable: true, description: 'Extracted fields as JSON' })
  fields?: string;
}

@ObjectType({ description: 'Image analysis result' })
export class ImageAnalysisResult {
  @Field(() => String, { description: 'Detected objects as JSON' })
  objects: string = '[]';

  @Field(() => String, { nullable: true, description: 'Extracted text' })
  text?: string;

  @Field(() => String, { nullable: true, description: 'Detected faces as JSON' })
  faces?: string;
}

@ObjectType({ description: 'Camera capabilities' })
export class CameraCapabilities {
  @Field(() => Boolean, { description: 'Has camera' })
  hasCamera: boolean = false;

  @Field(() => Boolean, { description: 'Has front camera' })
  hasFrontCamera: boolean = false;

  @Field(() => Boolean, { description: 'Has back camera' })
  hasBackCamera: boolean = false;

  @Field(() => Boolean, { description: 'Has flash' })
  hasFlash: boolean = false;

  @Field(() => Boolean, { description: 'Can scan barcodes' })
  canScanBarcodes: boolean = false;

  @Field(() => Boolean, { description: 'Can scan documents' })
  canScanDocuments: boolean = false;
}

@ObjectType({ description: 'Barcode product information' })
export class BarcodeProductInfo {
  @Field(() => Boolean, { description: 'Whether product was found' })
  found: boolean = false;

  @Field(() => String, { nullable: true, description: 'Product ID' })
  productId?: string;

  @Field(() => String, { nullable: true, description: 'Product name' })
  productName?: string;

  @Field(() => Number, { nullable: true, description: 'Product price' })
  price?: number;

  @Field(() => Boolean, { nullable: true, description: 'In stock status' })
  inStock?: boolean;
}

// ===== BATTERY OPTIMIZATION TYPES =====

@ObjectType({ description: 'Battery optimization result' })
export class BatteryOptimizationResult {
  @Field(() => String, { description: 'Original settings as JSON' })
  originalSettings: string = '{}';

  @Field(() => String, { description: 'Optimized settings as JSON' })
  optimizedSettings: string = '{}';

  @Field(() => Number, { description: 'Estimated battery life increase percentage' })
  batteryLifeIncrease: number = 0;

  @Field(() => Number, { description: 'Estimated data usage decrease percentage' })
  dataUsageDecrease: number = 0;

  @Field(() => [String], { description: 'Applied optimizations' })
  appliedOptimizations: string[] = [];
}

@ObjectType({ description: 'Battery optimization recommendation' })
export class BatteryRecommendation {
  @Field(() => String, { description: 'Recommendation type' })
  type: string = '';

  @Field(() => String, { description: 'Title' })
  title: string = '';

  @Field(() => String, { description: 'Description' })
  description: string = '';

  @Field(() => String, { description: 'Impact level' })
  impact: string = '';

  @Field(() => Number, { description: 'Estimated savings percentage' })
  estimatedSavings: number = 0;
}

@ObjectType({ description: 'Battery recommendations response' })
export class BatteryRecommendationsResponse {
  @Field(() => [BatteryRecommendation], { description: 'Recommendations' })
  recommendations: BatteryRecommendation[] = [];

  @Field(() => Number, { description: 'Current optimization level' })
  currentOptimizationLevel: number = 0;
}

// ===== DATA USAGE TYPES =====

@ObjectType({ description: 'Data usage statistics' })
export class DataUsageStats {
  @Field(() => Number, { description: 'Total usage in bytes' })
  totalUsage: number = 0;

  @Field(() => Number, { description: 'Upload usage in bytes' })
  uploadUsage: number = 0;

  @Field(() => Number, { description: 'Download usage in bytes' })
  downloadUsage: number = 0;

  @Field(() => Number, { description: 'Compression savings in bytes' })
  compressionSavings: number = 0;

  @Field(() => Number, { description: 'Cache hit rate percentage' })
  cacheHitRate: number = 0;

  @Field(() => String, { description: 'Period type' })
  period: string = '';

  @Field(() => Date, { description: 'Timestamp' })
  timestamp: Date = new Date();
}

@ObjectType({ description: 'Data optimization result' })
export class DataOptimizationResult {
  @Field(() => Number, { description: 'Original size in bytes' })
  originalSize: number = 0;

  @Field(() => Number, { description: 'Optimized size in bytes' })
  optimizedSize: number = 0;

  @Field(() => Number, { description: 'Compression ratio percentage' })
  compressionRatio: number = 0;

  @Field(() => Number, { description: 'Estimated daily savings in bytes' })
  estimatedSavings: number = 0;

  @Field(() => [String], { description: 'Applied optimizations' })
  appliedOptimizations: string[] = [];

  @Field(() => [String], { description: 'Recommendations' })
  recommendations: string[] = [];
}

@ObjectType({ description: 'Data usage limit' })
export class DataUsageLimit {
  @Field(() => Number, { description: 'Daily limit in bytes' })
  dailyLimit: number = 0;

  @Field(() => Number, { description: 'Monthly limit in bytes' })
  monthlyLimit: number = 0;

  @Field(() => Number, { description: 'Current usage in bytes' })
  currentUsage: number = 0;

  @Field(() => Number, { description: 'Warning threshold percentage' })
  warningThreshold: number = 0;

  @Field(() => Date, { description: 'Reset date' })
  resetDate: Date = new Date();

  @Field(() => Boolean, { description: 'Whether limit is active' })
  isActive: boolean = false;
}

@ObjectType({ description: 'Intelligent sync strategy' })
export class IntelligentSyncStrategy {
  @Field(() => Boolean, { description: 'Whether to sync now' })
  syncNow: boolean = false;

  @Field(() => String, { description: 'Sync strategy type' })
  syncStrategy: string = '';

  @Field(() => Number, { description: 'Estimated data usage in bytes' })
  estimatedDataUsage: number = 0;

  @Field(() => [String], { description: 'Recommendations' })
  recommendations: string[] = [];
}

// ===== SYNC SCHEDULER TYPES =====

@ObjectType({ description: 'Sync schedule' })
export class SyncSchedule {
  @Field(() => String, { description: 'Schedule ID' })
  id: string = '';

  @Field(() => String, { description: 'Data type' })
  dataType: string = '';

  @Field(() => String, { description: 'Priority level' })
  priority: string = '';

  @Field(() => Date, { description: 'Scheduled time' })
  scheduledTime: Date = new Date();

  @Field(() => Int, { description: 'Estimated duration in seconds' })
  estimatedDuration: number = 0;

  @Field(() => Number, { description: 'Estimated data usage in bytes' })
  estimatedDataUsage: number = 0;

  @Field(() => Boolean, { description: 'Whether schedule is active' })
  isActive: boolean = false;

  @Field(() => Date, { description: 'Creation date' })
  createdAt: Date = new Date();
}

@ObjectType({ description: 'Sync recommendation' })
export class SyncRecommendation {
  @Field(() => String, { description: 'Recommended action' })
  action: string = '';

  @Field(() => String, { description: 'Reason for recommendation' })
  reason: string = '';

  @Field(() => Date, { nullable: true, description: 'Suggested time' })
  suggestedTime?: Date;

  @Field(() => Number, { nullable: true, description: 'Estimated battery savings' })
  batterySavings?: number;

  @Field(() => Number, { nullable: true, description: 'Estimated data savings' })
  dataSavings?: number;
}

@ObjectType({ description: 'Sync execution result' })
export class SyncExecutionResult {
  @Field(() => Boolean, { description: 'Whether sync was successful' })
  success: boolean = false;

  @Field(() => Date, { description: 'Execution timestamp' })
  executedAt: Date = new Date();

  @Field(() => Int, { description: 'Duration in milliseconds' })
  duration: number = 0;

  @Field(() => Number, { description: 'Data used in bytes' })
  dataUsed: number = 0;

  @Field(() => String, { nullable: true, description: 'Error message' })
  error?: string;
}

// ===== MUTATION RESPONSES =====

@ObjectType({ description: 'Response for sync mobile data mutation' })
export class SyncMobileDataResponse extends MutationResponse {
  @Field(() => SyncResult, { nullable: true, description: 'Sync result details' })
  syncResult?: SyncResult;
}

@ObjectType({ description: 'Response for push notification mutation' })
export class SendPushNotificationResponse extends MutationResponse {
  @Field(() => PushNotificationResult, { nullable: true, description: 'Notification result' })
  result?: PushNotificationResult;
}

@ObjectType({ description: 'Response for biometric auth mutation' })
export class BiometricAuthResponse extends MutationResponse {
  @Field(() => BiometricAuthResult, { nullable: true, description: 'Authentication result' })
  result?: BiometricAuthResult;
}

@ObjectType({ description: 'Response for location tracking mutation' })
export class TrackLocationResponse extends MutationResponse {
  @Field(() => LocationTrackingResult, { nullable: true, description: 'Tracking result' })
  result?: LocationTrackingResult;
}

@ObjectType({ description: 'Response for geofence creation mutation' })
export class CreateGeofenceResponse extends MutationResponse {
  @Field(() => GeofenceArea, { nullable: true, description: 'Created geofence' })
  geofence?: GeofenceArea;
}

@ObjectType({ description: 'Response for barcode scan mutation' })
export class ScanBarcodeResponse extends MutationResponse {
  @Field(() => [BarcodeResult], { nullable: true, description: 'Scan results' })
  results?: BarcodeResult[];
}

@ObjectType({ description: 'Response for document scan mutation' })
export class ScanDocumentResponse extends MutationResponse {
  @Field(() => DocumentScanResult, { nullable: true, description: 'Scan result' })
  result?: DocumentScanResult;
}

@ObjectType({ description: 'Response for battery optimization mutation' })
export class OptimizeBatteryResponse extends MutationResponse {
  @Field(() => BatteryOptimizationResult, { nullable: true, description: 'Optimization result' })
  result?: BatteryOptimizationResult;
}

@ObjectType({ description: 'Response for data optimization mutation' })
export class OptimizeDataUsageResponse extends MutationResponse {
  @Field(() => DataOptimizationResult, { nullable: true, description: 'Optimization result' })
  result?: DataOptimizationResult;
}

@ObjectType({ description: 'Response for schedule sync mutation' })
export class ScheduleSyncResponse extends MutationResponse {
  @Field(() => SyncSchedule, { nullable: true, description: 'Created schedule' })
  schedule?: SyncSchedule;
}
