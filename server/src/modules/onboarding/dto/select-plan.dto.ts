import { IsEnum, IsNotEmpty } from 'class-validator';
import { PlanTier } from '../types/onboarding.types';

// ============================================================================
// Select Plan Request DTO
// ============================================================================

export class SelectPlanDto {
  @IsEnum(['Starter', 'Professional', 'Business', 'Enterprise'])
  @IsNotEmpty()
  planTier!: PlanTier;
}
