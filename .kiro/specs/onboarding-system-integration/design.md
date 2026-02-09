# Design Document: Onboarding System Integration

## Overview

This design document specifies the architecture and implementation details for integrating the frontend onboarding flow with the backend API. The system enables new users to complete a multi-step onboarding process that collects business information, saves progress incrementally, and recommends appropriate subscription plans based on collected data.

The design follows a RESTful API architecture with the following key components:
- **Backend API**: NestJS controller and service for handling onboarding operations
- **Frontend API Client**: React Query-based client for communicating with the backend
- **State Management**: Zustand store for managing onboarding state across steps
- **Plan Recommendation Engine**: Algorithm that analyzes onboarding data to suggest optimal plans
- **Data Validation**: Class-validator DTOs on backend, Zod schemas on frontend

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Onboarding  │───▶│   Zustand    │───▶│ API Client   │ │
│  │    Pages     │    │    Store     │    │ (React Query)│ │
│  └──────────────┘    └──────────────┘    └──────┬───────┘ │
│                                                   │          │
└───────────────────────────────────────────────────┼─────────┘
                                                    │
                                              HTTP/JSON
                                                    │
┌───────────────────────────────────────────────────┼─────────┐
│                        Backend (NestJS)           │          │
│                                                   ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Onboarding  │───▶│  Onboarding  │───▶│   Prisma     │ │
│  │  Controller  │    │   Service    │    │   Client     │ │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘ │
│                             │                     │          │
│                             │                     ▼          │
│                             │              ┌──────────────┐ │
│                             │              │  PostgreSQL  │ │
│                             │              │   Database   │ │
│                             │              └──────────────┘ │
│                             │                               │
│                             ▼                               │
│                      ┌──────────────┐                      │
│                      │     Plan     │                      │
│                      │Recommendation│                      │
│                      │   Engine     │                      │
│                      └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Step Completion Flow**:
   ```
   User fills form → Form validation → Update Zustand store → 
   API call to save progress → Backend validation → 
   Store in database → Return success → Navigate to next step
   ```

2. **Progress Retrieval Flow**:
   ```
   User accesses onboarding → API call to get progress → 
   Backend retrieves from database → Return data → 
   Populate Zustand store → Render current step with saved data
   ```

3. **Plan Recommendation Flow**:
   ```
   User completes all steps → API call to recommend plan → 
   Backend analyzes all data → Calculate scores → 
   Return recommendations → Display to user → 
   User selects plan → Update organization limits
   ```

## Components and Interfaces

### Backend Components

#### 1. Onboarding Controller (`server/src/modules/onboarding/onboarding.controller.ts`)

**Responsibilities**:
- Handle HTTP requests for onboarding operations
- Validate request DTOs
- Call service methods
- Return formatted responses
- Apply authentication guards

**Endpoints**:

```typescript
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  
  // Save progress for a specific step
  @Post('progress')
  @HttpCode(HttpStatus.OK)
  async saveProgress(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: SaveProgressDto
  ): Promise<SaveProgressResponse>
  
  // Get current onboarding progress
  @Get('progress')
  @HttpCode(HttpStatus.OK)
  async getProgress(
    @CurrentUser() user: CurrentUserInfo
  ): Promise<GetProgressResponse>
  
  // Mark onboarding as complete
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(
    @CurrentUser() user: CurrentUserInfo
  ): Promise<CompleteOnboardingResponse>
  
  // Get plan recommendations
  @Post('recommend-plan')
  @HttpCode(HttpStatus.OK)
  async recommendPlan(
    @CurrentUser() user: CurrentUserInfo
  ): Promise<RecommendPlanResponse>
  
  // Select a plan and update organization limits
  @Post('select-plan')
  @HttpCode(HttpStatus.OK)
  async selectPlan(
    @CurrentUser() user: CurrentUserInfo,
    @Body() dto: SelectPlanDto
  ): Promise<SelectPlanResponse>
}
```

#### 2. Onboarding Service (`server/src/modules/onboarding/onboarding.service.ts`)

**Responsibilities**:
- Business logic for onboarding operations
- Data persistence through Prisma
- Plan recommendation algorithm
- Organization limits updates

**Methods**:

