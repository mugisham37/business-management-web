import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { CameraIntegrationService } from '../services/camera-integration.service';
import {
  ScanBarcodeInput,
  ScanDocumentInput,
  AnalyzeImageInput,
} from '../inputs/mobile.input';
import {
  ScanBarcodeResponse,
  ScanDocumentResponse,
  BarcodeResult,
  DocumentScanResult,
  ImageAnalysisResult,
  CameraCapabilities,
  BarcodeProductInfo,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class CameraResolver {
  private readonly logger = new Logger(CameraResolver.name);

  constructor(private readonly cameraService: CameraIntegrationService) {}

  @Mutation(() => ScanBarcodeResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:camera:scan')
  async scanBarcode(
    @Args('input') input: ScanBarcodeInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ScanBarcodeResponse> {
    try {
      const results = await this.cameraService.scanBarcode(
        input.imageData,
        tenantId,
        user.id,
      );

      return {
        success: true,
        message: `Found ${results.length} barcode(s)`,
        results,
      };
    } catch (error) {
      this.logger.error(`Barcode scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Barcode scanning failed',
      };
    }
  }

  @Mutation(() => ScanDocumentResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:camera:scan')
  async scanDocument(
    @Args('input') input: ScanDocumentInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ScanDocumentResponse> {
    try {
      const result = await this.cameraService.scanDocument(
        input.imageData,
        input.documentType as any,
        tenantId,
        user.id,
      );

      return {
        success: true,
        message: 'Document scanned successfully',
        result: {
          type: result.type,
          text: result.text,
          confidence: result.confidence,
          ...(result.fields && { fields: JSON.stringify(result.fields) }),
        },
      };
    } catch (error) {
      this.logger.error(`Document scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Document scanning failed',
      };
    }
  }

  @Mutation(() => ImageAnalysisResult)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:camera:scan')
  async analyzeImage(
    @Args('input') input: AnalyzeImageInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ImageAnalysisResult> {
    try {
      const result = await this.cameraService.analyzeImage(
        input.imageData,
        tenantId,
        user.id,
      );

      return {
        objects: JSON.stringify(result.objects || []),
        ...(result.text && { text: result.text }),
        ...(result.faces && { faces: JSON.stringify(result.faces) }),
      };
    } catch (error) {
      this.logger.error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Query(() => CameraCapabilities)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:camera:read')
  async getCameraCapabilities(
    @Args('userAgent', { nullable: true }) userAgent: string,
    @Args('deviceId', { nullable: true }) deviceId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<CameraCapabilities> {
    try {
      return await this.cameraService.getCameraCapabilities(userAgent, deviceId);
    } catch (error) {
      this.logger.error(`Failed to get camera capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Query(() => BarcodeProductInfo)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:camera:read')
  async getBarcodeProductInfo(
    @Args('barcode') barcode: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BarcodeProductInfo> {
    try {
      const result = await this.cameraService.getBarcodeInfo(barcode, tenantId);
      
      const response: any = { found: result.found };
      
      if (result.product?.id) response.productId = result.product.id;
      if (result.product?.name) response.productName = result.product.name;
      if (result.product?.price !== undefined) response.price = result.product.price;
      if (result.product?.inStock !== undefined) response.inStock = result.product.inStock;
      
      return response;
    } catch (error) {
      this.logger.error(`Failed to get barcode info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { found: false };
    }
  }
}
