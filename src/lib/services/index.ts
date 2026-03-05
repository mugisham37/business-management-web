/**
 * Service Layer Exports
 * 
 * Central export point for all service layer modules.
 * Services provide abstraction between UI components and API calls.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

// Auth Service
export {
  AuthService,
  getAuthService,
  type RegisterOwnerInput,
  type LoginInput,
  type LoginWithPinInput,
  type RefreshTokenInput,
  type ChangePasswordInput,
  type AuthResponse,
  type RegisterOwnerResponse,
} from './auth.service';

// User Service
export {
  UserService,
  getUserService,
  type CreateManagerInput,
  type CreateWorkerInput,
  type UpdateUserInput,
  type CreateUserResponse,
  type UsersListResponse,
} from './user.service';

// Permission Service
export {
  PermissionService,
  getPermissionService,
  type GrantPermissionsInput,
  type RevokePermissionsInput,
  type PermissionModule,
  type UserPermissionsResponse,
  type PermissionSnapshot,
  type PermissionHistoryResponse,
} from './permission.service';

// Organization Service
export {
  OrganizationService,
  getOrganizationService,
  type UpdateOrganizationInput,
  type CreateBranchInput,
  type UpdateBranchInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type BranchesListResponse,
  type DepartmentsListResponse,
} from './organization.service';

// Business Rule Service
export {
  BusinessRuleService,
  getBusinessRuleService,
  type CreateBusinessRuleInput,
  type UpdateBusinessRuleInput,
  type BusinessRulesListResponse,
} from './business-rule.service';

// Audit Service
export {
  AuditService,
  getAuditService,
  type AuditFiltersInput,
  type AuditLogsResponse,
} from './audit.service';

// Health Service
export {
  HealthService,
  getHealthService,
  type ComponentHealth,
  type HealthCheckResponse,
} from './health.service';