```typescript
export class OnboardingService {
  
  // Save step data to organization's onboardingData JSON field
  async saveProgress(
    organizationId: string,
    stepData: Partial<OnboardingData>
  ): Promise<OnboardingData>
  
  // Retrieve current onboarding progress
  async getProgress(
    organizationId: string
  ): Promise<OnboardingProgress | null>
  
  // Mark onboarding as complete
  async completeOnboarding(
    organizationId: string
  ): Promise<void>
  
  // Generate plan recommendations based on collected data
  async recommendPlan(
    organizationId: string
  ): Promise<PlanRecommendation[]>
  
  // Update organization limits based on selected plan
  async selectPlan(
    organizationId: string,
    planTier: PlanTier
  ): Promise<void>
  
  // Calculate recommendation score for a specific plan
  private calculatePlanScore(
    data: OnboardingData,
    plan: PlanDefinition
  ): number
  
  // Generate reasoning for plan recommendation
  private generateRecommendationReason(
    data: OnboardingData,
    plan: PlanDefinition
  ): string[]
}
```

#### 3. DTOs (Data Transfer Objects)

**SaveProgressDto**:
```typescript
export class SaveProgressDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OnboardingDataDto)
  data!: Partial<OnboardingDataDto>;
}

export class OnboardingDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  businessInfo?: BusinessInfoDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFeaturesDto)
  features?: ProductFeaturesDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamSizeDto)
  teamSize?: TeamSizeDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationsDataDto)
  locations?: LocationsDataDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => InfrastructureDataDto)
  infrastructure?: InfrastructureDataDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationsDataDto)
  integrations?: IntegrationsDataDto;
}

export class BusinessInfoDto {
  @IsString()
  @IsNotEmpty()
  businessName!: string;
  
  @IsString()
  @IsNotEmpty()
  industry!: string;
  
  @IsEnum(['Retail', 'Wholesale', 'Manufacturing', 'Service', 'E-commerce', 'Hybrid'])
  @IsNotEmpty()
  businessType!: string;
  
  @IsString()
  @IsNotEmpty()
  country!: string;
  
  @IsString()
  @IsOptional()
  registrationNumber?: string;
  
  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;
}

export class ProductFeaturesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  selectedFeatures!: string[];
}

export class TeamSizeDto {
  @IsNumber()
  @Min(1)
  current!: number;
  
  @IsEnum(['None', '2x', '5x', '10x+'])
  growthProjection!: string;
}

export class LocationsDataDto {
  @IsBoolean()
  multiLocation!: boolean;
  
  @IsNumber()
  @IsOptional()
  @Min(1)
  count?: number;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  types?: string[];
  
  @IsEnum(['Single city', 'Multiple cities', 'Regional', 'National', 'International'])
  @IsOptional()
  geographicSpread?: string;
}

export class InfrastructureDataDto {
  @IsEnum(['aws', 'azure'])
  provider!: string;
  
  @IsNumber()
  @Min(6)
  @Max(128)
  storage!: number;
  
  @IsString()
  @IsNotEmpty()
  region!: string;
  
  @IsArray()
  @IsString({ each: true })
  compliance!: string[];
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dataResidency?: string[];
  
  @IsEnum(['Low (<1k/month)', 'Medium (1k-50k/month)', 'High (50k-500k/month)', 'Enterprise (500k+/month)'])
  transactionVolume!: string;
}

export class IntegrationsDataDto {
  @IsArray()
  @IsString({ each: true })
  selectedIntegrations!: string[];
}

export class SelectPlanDto {
  @IsEnum(['Starter', 'Professional', 'Business', 'Enterprise'])
  @IsNotEmpty()
  planTier!: string;
}
```

### Frontend Components

#### 1. API Client (`web/src/lib/api/onboarding.ts`)

**Responsibilities**:
- Make HTTP requests to backend
- Handle authentication tokens
- Transform request/response data
- Handle errors

**Methods**:

```typescript
export class OnboardingApiClient {
  
  // Save progress for current step
  async saveProgress(
    data: Partial<OnboardingData>
  ): Promise<OnboardingData>
  
  // Get current onboarding progress
  async getProgress(): Promise<OnboardingProgress | null>
  
  // Mark onboarding as complete
  async completeOnboarding(): Promise<void>
  
  // Get plan recommendations
  async recommendPlan(): Promise<PlanRecommendation[]>
  
  // Select a plan
  async selectPlan(planTier: PlanTier): Promise<void>
}
```

