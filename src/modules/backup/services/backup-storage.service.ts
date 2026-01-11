import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { BackupStorageLocation } from '../entities/backup.entity';

export interface StorageConfig {
  location: BackupStorageLocation;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  localPath?: string;
}

export interface UploadResult {
  storagePath: string;
  sizeBytes: number;
  checksum: string;
  uploadDuration: number;
}

export interface DownloadResult {
  localPath: string;
  sizeBytes: number;
  checksum: string;
  downloadDuration: number;
}

@Injectable()
export class BackupStorageService {
  private readonly logger = new Logger(BackupStorageService.name);
  private s3Client: AWS.S3;
  private storageConfigs: Map<BackupStorageLocation, StorageConfig>;

  constructor(private readonly configService: ConfigService) {
    this.initializeStorageClients();
  }

  /**
   * Upload backup to storage
   */
  async uploadBackup(
    localFilePath: string,
    storagePath: string,
    storageLocation: BackupStorageLocation,
    metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    this.logger.log(`Uploading backup to ${storageLocation}: ${storagePath}`);
    const startTime = Date.now();

    try {
      // Calculate file size and checksum
      const stats = fs.statSync(localFilePath);
      const sizeBytes = stats.size;
      const checksum = await this.calculateFileChecksum(localFilePath);

      let uploadResult: UploadResult;

      switch (storageLocation) {
        case BackupStorageLocation.S3:
          uploadResult = await this.uploadToS3(localFilePath, storagePath, metadata);
          break;
        case BackupStorageLocation.AZURE_BLOB:
          uploadResult = await this.uploadToAzure(localFilePath, storagePath, metadata);
          break;
        case BackupStorageLocation.GOOGLE_CLOUD:
          uploadResult = await this.uploadToGCS(localFilePath, storagePath, metadata);
          break;
        case BackupStorageLocation.LOCAL:
          uploadResult = await this.uploadToLocal(localFilePath, storagePath, metadata);
          break;
        case BackupStorageLocation.MULTI_REGION:
          uploadResult = await this.uploadToMultiRegion(localFilePath, storagePath, metadata);
          break;
        default:
          throw new Error(`Unsupported storage location: ${storageLocation}`);
      }

      const uploadDuration = Date.now() - startTime;
      this.logger.log(`Backup uploaded successfully in ${uploadDuration}ms: ${storagePath}`);

      return {
        ...uploadResult,
        sizeBytes,
        checksum,
        uploadDuration,
      };

    } catch (error) {
      this.logger.error(`Failed to upload backup to ${storageLocation}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download backup from storage
   */
  async downloadBackup(
    storagePath: string,
    storageLocation: BackupStorageLocation,
    localFilePath: string,
  ): Promise<DownloadResult> {
    this.logger.log(`Downloading backup from ${storageLocation}: ${storagePath}`);
    const startTime = Date.now();

    try {
      let downloadResult: DownloadResult;

      switch (storageLocation) {
        case BackupStorageLocation.S3:
          downloadResult = await this.downloadFromS3(storagePath, localFilePath);
          break;
        case BackupStorageLocation.AZURE_BLOB:
          downloadResult = await this.downloadFromAzure(storagePath, localFilePath);
          break;
        case BackupStorageLocation.GOOGLE_CLOUD:
          downloadResult = await this.downloadFromGCS(storagePath, localFilePath);
          break;
        case BackupStorageLocation.LOCAL:
          downloadResult = await this.downloadFromLocal(storagePath, localFilePath);
          break;
        default:
          throw new Error(`Unsupported storage location: ${storageLocation}`);
      }

      const downloadDuration = Date.now() - startTime;
      this.logger.log(`Backup downloaded successfully in ${downloadDuration}ms: ${storagePath}`);

      return {
        ...downloadResult,
        downloadDuration,
      };

    } catch (error) {
      this.logger.error(`Failed to download backup from ${storageLocation}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete backup from storage
   */
  async deleteBackup(storagePath: string, storageLocation: BackupStorageLocation): Promise<void> {
    this.logger.log(`Deleting backup from ${storageLocation}: ${storagePath}`);

    try {
      switch (storageLocation) {
        case BackupStorageLocation.S3:
          await this.deleteFromS3(storagePath);
          break;
        case BackupStorageLocation.AZURE_BLOB:
          await this.deleteFromAzure(storagePath);
          break;
        case BackupStorageLocation.GOOGLE_CLOUD:
          await this.deleteFromGCS(storagePath);
          break;
        case BackupStorageLocation.LOCAL:
          await this.deleteFromLocal(storagePath);
          break;
        case BackupStorageLocation.MULTI_REGION:
          await this.deleteFromMultiRegion(storagePath);
          break;
        default:
          throw new Error(`Unsupported storage location: ${storageLocation}`);
      }

      this.logger.log(`Backup deleted successfully: ${storagePath}`);

    } catch (error) {
      this.logger.error(`Failed to delete backup from ${storageLocation}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if backup exists in storage
   */
  async backupExists(storagePath: string, storageLocation: BackupStorageLocation): Promise<boolean> {
    try {
      switch (storageLocation) {
        case BackupStorageLocation.S3:
          return await this.existsInS3(storagePath);
        case BackupStorageLocation.AZURE_BLOB:
          return await this.existsInAzure(storagePath);
        case BackupStorageLocation.GOOGLE_CLOUD:
          return await this.existsInGCS(storagePath);
        case BackupStorageLocation.LOCAL:
          return await this.existsInLocal(storagePath);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to check backup existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Get backup metadata from storage
   */
  async getBackupMetadata(storagePath: string, storageLocation: BackupStorageLocation): Promise<Record<string, any>> {
    try {
      switch (storageLocation) {
        case BackupStorageLocation.S3:
          return await this.getS3Metadata(storagePath);
        case BackupStorageLocation.AZURE_BLOB:
          return await this.getAzureMetadata(storagePath);
        case BackupStorageLocation.GOOGLE_CLOUD:
          return await this.getGCSMetadata(storagePath);
        case BackupStorageLocation.LOCAL:
          return await this.getLocalMetadata(storagePath);
        default:
          return {};
      }
    } catch (error) {
      this.logger.error(`Failed to get backup metadata: ${error.message}`);
      return {};
    }
  }

  /**
   * Private helper methods
   */
  private initializeStorageClients(): void {
    // Initialize S3 client
    this.s3Client = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    });

    // Initialize storage configurations
    this.storageConfigs = new Map([
      [BackupStorageLocation.S3, {
        location: BackupStorageLocation.S3,
        region: this.configService.get('AWS_REGION', 'us-east-1'),
        bucket: this.configService.get('BACKUP_S3_BUCKET', 'unified-platform-backups'),
      }],
      [BackupStorageLocation.LOCAL, {
        location: BackupStorageLocation.LOCAL,
        localPath: this.configService.get('BACKUP_LOCAL_PATH', '/var/backups'),
      }],
    ]);
  }

  private async uploadToS3(localFilePath: string, storagePath: string, metadata?: Record<string, string>): Promise<UploadResult> {
    const config = this.storageConfigs.get(BackupStorageLocation.S3);
    const fileStream = fs.createReadStream(localFilePath);

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: config.bucket,
      Key: storagePath,
      Body: fileStream,
      Metadata: metadata || {},
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD_IA', // Infrequent Access for cost optimization
    };

    const result = await this.s3Client.upload(uploadParams).promise();
    
    return {
      storagePath: result.Key,
      sizeBytes: 0, // Will be set by caller
      checksum: result.ETag.replace(/"/g, ''),
      uploadDuration: 0, // Will be set by caller
    };
  }

  private async downloadFromS3(storagePath: string, localFilePath: string): Promise<DownloadResult> {
    const config = this.storageConfigs.get(BackupStorageLocation.S3);
    
    const downloadParams: AWS.S3.GetObjectRequest = {
      Bucket: config.bucket,
      Key: storagePath,
    };

    const result = await this.s3Client.getObject(downloadParams).promise();
    
    // Ensure directory exists
    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to local file
    fs.writeFileSync(localFilePath, result.Body as Buffer);
    
    const stats = fs.statSync(localFilePath);
    const checksum = await this.calculateFileChecksum(localFilePath);

    return {
      localPath: localFilePath,
      sizeBytes: stats.size,
      checksum,
      downloadDuration: 0, // Will be set by caller
    };
  }

  private async deleteFromS3(storagePath: string): Promise<void> {
    const config = this.storageConfigs.get(BackupStorageLocation.S3);
    
    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: config.bucket,
      Key: storagePath,
    };

    await this.s3Client.deleteObject(deleteParams).promise();
  }

  private async existsInS3(storagePath: string): Promise<boolean> {
    const config = this.storageConfigs.get(BackupStorageLocation.S3);
    
    try {
      await this.s3Client.headObject({
        Bucket: config.bucket,
        Key: storagePath,
      }).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  private async getS3Metadata(storagePath: string): Promise<Record<string, any>> {
    const config = this.storageConfigs.get(BackupStorageLocation.S3);
    
    const result = await this.s3Client.headObject({
      Bucket: config.bucket,
      Key: storagePath,
    }).promise();

    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      etag: result.ETag,
      metadata: result.Metadata,
      storageClass: result.StorageClass,
    };
  }

  // Placeholder implementations for other storage providers
  private async uploadToAzure(localFilePath: string, storagePath: string, metadata?: Record<string, string>): Promise<UploadResult> {
    // TODO: Implement Azure Blob Storage upload
    throw new Error('Azure Blob Storage not implemented yet');
  }

  private async uploadToGCS(localFilePath: string, storagePath: string, metadata?: Record<string, string>): Promise<UploadResult> {
    // TODO: Implement Google Cloud Storage upload
    throw new Error('Google Cloud Storage not implemented yet');
  }

  private async uploadToLocal(localFilePath: string, storagePath: string, metadata?: Record<string, string>): Promise<UploadResult> {
    const config = this.storageConfigs.get(BackupStorageLocation.LOCAL);
    const targetPath = path.join(config.localPath, storagePath);
    
    // Ensure directory exists
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(localFilePath, targetPath);

    return {
      storagePath: targetPath,
      sizeBytes: 0, // Will be set by caller
      checksum: '', // Will be set by caller
      uploadDuration: 0, // Will be set by caller
    };
  }

  private async uploadToMultiRegion(localFilePath: string, storagePath: string, metadata?: Record<string, string>): Promise<UploadResult> {
    // Upload to multiple regions for geographic redundancy
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    const uploadPromises = regions.map(region => 
      this.uploadToS3WithRegion(localFilePath, storagePath, region, metadata)
    );

    const results = await Promise.all(uploadPromises);
    return results[0]; // Return primary region result
  }

  private async uploadToS3WithRegion(localFilePath: string, storagePath: string, region: string, metadata?: Record<string, string>): Promise<UploadResult> {
    const s3Client = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region,
    });

    const fileStream = fs.createReadStream(localFilePath);
    const bucket = `${this.configService.get('BACKUP_S3_BUCKET', 'unified-platform-backups')}-${region}`;

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: storagePath,
      Body: fileStream,
      Metadata: metadata || {},
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD_IA',
    };

    const result = await s3Client.upload(uploadParams).promise();
    
    return {
      storagePath: result.Key,
      sizeBytes: 0,
      checksum: result.ETag.replace(/"/g, ''),
      uploadDuration: 0,
    };
  }

  // Additional placeholder methods for other storage providers
  private async downloadFromAzure(storagePath: string, localFilePath: string): Promise<DownloadResult> {
    throw new Error('Azure Blob Storage not implemented yet');
  }

  private async downloadFromGCS(storagePath: string, localFilePath: string): Promise<DownloadResult> {
    throw new Error('Google Cloud Storage not implemented yet');
  }

  private async downloadFromLocal(storagePath: string, localFilePath: string): Promise<DownloadResult> {
    const config = this.storageConfigs.get(BackupStorageLocation.LOCAL);
    const sourcePath = path.join(config.localPath, storagePath);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Backup file not found: ${sourcePath}`);
    }

    // Ensure directory exists
    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(sourcePath, localFilePath);
    
    const stats = fs.statSync(localFilePath);
    const checksum = await this.calculateFileChecksum(localFilePath);

    return {
      localPath: localFilePath,
      sizeBytes: stats.size,
      checksum,
      downloadDuration: 0,
    };
  }

  private async deleteFromAzure(storagePath: string): Promise<void> {
    throw new Error('Azure Blob Storage not implemented yet');
  }

  private async deleteFromGCS(storagePath: string): Promise<void> {
    throw new Error('Google Cloud Storage not implemented yet');
  }

  private async deleteFromLocal(storagePath: string): Promise<void> {
    const config = this.storageConfigs.get(BackupStorageLocation.LOCAL);
    const filePath = path.join(config.localPath, storagePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private async deleteFromMultiRegion(storagePath: string): Promise<void> {
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    const deletePromises = regions.map(region => 
      this.deleteFromS3WithRegion(storagePath, region)
    );

    await Promise.all(deletePromises);
  }

  private async deleteFromS3WithRegion(storagePath: string, region: string): Promise<void> {
    const s3Client = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region,
    });

    const bucket = `${this.configService.get('BACKUP_S3_BUCKET', 'unified-platform-backups')}-${region}`;

    await s3Client.deleteObject({
      Bucket: bucket,
      Key: storagePath,
    }).promise();
  }

  private async existsInAzure(storagePath: string): Promise<boolean> {
    throw new Error('Azure Blob Storage not implemented yet');
  }

  private async existsInGCS(storagePath: string): Promise<boolean> {
    throw new Error('Google Cloud Storage not implemented yet');
  }

  private async existsInLocal(storagePath: string): Promise<boolean> {
    const config = this.storageConfigs.get(BackupStorageLocation.LOCAL);
    const filePath = path.join(config.localPath, storagePath);
    return fs.existsSync(filePath);
  }

  private async getAzureMetadata(storagePath: string): Promise<Record<string, any>> {
    throw new Error('Azure Blob Storage not implemented yet');
  }

  private async getGCSMetadata(storagePath: string): Promise<Record<string, any>> {
    throw new Error('Google Cloud Storage not implemented yet');
  }

  private async getLocalMetadata(storagePath: string): Promise<Record<string, any>> {
    const config = this.storageConfigs.get(BackupStorageLocation.LOCAL);
    const filePath = path.join(config.localPath, storagePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      lastModified: stats.mtime,
      created: stats.birthtime,
    };
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}