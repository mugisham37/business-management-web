# Implementation Plan: Onboarding System Integration

## Overview

This implementation plan breaks down the onboarding system integration into discrete, incremental coding tasks. The approach follows a backend-first strategy to establish the API foundation, followed by frontend integration, and concluding with testing and integration work.

Each task builds on previous work and includes checkpoints to validate progress. Tasks are organized to enable early validation of core functionality through code and tests.

## Tasks

- [x] 1. Set up backend onboarding module structure
  - Create `server/src/modules/onboarding` directory
  - Create module, controller, and service files with basic structure
  - Register module in app.module.ts
  - Set up dependency injection for OrganizationsService and PrismaService
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Implement shared TypeScript types
  - [x] 2.1 Create shared types for onboarding data structures
    - Create `server/src/modules/onboarding/types/onboarding.types.ts`
    - Define OnboardingData, BusinessInfo, ProductFeatures, TeamSize, LocationsData, InfrastructureData, IntegrationsData interfaces
    - Define OnboardingProgress and PlanRecommendation interfaces
    - Define PlanTier, BusinessType, CloudProvider, and other type aliases
    - _Requirements: 4.1, 4.2_
  
  - [x] 2.2 Copy shared types to frontend
    - Create `web/src/types/onboarding-api.ts`
    - Copy type definitions from backend
    - Ensure compatibility with existing frontend types
    - _Requirements: 4.1, 4.2_