#### 2. Zustand Store (`web/src/stores/onboarding.store.ts`)

**Responsibilities**:
- Manage onboarding state across steps
- Provide actions to update state
- Persist state to backend
- Handle loading and error states

**State Shape**:

```typescript
interface OnboardingStore {
  // State
  data: OnboardingData;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBusinessInfo: (info: BusinessInfo) => Promise<void>;
  setFeatures: (features: ProductFeatures) => Promise<void>;
  setTeamSize: (teamSize: TeamSize) => Promise<void>;
  setLocations: (locations: LocationsData) => Promise<void>;
  setInfrastructure: (infrastructure: InfrastructureData) => Promise<void>;
  setIntegrations: (integrations: IntegrationsData) => Promise<void>;
  
  loadProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  
  setCurrentStep: (step: OnboardingStep) => void;
  markStepComplete: (step: OnboardingStep) => void;
  
  reset: () => void;
}
```

#### 3. React Query Hooks (`web/src/hooks/useOnboarding.ts`)

**Responsibilities**:
- Provide React Query hooks for data fetching
- Handle caching and refetching
- Provide mutation hooks for updates

**Hooks**:

```typescript
// Query hooks
export function useOnboardingProgress()
export function usePlanRecommendations()

// Mutation hooks
export function useSaveProgress()
export function useCompleteOnboarding()
export function useSelectPlan()
```

## Data Models

### Shared TypeScript Interfaces

These interfaces are shared between frontend and backend to ensure type safety:

```typescript
// Core onboarding data structure
export interface OnboardingData {
  businessInfo?: BusinessInfo;
  features?: ProductFeatures;
  teamSize?: TeamSize;
  locations?: LocationsData;
  infrastructure?: InfrastructureData;
  integrations?: IntegrationsData;
  recommendedPlan?: PlanTier;
}

export interface BusinessInfo {
  businessName: string;
  industry: string;
  businessType: BusinessType;
  country: string;
  registrationNumber?: string;
  website?: string;
}

export interface ProductFeatures {
  selectedFeatures: string[];
}

export interface TeamSize {
  current: number;
  growthProjection: GrowthProjection;
}

export interface LocationsData {
  multiLocation: boolean;
  count?: number;
  types?: LocationType[];
  geographicSpread?: GeographicSpread;
}

export interface InfrastructureData {
  provider: CloudProvider;
  storage: number;
  region: string;
  compliance: ComplianceRequirement[];
  dataResidency?: string[];
  transactionVolume: TransactionVolume;
}

export interface IntegrationsData {
  selectedIntegrations: string[];
}

// Progress tracking
export interface OnboardingProgress {
  organizationId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: OnboardingData;
  onboardingCompleted: boolean;
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
}

// Plan recommendation
export interface PlanRecommendation {
  tier: PlanTier;
  score: number;
  confidence: number;
  reasons: string[];
  monthlyPrice: number;
  features: string[];
  limits: {
    maxUsers: number;
    maxLocations: number;
  };
  alternatives?: {
    tier: PlanTier;
    reason: string;
  }[];
}

// Plan definition (backend only)
export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  maxUsers: number;
  maxLocations: number;
  features: string[];
  targetSegments: {
    teamSizeMin: number;
    teamSizeMax: number;
    locationCountMin: number;
    locationCountMax: number;
    featureComplexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  };
}

// Type aliases
export type PlanTier = 'Starter' | 'Professional' | 'Business' | 'Enterprise';
export type BusinessType = 'Retail' | 'Wholesale' | 'Manufacturing' | 'Service' | 'E-commerce' | 'Hybrid';
export type CloudProvider = 'aws' | 'azure';
export type GrowthProjection = 'None' | '2x' | '5x' | '10x+';
export type GeographicSpread = 'Single city' | 'Multiple cities' | 'Regional' | 'National' | 'International';
export type LocationType = 'Retail stores' | 'Warehouses' | 'Offices' | 'Manufacturing' | 'Pop-up/Mobile';
export type ComplianceRequirement = 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC 2';
export type TransactionVolume = 'Low (<1k/month)' | 'Medium (1k-50k/month)' | 'High (50k-500k/month)' | 'Enterprise (500k+/month)';
export type OnboardingStep = 'welcome' | 'business-info' | 'products' | 'team-size' | 'locations' | 'infrastructure' | 'integrations' | 'plan-recommendation' | 'payment';
```

