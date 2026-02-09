import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationsModule } from '../organizations/organizations.module';

/**
 * Onboarding Module
 * 
 * Provides functionality for the multi-step onboarding flow:
 * - Save and retrieve onboarding progress
 * - Plan recommendation engine
 * - Organization limits updates based on selected plan
 * - Onboarding completion tracking
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
@Module({
  imports: [
    DatabaseModule,
    OrganizationsModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
