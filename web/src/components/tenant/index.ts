/**
 * Tenant Components
 * Comprehensive tenant management UI components
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
 */

// Main tenant management components
export { TenantManager } from './TenantManager';
export { 
  TenantSwitcher, 
  CompactTenantSwitcher, 
  LogoTenantSwitcher 
} from './TenantSwitcher';

// Feature and status components
export { 
  FeatureStatus, 
  FeatureStatusList, 
  FeatureStatusBadge,
  TierStatus,
} from './FeatureStatus';

// Re-export tenant provider components for convenience
export {
  FeatureGate,
  TierGate,
  TenantGate,
  TenantLoading,
  TenantError,
} from '@/lib/tenant/tenant-provider';

// Re-export theme components
export {
  TenantLogo,
  TenantButton,
  TenantCard,
} from '@/lib/tenant/theme-provider';