### Database Schema

The onboarding data is stored in the existing `Organization` model:

```prisma
model Organization {
  // ... existing fields ...
  
  // Onboarding fields
  onboardingCompleted Boolean @default(false)
  onboardingData      Json?    // Stores OnboardingData as JSON
  
  // ... rest of model ...
}
```

## Plan Recommendation Engine

### Algorithm Design

The plan recommendation engine uses a weighted scoring system that analyzes multiple factors:

**Scoring Factors**:

1. **Team Size Score (Weight: 30%)**
   - Maps employee count to plan capacity
   - Considers growth projection
   - Formula: `score = min(100, (teamSize / planMaxUsers) * 100 * growthMultiplier)`

2. **Feature Complexity Score (Weight: 25%)**
   - Counts selected features
   - Categorizes features by complexity tier
   - Formula: `score = (selectedFeatureCount / totalAvailableFeatures) * complexityWeight`

3. **Infrastructure Score (Weight: 20%)**
   - Analyzes storage requirements
   - Considers transaction volume
   - Evaluates compliance needs
   - Formula: `score = (storageScore + transactionScore + complianceScore) / 3`

4. **Location Score (Weight: 15%)**
   - Evaluates multi-location needs
   - Considers geographic spread
   - Formula: `score = min(100, (locationCount / planMaxLocations) * 100)`

5. **Business Context Score (Weight: 10%)**
   - Industry-specific requirements
   - Business type considerations
   - Formula: `score = industryWeight * businessTypeWeight`

**Final Score Calculation**:

```typescript
finalScore = (
  teamSizeScore * 0.30 +
  featureComplexityScore * 0.25 +
  infrastructureScore * 0.20 +
  locationScore * 0.15 +
  businessContextScore * 0.10
)
```

**Confidence Calculation**:

```typescript
confidence = min(100, (
  dataCompletenessScore * 0.40 +
  scoreDistributionScore * 0.30 +
  consistencyScore * 0.30
))
```

### Plan Definitions

