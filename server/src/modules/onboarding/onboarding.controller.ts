import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { SaveProgressDto, SelectPlanDto } from './dto';
import {
  SaveProgressResponse,
  GetProgressResponse,
  CompleteOnboardingResponse,
  RecommendPlanResponse,
  SelectPlanResponse,
} from './dto/response.dto';

/**
 * Onboarding Controller
 * 
 * Provides REST API endpoints for onboarding operations:
 * - Save onboarding progress for each step
 * - Retrieve current onboarding progress
 * - Mark onboarding as complete
 * - Get plan recommendations based on collected data
 * - Select a subscription plan
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Save onboarding progress for a specific step
   * 
   * POST /api/onboarding/progress
   * 
   * Requirement 2.1: THE Backend SHALL provide a POST endpoint at 
   * /api/onboarding/progress to save step data
   * 
   * Requirement 2.5: WHEN an unauthenticated user calls any onboarding endpoint, 
   * THE Backend SHALL return a 401 Unauthorized response
   * 
   * @param user - Current authenticated user
   * @param dto - Step data to save
   * @returns Updated onboarding data
   */
  @Post('progress')
  @HttpCode(HttpStatus.OK)
  async saveProgress(
    @CurrentUser() user: User,
    @Body() dto: SaveProgressDto,
  ): Promise<SaveProgressResponse> {
    this.logger.log(`Save progress request for organization: ${user.organizationId}`);
    
    try {
      // Call service to save progress
      const updatedData = await this.onboardingService.saveProgress(
        user.organizationId,
        dto.data,
      );
      
      return {
        success: true,
        data: updatedData,
        message: 'Progress saved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error saving progress: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Get current onboarding progress
   * 
   * GET /api/onboarding/progress
   * 
   * Requirement 2.2: THE Backend SHALL provide a GET endpoint at 
   * /api/onboarding/progress to retrieve saved progress
   * 
   * Requirement 2.5: WHEN an unauthenticated user calls any onboarding endpoint, 
   * THE Backend SHALL return a 401 Unauthorized response
   * 
   * @param user - Current authenticated user
   * @returns Current onboarding progress
   */
  @Get('progress')
  @HttpCode(HttpStatus.OK)
  async getProgress(@CurrentUser() user: User): Promise<GetProgressResponse> {
    this.logger.log(`Get progress request for organization: ${user.organizationId}`);
    
    try {
      // Call service to get progress
      const progress = await this.onboardingService.getProgress(user.organizationId);
      
      return {
        success: true,
        data: progress,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting progress: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Mark onboarding as complete
   * 
   * POST /api/onboarding/complete
   * 
   * Requirement 2.3: THE Backend SHALL provide a POST endpoint at 
   * /api/onboarding/complete to mark onboarding as complete
   * 
   * Requirement 2.5: WHEN an unauthenticated user calls any onboarding endpoint, 
   * THE Backend SHALL return a 401 Unauthorized response
   * 
   * @param user - Current authenticated user
   * @returns Success response
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(@CurrentUser() user: User): Promise<CompleteOnboardingResponse> {
    this.logger.log(`Complete onboarding request for organization: ${user.organizationId}`);
    
    try {
      // Call service to complete onboarding
      await this.onboardingService.completeOnboarding(user.organizationId);
      
      const completedAt = new Date();
      
      return {
        success: true,
        message: 'Onboarding completed successfully',
        completedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error completing onboarding: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Get plan recommendations based on collected data
   * 
   * POST /api/onboarding/recommend-plan
   * 
   * Requirement 2.4: THE Backend SHALL provide a POST endpoint at 
   * /api/onboarding/recommend-plan to generate plan recommendations
   * 
   * Requirement 2.5: WHEN an unauthenticated user calls any onboarding endpoint, 
   * THE Backend SHALL return a 401 Unauthorized response
   * 
   * @param user - Current authenticated user
   * @returns Plan recommendations
   */
  @Post('recommend-plan')
  @HttpCode(HttpStatus.OK)
  async recommendPlan(@CurrentUser() user: User): Promise<RecommendPlanResponse> {
    this.logger.log(`Recommend plan request for organization: ${user.organizationId}`);
    
    try {
      // Call service to generate plan recommendations
      const recommendations = await this.onboardingService.recommendPlan(user.organizationId);
      
      return {
        success: true,
        recommendations,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error recommending plan: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Select a subscription plan and update organization limits
   * 
   * POST /api/onboarding/select-plan
   * 
   * Requirement 2.5: WHEN an unauthenticated user calls any onboarding endpoint, 
   * THE Backend SHALL return a 401 Unauthorized response
   * 
   * @param user - Current authenticated user
   * @param dto - Selected plan tier
   * @returns Success response
   */
  @Post('select-plan')
  @HttpCode(HttpStatus.OK)
  async selectPlan(
    @CurrentUser() user: User,
    @Body() dto: SelectPlanDto,
  ): Promise<SelectPlanResponse> {
    this.logger.log(`Select plan request for organization: ${user.organizationId}`);
    
    try {
      // Call service to select plan and update organization limits
      await this.onboardingService.selectPlan(user.organizationId, dto.planTier);
      
      return {
        success: true,
        message: 'Plan selected successfully',
        selectedPlan: dto.planTier,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error selecting plan: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