- [x] 3. Implement backend DTOs with validation
  - [x] 3.1 Create SaveProgressDto and nested DTOs
    - Create `server/src/modules/onboarding/dto/save-progress.dto.ts`
    - Implement OnboardingDataDto, BusinessInfoDto, ProductFeaturesDto, TeamSizeDto, LocationsDataDto, InfrastructureDataDto, IntegrationsDataDto
    - Add class-validator decorators for all validation rules
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 3.2 Create SelectPlanDto
    - Create `server/src/modules/onboarding/dto/select-plan.dto.ts`
    - Add validation for plan tier enum
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 3.3 Create response DTOs
    - Create response interfaces for all endpoints
    - Define SaveProgressResponse, GetProgressResponse, CompleteOnboardingResponse, RecommendPlanResponse, SelectPlanResponse
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implement onboarding service core methods
  - [x] 4.1 Implement saveProgress method
    - Write logic to merge new step data with existing onboardingData
    - Use Prisma to update Organization.onboardingData JSON field
    - Ensure data preservation (don't overwrite existing steps)
    - Return updated onboarding data
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 4.2 Implement getProgress method
    - Query Organization by ID
    - Extract onboardingData and onboardingCompleted fields
    - Transform to OnboardingProgress format
    - Return null if no progress exists
    - _Requirements: 1.3_
  
  - [x] 4.3 Implement completeOnboarding method
    - Update Organization.onboardingCompleted to true
    - Set completion timestamp
    - _Requirements: 6.5, 13.1_

- [x] 5. Implement plan recommendation engine
  - [x] 5.1 Define plan definitions constant
    - Create PLAN_DEFINITIONS array with all four plans (Starter, Professional, Business, Enterprise)
    - Include pricing, limits, features, and target segments for each plan
    - _Requirements: 5.8_
  
  - [x] 5.2 Implement scoring functions
    - Write calculateTeamSizeScore function (30% weight)
    - Write calculateFeatureComplexityScore function (25% weight)
    - Write calculateInfrastructureScore function (20% weight)
    - Write calculateLocationScore function (15% weight)
    - Write calculateBusinessContextScore function (10% weight)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 5.3 Implement calculatePlanScore method
    - Combine all scoring functions with weights
    - Return final score between 0-100
    - _Requirements: 5.5_
  
  - [x] 5.4 Implement generateRecommendationReason method
    - Analyze onboarding data
    - Generate human-readable reasons for recommendation
    - Return array of reason strings
    - _Requirements: 5.6_
  
  - [x] 5.5 Implement recommendPlan method
    - Calculate scores for all plans
    - Determine recommended plan (highest score)
    - Calculate confidence score
    - Generate reasons for recommendation
    - Identify alternative plans
    - Return array of PlanRecommendation objects
    - _Requirements: 5.5, 5.6, 5.7, 5.8_
  
  - [ ]* 5.6 Write property test for plan recommendation score bounds
    - **Property 5: Plan Recommendation Score Bounds**
    - **Validates: Requirements 5.5**
  
  - [ ]* 5.7 Write property test for recommendation algorithm sensitivity
    - **Property 7: Recommendation Algorithm Sensitivity**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ]* 5.8 Write unit tests for scoring functions
    - Test each scoring function with edge cases
    - Test weight application
    - Test score bounds
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implement selectPlan method
  - [x] 6.1 Write selectPlan service method
    - Look up plan definition by tier
    - Update Organization.maxUsers to plan.maxUsers
    - Update Organization.maxLocations to plan.maxLocations
    - Update Organization.subscriptionPlan to plan tier
    - Update Organization.subscriptionStatus to "trial"
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 6.2 Write property test for plan selection updates
    - **Property 11: Plan Selection Updates Organization Limits**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 7. Implement onboarding controller endpoints
  - [x] 7.1 Implement POST /api/onboarding/progress endpoint
    - Add @Post('progress') decorator
    - Add @UseGuards(JwtAuthGuard)
    - Extract user from @CurrentUser decorator
    - Validate SaveProgressDto
    - Call service.saveProgress
    - Return formatted response
    - Add error handling
    - _Requirements: 2.1, 2.5_
  
  - [x] 7.2 Implement GET /api/onboarding/progress endpoint
    - Add @Get('progress') decorator
    - Add @UseGuards(JwtAuthGuard)
    - Extract user from @CurrentUser decorator
    - Call service.getProgress
    - Return formatted response
    - _Requirements: 2.2, 2.5_
  
  - [x] 7.3 Implement POST /api/onboarding/complete endpoint
    - Add @Post('complete') decorator
    - Add @UseGuards(JwtAuthGuard)
    - Extract user from @CurrentUser decorator
    - Call service.completeOnboarding
    - Return success response
    - _Requirements: 2.3, 2.5_
  
  - [x] 7.4 Implement POST /api/onboarding/recommend-plan endpoint
    - Add @Post('recommend-plan') decorator
    - Add @UseGuards(JwtAuthGuard)
    - Extract user from @CurrentUser decorator
    - Call service.recommendPlan
    - Return plan recommendations
    - _Requirements: 2.4, 2.5_
  
  - [x] 7.5 Implement POST /api/onboarding/select-plan endpoint
    - Add @Post('select-plan') decorator
    - Add @UseGuards(JwtAuthGuard)
    - Extract user from @CurrentUser decorator
    - Validate SelectPlanDto
    - Call service.selectPlan
    - Return success response
    - _Requirements: 2.5, 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 7.6 Write integration tests for all endpoints
    - Test each endpoint with valid data
    - Test authentication requirement
    - Test validation errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 8. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement frontend API client
  - [x] 9.1 Create API client class
    - Create `web/src/lib/api/onboarding.ts`
    - Implement OnboardingApiClient class
    - Add base URL and axios instance configuration
    - Add token attachment interceptor
    - _Requirements: 11.1, 11.5_
  
  - [x] 9.2 Implement saveProgress method
    - Make POST request to /api/onboarding/progress
    - Transform request data
    - Handle response
    - Handle errors
    - _Requirements: 1.1, 11.2_
  
  - [x] 9.3 Implement getProgress method
    - Make GET request to /api/onboarding/progress
    - Handle response
    - Handle errors
    - _Requirements: 1.3, 11.2_
  
  - [x] 9.4 Implement completeOnboarding method
    - Make POST request to /api/onboarding/complete
    - Handle response
    - Handle errors
    - _Requirements: 13.1, 11.2_
  
  - [x] 9.5 Implement recommendPlan method
    - Make POST request to /api/onboarding/recommend-plan
    - Handle response
    - Handle errors
    - _Requirements: 5.5, 11.2_
  
  - [x] 9.6 Implement selectPlan method
    - Make POST request to /api/onboarding/select-plan
    - Handle response
    - Handle errors
    - _Requirements: 8.1, 11.2_
  
  - [x] 9.7 Add retry logic for transient failures
    - Implement exponential backoff
    - Configure maximum retry attempts (3)
    - Only retry on network errors and 5xx responses
    - _Requirements: 11.3_
  
  - [x] 9.8 Add timeout configuration
    - Set request timeout to 10 seconds
    - Handle timeout errors
    - _Requirements: 11.4_
  
  - [ ]* 9.9 Write unit tests for API client
    - Test each method with mock responses
    - Test error handling
    - Test retry logic
    - Test timeout handling
    - Test token attachment
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