```typescript
const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    tier: 'Starter',
    name: 'Starter Plan',
    monthlyPrice: 29,
    maxUsers: 10,
    maxLocations: 1,
    features: [
      'Basic user management',
      'Single location',
      'Email support',
      'Core features',
      '10 GB storage'
    ],
    targetSegments: {
      teamSizeMin: 1,
      teamSizeMax: 10,
      locationCountMin: 1,
      locationCountMax: 1,
      featureComplexity: 'basic'
    }
  },
  {
    tier: 'Professional',
    name: 'Professional Plan',
    monthlyPrice: 99,
    maxUsers: 50,
    maxLocations: 5,
    features: [
      'Advanced user management',
      'Multiple locations (up to 5)',
      'Role-based access control',
      'Priority support',
      'Advanced features',
      '50 GB storage',
      'API access'
    ],
    targetSegments: {
      teamSizeMin: 11,
      teamSizeMax: 50,
      locationCountMin: 1,
      locationCountMax: 5,
      featureComplexity: 'intermediate'
    }
  },
  {
    tier: 'Business',
    name: 'Business Plan',
    monthlyPrice: 299,
    maxUsers: 200,
    maxLocations: 20,
    features: [
      'Enterprise user management',
      'Unlimited locations',
      'Advanced permissions',
      'Department management',
      'Audit logging',
      '24/7 support',
      'All features',
      '200 GB storage',
      'Advanced API access',
      'Custom integrations'
    ],
    targetSegments: {
      teamSizeMin: 51,
      teamSizeMax: 200,
      locationCountMin: 6,
      locationCountMax: 20,
      featureComplexity: 'advanced'
    }
  },
  {
    tier: 'Enterprise',
    name: 'Enterprise Plan',
    monthlyPrice: 999,
    maxUsers: 1000,
    maxLocations: 100,
    features: [
      'All Business features',
      'Unlimited users',
      'Unlimited locations',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security',
      'Unlimited storage',
      'White-label options',
      'Custom development'
    ],
    targetSegments: {
      teamSizeMin: 201,
      teamSizeMax: 10000,
      locationCountMin: 21,
      locationCountMax: 1000,
      featureComplexity: 'enterprise'
    }
  }
];
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Data Persistence Round Trip

*For any* onboarding data saved to the backend, retrieving it should return equivalent data with all fields preserved.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Incremental Data Preservation

*For any* sequence of step data saves, all previously saved data should remain intact when new step data is added.

**Validates: Requirements 1.5**

### Property 3: Authentication Required for All Endpoints

*For any* onboarding API endpoint, calling it without a valid JWT token should return a 401 Unauthorized response.

**Validates: Requirements 2.5, 7.1**

### Property 4: Invalid Data Rejection

*For any* request with invalid data (missing required fields, out-of-range values, or wrong types), the backend should return a 400 Bad Request response with specific validation errors.

**Validates: Requirements 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 5: Plan Recommendation Score Bounds

*For any* onboarding data, the confidence score returned by the plan recommendation algorithm should be between 0 and 100 inclusive.

**Validates: Requirements 5.5**

### Property 6: Plan Recommendation Completeness

*For any* plan recommendation response, it should include a recommended tier, confidence score, at least one reason, alternative plans, monthly cost, and feature list.

**Validates: Requirements 5.6, 5.7, 5.8**

### Property 7: Recommendation Algorithm Sensitivity

*For any* two onboarding data sets that differ in team size, selected features, infrastructure requirements, or business context, the plan recommendation scores should reflect those differences.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 8: Progress Tracking Accuracy

*For any* set of completed steps, the calculated completion percentage should equal (completedSteps.length / totalRequiredSteps) * 100.

**Validates: Requirements 6.1, 6.2**

### Property 9: Completion State Consistency

*For any* organization where all required onboarding steps are completed, the onboardingCompleted field should be true and all step data should be present in the database.

**Validates: Requirements 6.5, 13.1, 13.2**

### Property 10: Organization Data Association

*For any* onboarding data saved by a user, it should be associated with that user's organization and not accessible to users from other organizations.

**Validates: Requirements 7.3**

### Property 11: Plan Selection Updates Organization Limits

*For any* plan tier selected, the organization's maxUsers, maxLocations, subscriptionPlan, and subscriptionStatus fields should be updated to match the plan definition.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 12: Error Logging Completeness

*For any* error that occurs during onboarding operations, an error log entry should be created with sufficient details for debugging.

**Validates: Requirements 9.4**

### Property 13: State Synchronization Order

*For any* step completion, the frontend state should be updated before navigation occurs, and the backend should be called to persist the state.

**Validates: Requirements 10.2, 10.4**

### Property 14: State Restoration Consistency

*For any* saved onboarding state, navigating back to a previous step should populate all form fields with the saved values.

**Validates: Requirements 10.3**

### Property 15: API Client Error Handling

*For any* network failure or timeout, the API client should handle the error gracefully and provide retry capability.

**Validates: Requirements 11.2, 11.3**

### Property 16: Authentication Token Attachment

*For any* API request made by the frontend, it should include a valid authentication token in the Authorization header.

**Validates: Requirements 11.5**

### Property 17: Data Type Transformation Correctness

*For any* form input (checkboxes, radio buttons, number inputs, boolean toggles), the data should be transformed to the correct type before sending to the backend.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 18: Optional Field Omission

*For any* optional field that is empty or undefined, it should be omitted from the API payload rather than sent as null or empty string.

**Validates: Requirements 12.5**

## Error Handling

### Error Categories

1. **Validation Errors (400 Bad Request)**
   - Missing required fields
   - Invalid data types
   - Out-of-range values
   - Invalid enum values
   - Handled by: class-validator DTOs on backend

2. **Authentication Errors (401 Unauthorized)**
   - Missing JWT token
   - Expired JWT token
   - Invalid JWT token
   - Handled by: JwtAuthGuard on backend

3. **Authorization Errors (403 Forbidden)**
   - User attempting to access another organization's data
   - Handled by: Organization ID validation in service layer

4. **Not Found Errors (404 Not Found)**
   - Organization not found
   - Onboarding progress not found
   - Handled by: Service layer checks

5. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Unexpected exceptions
   - Handled by: Global exception filter

6. **Network Errors (Client-side)**
   - Request timeout
   - Connection refused
   - DNS resolution failure
   - Handled by: API client retry logic

### Error Response Format

All backend errors follow a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
```

### Frontend Error Handling Strategy

1. **Display User-Friendly Messages**
   - Map technical errors to user-friendly text
   - Provide actionable guidance
   - Avoid exposing technical details

