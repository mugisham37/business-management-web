/**
 * Cache Management Module
 * 
 * Exports all cache-related utilities:
 * - Apollo cache configuration
 * - Cache updater functions
 * - Cache eviction strategies
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */

// Apollo cache configuration
export { cache, typePolicies } from './apollo-cache-config';

// Cache updater functions
export {
  // Types
  type User,
  type Permission,
  type Organization,
  type Branch,
  type Department,
  type BusinessRule,
  type AuditLog,
  type Session,
  type UserPermissions,
  
  // User cache updaters
  updateUsersCache,
  updateUserCache,
  updateCacheAfterDeleteUser,
  
  // Permission cache updaters
  updateUserPermissionsCache,
  updateCacheAfterCreatePermission,
  updateCacheAfterUpdatePermission,
  updateCacheAfterDeletePermission,
  
  // Organization cache updaters
  updateCacheAfterCreateOrganization,
  updateCacheAfterUpdateOrganization,
  updateCacheAfterDeleteOrganization,
  
  // Branch cache updaters
  updateBranchesCache,
  updateCacheAfterDeleteBranch,
  
  // Department cache updaters
  updateDepartmentsCache,
  updateCacheAfterDeleteDepartment,
  
  // Business rule cache updaters
  updateBusinessRulesCache,
  updateCacheAfterDeleteBusinessRule,
  
  // Session cache updaters
  updateSessionsCache,
  clearSessionsCache,
  
  // Audit log cache updaters
  updateCacheAfterCreateAuditLog,
  
  // Utility functions
  invalidateQueries,
  clearCache,
  
  // Grouped exports
  cacheUpdaters,
} from './cache-updaters';

// Cache eviction strategies
export {
  // TTL configuration
  TTL_CONFIG,
  
  // Eviction functions
  recordCacheEntry,
  isCacheEntryExpired,
  evictExpiredEntries,
  evictEntityType,
  evictByPattern,
  evictUserData,
  evictOrganizationData,
  startCacheCleanup,
  clearCacheMetadata,
  getCacheStats,
  
  // Grouped exports
  cacheEviction,
} from './cache-eviction';

// Cache TTL management
export {
  TTL_CONFIG as CACHE_TTL_CONFIG,
  CacheTTLManager,
  initializeTTLManager,
  getTTLManager,
} from './cache-ttl';