- [x] 10. Implement Zustand store for onboarding state
  - [x] 10.1 Create onboarding store
    - Create `web/src/stores/onboarding.store.ts`
    - Define OnboardingStore interface
    - Initialize state with empty data
    - _Requirements: 10.1_
  
  - [x] 10.2 Implement state update actions
    - Implement setBusinessInfo action
    - Implement setFeatures action
    - Implement setTeamSize action
    - Implement setLocations action
    - Implement setInfrastructure action
    - Implement setIntegrations action
    - Each action should call API client to save progress
    - _Requirements: 10.2, 10.4_
  
  - [x] 10.3 Implement loadProgress action
    - Call API client getProgress
    - Update store state with retrieved data
    - Handle errors
    - _Requirements: 1.3, 10.3_
  
  - [x] 10.4 Implement step tracking actions
    - Implement setCurrentStep action
    - Implement markStepComplete action
    - Update completedSteps array
    - _Requirements: 6.1_
  
  - [x] 10.5 Implement completeOnboarding action
    - Call API client completeOnboarding
    - Update local state
    - _Requirements: 13.1_
  
  - [ ]* 10.6 Write unit tests for store
    - Test state updates
    - Test action creators
    - Test API integration
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 11. Implement React Query hooks
  - [x] 11.1 Create useOnboarding hooks file
    - Create `web/src/hooks/useOnboarding.ts`
    - Set up React Query client configuration
    - _Requirements: 11.1_
  
  - [x] 11.2 Implement query hooks
    - Implement useOnboardingProgress hook
    - Implement usePlanRecommendations hook
    - Configure caching and refetching
    - _Requirements: 1.3, 5.5_
  
  - [x] 11.3 Implement mutation hooks
    - Implement useSaveProgress hook
    - Implement useCompleteOnboarding hook
    - Implement useSelectPlan hook
    - Configure optimistic updates
    - _Requirements: 1.1, 13.1, 8.1_

- [x] 12. Update onboarding pages to use API integration
  - [x] 12.1 Update business-info page
    - Import useOnboarding store
    - Load existing progress on mount
    - Call setBusinessInfo on form submit
    - Add loading and error states
    - Transform form data correctly
    - _Requirements: 1.1, 1.3, 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 12.2 Update products page
    - Import useOnboarding store
    - Load existing progress on mount
    - Call setFeatures on form submit
    - Add loading and error states
    - Transform checkbox selections to array
    - _Requirements: 1.1, 1.3, 12.1_
  
  - [x] 12.3 Update employees page
    - Import useOnboarding store
    - Load existing progress on mount
    - Call setTeamSize on form submit
    - Add loading and error states
    - Transform radio selection correctly
    - _Requirements: 1.1, 1.3, 12.2_
  
  - [x] 12.4 Update infrastructure page
    - Import useOnboarding store
    - Load existing progress on mount
    - Call setInfrastructure on form submit
    - Add loading and error states
    - Transform number inputs and validate ranges
    - _Requirements: 1.1, 1.3, 12.3_
  
  - [ ]* 12.5 Write property test for data type transformations
    - **Property 17: Data Type Transformation Correctness**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [x] 13. Implement plan recommendation page
  - [x] 13.1 Create plan recommendation page component
    - Create `web/src/app/auth/onboarding/plan-recommendation/page.tsx`
    - Use usePlanRecommendations hook to fetch recommendations
    - Display recommended plan prominently
    - Display alternative plans
    - Show reasoning for recommendation
    - Add "Select Plan" buttons
    - _Requirements: 5.5, 5.6, 5.7, 5.8_
  
  - [x] 13.2 Implement plan selection handler
    - Call useSelectPlan mutation on button click
    - Show loading state during selection
    - Handle errors
    - Navigate to next step on success
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 13.3 Write property test for plan recommendation completeness
    - **Property 6: Plan Recommendation Completeness**
    - **Validates: Requirements 5.6, 5.7, 5.8**

- [ ] 14. Implement error handling UI
  - [ ] 14.1 Create error message component
    - Create reusable ErrorMessage component
    - Display user-friendly error messages
    - Include retry button
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [ ] 14.2 Add error handling to all onboarding pages
    - Catch API errors
    - Display ErrorMessage component
    - Preserve form data on error
    - Allow retry without data loss
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [ ] 14.3 Add error logging
    - Log errors to console in development
    - Send errors to monitoring service in production
    - Include context (user ID, organization ID, step)
    - _Requirements: 9.4_