2. **Preserve User Input**
   - Keep form data in state during errors
   - Allow users to retry without re-entering data

3. **Retry Logic**
   - Automatic retry for transient network errors (up to 3 attempts)
   - Manual retry button for persistent errors
   - Exponential backoff for automatic retries

4. **Error Logging**
   - Log all errors to console in development
   - Send error reports to monitoring service in production
   - Include context (user ID, organization ID, step, timestamp)

### Backend Error Handling Strategy

1. **Validation Errors**
   - Return detailed field-level errors
   - Include validation rule that failed
   - Provide example of valid input

2. **Database Errors**
   - Log full error details
   - Return generic message to client
   - Trigger alerts for critical failures

3. **Authentication Errors**
   - Clear session if token is invalid
   - Redirect to login page
   - Preserve intended destination for post-login redirect

## Testing Strategy

### Unit Testing

**Backend Unit Tests**:

1. **Onboarding Service Tests**
   - Test `saveProgress` with various data combinations
   - Test `getProgress` returns correct data
   - Test `completeOnboarding` sets correct flags
   - Test `recommendPlan` algorithm with edge cases
   - Test `selectPlan` updates organization correctly

2. **Plan Recommendation Algorithm Tests**
   - Test score calculation for each factor
   - Test weight application
   - Test confidence calculation
   - Test edge cases (minimal data, maximal data)
   - Test consistency (same input = same output)

3. **Validation Tests**
   - Test each DTO with valid data
   - Test each DTO with invalid data
   - Test boundary values
   - Test optional field handling

**Frontend Unit Tests**:

1. **API Client Tests**
   - Test each method with mock responses
   - Test error handling
   - Test retry logic
   - Test timeout handling
   - Test token attachment

2. **Store Tests**
   - Test state updates
   - Test action creators
   - Test derived state calculations
   - Test persistence logic

3. **Transformation Tests**
   - Test checkbox to array transformation
   - Test radio to string transformation
   - Test number input transformation
   - Test boolean toggle transformation
   - Test optional field omission

### Property-Based Testing

**Configuration**: Minimum 100 iterations per property test

**Property Tests to Implement**:

1. **Property 1: Data Persistence Round Trip**
   - Generate random onboarding data
   - Save to backend
   - Retrieve from backend
   - Assert retrieved data equals saved data
   - **Tag**: Feature: onboarding-system-integration, Property 1: Data Persistence Round Trip

2. **Property 2: Incremental Data Preservation**
   - Generate random initial data
   - Save initial data
   - Generate random additional data
   - Save additional data
   - Retrieve all data
   - Assert initial data is still present
   - **Tag**: Feature: onboarding-system-integration, Property 2: Incremental Data Preservation

3. **Property 5: Plan Recommendation Score Bounds**
   - Generate random onboarding data
   - Call recommend plan
   - Assert confidence score >= 0 and <= 100
   - **Tag**: Feature: onboarding-system-integration, Property 5: Plan Recommendation Score Bounds

4. **Property 7: Recommendation Algorithm Sensitivity**
   - Generate two different onboarding data sets
   - Call recommend plan for each
   - Assert scores differ when inputs differ significantly
   - **Tag**: Feature: onboarding-system-integration, Property 7: Recommendation Algorithm Sensitivity

5. **Property 8: Progress Tracking Accuracy**
   - Generate random set of completed steps
   - Calculate percentage
   - Assert percentage = (completed / total) * 100
   - **Tag**: Feature: onboarding-system-integration, Property 8: Progress Tracking Accuracy

6. **Property 11: Plan Selection Updates Organization Limits**
   - Generate random plan tier
   - Call select plan
   - Query organization
   - Assert limits match plan definition
   - **Tag**: Feature: onboarding-system-integration, Property 11: Plan Selection Updates Organization Limits

7. **Property 17: Data Type Transformation Correctness**
   - Generate random form inputs
   - Transform data
   - Assert types are correct
   - **Tag**: Feature: onboarding-system-integration, Property 17: Data Type Transformation Correctness

### Integration Testing

**API Endpoint Tests**:

1. **POST /api/onboarding/progress**
   - Test with valid data
   - Test with invalid data
   - Test without authentication
   - Test with different step data

2. **GET /api/onboarding/progress**
   - Test retrieval of saved data
   - Test with no saved data
   - Test without authentication