- [ ] 15. Implement progress tracking UI
  - [ ] 15.1 Update onboarding layout with progress indicator
    - Show current step number and total steps
    - Show completion percentage
    - Highlight completed steps
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 15.2 Implement back navigation
    - Add back button to each step
    - Restore saved data when navigating back
    - _Requirements: 6.4, 10.3_
  
  - [ ]* 15.3 Write property test for progress tracking accuracy
    - **Property 8: Progress Tracking Accuracy**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 16. Implement onboarding completion flow
  - [ ] 16.1 Add completion logic to final step
    - Call completeOnboarding when user finishes
    - Update organization in database
    - _Requirements: 13.1, 13.2_
  
  - [ ] 16.2 Add redirect to dashboard
    - Redirect to /dashboard after completion
    - Show success message
    - _Requirements: 13.3_
  
  - [ ] 16.3 Add redirect for completed onboarding
    - Check onboardingCompleted flag on onboarding page load
    - Redirect to dashboard if already completed
    - _Requirements: 13.4_
  
  - [ ]* 16.4 Write property test for completion state consistency
    - **Property 9: Completion State Consistency**
    - **Validates: Requirements 6.5, 13.1, 13.2**

- [ ] 17. Implement authentication integration
  - [ ] 17.1 Add authentication guards to onboarding pages
    - Verify JWT token on page load
    - Redirect to login if not authenticated
    - _Requirements: 7.1, 7.4_
  
  - [ ] 17.2 Update signup flow to redirect to onboarding
    - Modify signup success handler
    - Redirect to /auth/onboarding/welcome after signup
    - _Requirements: 7.2_
  
  - [ ]* 17.3 Write property test for authentication requirement
    - **Property 3: Authentication Required for All Endpoints**
    - **Validates: Requirements 2.5, 7.1**

- [ ] 18. Checkpoint - Frontend integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Write comprehensive property-based tests
  - [ ]* 19.1 Write property test for data persistence round trip
    - **Property 1: Data Persistence Round Trip**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [ ]* 19.2 Write property test for incremental data preservation
    - **Property 2: Incremental Data Preservation**
    - **Validates: Requirements 1.5**
  
  - [ ]* 19.3 Write property test for invalid data rejection
    - **Property 4: Invalid Data Rejection**
    - **Validates: Requirements 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
  
  - [ ]* 19.4 Write property test for organization data association
    - **Property 10: Organization Data Association**
    - **Validates: Requirements 7.3**
  
  - [ ]* 19.5 Write property test for state synchronization order
    - **Property 13: State Synchronization Order**
    - **Validates: Requirements 10.2, 10.4**
  
  - [ ]* 19.6 Write property test for state restoration consistency
    - **Property 14: State Restoration Consistency**
    - **Validates: Requirements 10.3**
  
  - [ ]* 19.7 Write property test for API client error handling
    - **Property 15: API Client Error Handling**
    - **Validates: Requirements 11.2, 11.3**
  
  - [ ]* 19.8 Write property test for authentication token attachment
    - **Property 16: Authentication Token Attachment**
    - **Validates: Requirements 11.5**
  
  - [ ]* 19.9 Write property test for optional field omission
    - **Property 18: Optional Field Omission**
    - **Validates: Requirements 12.5**

- [ ] 20. End-to-end integration testing
  - [ ]* 20.1 Write E2E test for complete onboarding flow
    - Register new user
    - Complete all onboarding steps
    - Verify data saved at each step
    - Get plan recommendation
    - Select plan
    - Verify organization updated
    - Verify redirect to dashboard
    - _Requirements: 1.1, 1.2, 1.3, 5.5, 8.1, 13.1, 13.3_
  
  - [ ]* 20.2 Write E2E test for resume onboarding flow
    - Start onboarding
    - Complete some steps
    - Simulate logout
    - Login again
    - Verify progress restored
    - Complete remaining steps
    - _Requirements: 1.3, 10.3_
  
  - [ ]* 20.3 Write E2E test for error recovery flow
    - Start onboarding
    - Simulate network error
    - Verify error message displayed
    - Retry operation
    - Verify success
    - _Requirements: 9.1, 9.5, 11.3_

- [ ] 21. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations each
- Unit tests validate specific examples and edge cases
- Backend implementation comes first to establish API foundation
- Frontend integration follows once API is stable
- End-to-end tests validate complete user flows