3. **POST /api/onboarding/complete**
   - Test marking as complete
   - Test with incomplete data
   - Test without authentication

4. **POST /api/onboarding/recommend-plan**
   - Test with complete data
   - Test with partial data
   - Test without authentication

5. **POST /api/onboarding/select-plan**
   - Test with valid plan tier
   - Test with invalid plan tier
   - Test without authentication

**End-to-End Flow Tests**:

1. **Complete Onboarding Flow**
   - Register new user
   - Complete each onboarding step
   - Verify data saved at each step
   - Get plan recommendation
   - Select plan
   - Verify organization updated
   - Verify redirect to dashboard

2. **Resume Onboarding Flow**
   - Start onboarding
   - Complete some steps
   - Log out
   - Log back in
   - Verify progress restored
   - Complete remaining steps

3. **Error Recovery Flow**
   - Start onboarding
   - Simulate network error
   - Verify error message
   - Retry operation
   - Verify success

### Test Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 70% code coverage
- **Critical paths**: 100% coverage (authentication, data persistence, plan recommendation)

### Testing Tools

**Backend**:
- Jest for unit and integration tests
- Supertest for API endpoint tests
- fast-check for property-based tests

**Frontend**:
- Jest for unit tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking
- fast-check for property-based tests

## Implementation Notes

### Shared Type Definitions

To ensure type safety across the frontend-backend boundary, create a shared types package:

**Option 1: Monorepo Shared Package**
```
/packages
  /shared-types
    /src
      /onboarding
        index.ts
        types.ts
    package.json
    tsconfig.json
```

**Option 2: Copy Types with Validation**
- Define types in backend
- Copy to frontend
- Add CI check to ensure types stay in sync

**Recommendation**: Use Option 1 for better maintainability

### Database Considerations

**JSON Field Structure**:
The `Organization.onboardingData` JSON field stores the complete `OnboardingData` object. This approach:
- Allows flexible schema evolution
- Avoids complex relational modeling
- Simplifies queries (single field read/write)
- Enables easy data export

**Indexing**:
Consider adding a GIN index on the JSON field for faster queries:
```sql
CREATE INDEX idx_organization_onboarding_data 
ON organizations USING GIN (onboarding_data);
```

### Performance Considerations

1. **API Response Times**
   - Target: < 200ms for save operations
   - Target: < 100ms for retrieve operations
   - Target: < 500ms for plan recommendations

2. **Frontend Optimizations**
   - Debounce auto-save (if implemented)
   - Optimistic UI updates
   - Lazy load step components
   - Cache plan recommendations

3. **Backend Optimizations**
   - Cache plan definitions in memory
   - Use database connection pooling
   - Implement request rate limiting

### Security Considerations

1. **Data Validation**
   - Validate all inputs on backend (never trust frontend)
   - Sanitize user inputs to prevent injection
   - Enforce maximum payload sizes

2. **Authentication**
   - Verify JWT on every request
   - Check token expiration
   - Validate organization ownership

3. **Authorization**
   - Ensure users can only access their organization's data
   - Implement organization ID checks in all queries

4. **Data Privacy**
   - Log only non-sensitive data
   - Encrypt sensitive fields if needed
   - Comply with data retention policies

### Migration Strategy

Since this is a new feature being added to an existing system:

1. **Phase 1: Backend Implementation**
   - Create onboarding module
   - Implement service and controller
   - Add tests
   - Deploy to staging

2. **Phase 2: Frontend Implementation**
   - Create API client
   - Implement Zustand store
   - Update onboarding pages
   - Add tests
   - Deploy to staging

3. **Phase 3: Integration Testing**
   - Test complete flow in staging
   - Fix any issues
   - Performance testing
   - Security review

4. **Phase 4: Production Deployment**
   - Deploy backend first
   - Monitor for errors
   - Deploy frontend
   - Monitor user flows
   - Gather feedback

### Monitoring and Observability

**Metrics to Track**:
- Onboarding completion rate
- Average time per step
- Drop-off points
- Plan recommendation accuracy
- API error rates
- API response times

**Logging**:
- Log all onboarding events (step completion, errors, plan selection)
- Include user ID, organization ID, timestamp
- Use structured logging (JSON format)

**Alerts**:
- Alert on high error rates (> 5%)
- Alert on slow API responses (> 1s)
- Alert on authentication failures spike
- Alert on database connection issues
