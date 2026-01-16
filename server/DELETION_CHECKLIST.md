# GraphQL Migration - Deletion Checklist

## Quick Reference for File Deletions

This is a condensed checklist for executing the GraphQL-only migration.
Refer to `GRAPHQL_MIGRATION_ANALYSIS.md` for detailed analysis.

---

## Phase 1: Delete All REST Controllers (95 files)

### Analytics Module (8 controllers)
- [ ] `src/modules/analytics/controllers/analytics.controller.ts`
- [ ] `src/modules/analytics/controllers/comparative-analysis.controller.ts`
- [ ] `src/modules/analytics/controllers/custom-reporting.controller.ts`
- [ ] `src/modules/analytics/controllers/dashboard.controller.ts`
- [ ] `src/modules/analytics/controllers/data-warehouse.controller.ts`
- [ ] `src/modules/analytics/controllers/mobile-analytics.controller.ts`
- [ ] `src/modules/analytics/controllers/predictive-analytics.controller.ts`
- [ ] `src/modules/analytics/controllers/reporting.controller.ts`

### Auth Module (3 controllers)
- [ ] `src/modules/auth/controllers/auth.controller.ts`
- [ ] `src/modules/auth/controllers/mfa.controller.ts`
- [ ] `src/modules/auth/controllers/permissions.controller.ts`

### B2B Module (5 controllers)
- [ ] `src/modules/b2b/controllers/b2b-order.controller.ts`
- [ ] `src/modules/b2b/controllers/contract.controller.ts`
- [ ] `src/modules/b2b/controllers/customer-portal.controller.ts`
- [ ] `src/modules/b2b/controllers/quote.controller.ts`
- [ ] `src/modules/b2b/controllers/territory.controller.ts`

### Backup Module (1 controller)
- [ ] `src/modules/backup/controllers/backup.controller.ts`

### CRM Module (6 controllers)
- [ ] `src/modules/crm/controllers/b2b-customer.controller.ts`
- [ ] `src/modules/crm/controllers/communication.controller.ts`
- [ ] `src/modules/crm/controllers/customer-analytics.controller.ts`
- [ ] `src/modules/crm/controllers/customer.controller.ts`
- [ ] `src/modules/crm/controllers/loyalty.controller.ts`
- [ ] `src/modules/crm/controllers/segmentation.controller.ts`

### Employee Module (4 controllers)
- [ ] `src/modules/employee/controllers/compliance.controller.ts`
- [ ] `src/modules/employee/controllers/employee.controller.ts`
- [ ] `src/modules/employee/controllers/payroll.controller.ts`
- [ ] `src/modules/employee/controllers/performance.controller.ts`

### Financial Module (9 controllers)
- [ ] `src/modules/financial/controllers/accounting.controller.ts`
- [ ] `src/modules/financial/controllers/accounts-receivable-payable.controller.ts`
- [ ] `src/modules/financial/controllers/budget.controller.ts`
- [ ] `src/modules/financial/controllers/chart-of-accounts.controller.ts`
- [ ] `src/modules/financial/controllers/financial-reporting.controller.ts`
- [ ] `src/modules/financial/controllers/journal-entry.controller.ts`
- [ ] `src/modules/financial/controllers/multi-currency.controller.ts`
- [ ] `src/modules/financial/controllers/reconciliation.controller.ts`
- [ ] `src/modules/financial/controllers/tax.controller.ts`

### Integration Module (4 controllers)
- [ ] `src/modules/integration/controllers/connector.controller.ts`
- [ ] `src/modules/integration/controllers/developer-portal.controller.ts`
- [ ] `src/modules/integration/controllers/integration.controller.ts`
- [ ] `src/modules/integration/controllers/webhook.controller.ts`

### Inventory Module (11 controllers)
- [ ] `src/modules/inventory/controllers/batch-tracking.controller.ts`
- [ ] `src/modules/inventory/controllers/brand.controller.ts`
- [ ] `src/modules/inventory/controllers/category.controller.ts`
- [ ] `src/modules/inventory/controllers/cycle-counting.controller.ts`
- [ ] `src/modules/inventory/controllers/inventory-accuracy-reporting.controller.ts`
- [ ] `src/modules/inventory/controllers/inventory-movement-tracking.controller.ts`
- [ ] `src/modules/inventory/controllers/inventory-reporting.controller.ts`
- [ ] `src/modules/inventory/controllers/inventory.controller.ts`
- [ ] `src/modules/inventory/controllers/perpetual-inventory.controller.ts`
- [ ] `src/modules/inventory/controllers/product.controller.ts`
- [ ] `src/modules/inventory/controllers/reorder.controller.ts`

### Location Module (9 controllers)
- [ ] `src/modules/location/controllers/dealer-portal.controller.ts`
- [ ] `src/modules/location/controllers/franchise.controller.ts`
- [ ] `src/modules/location/controllers/location-inventory-policy.controller.ts`
- [ ] `src/modules/location/controllers/location-pricing.controller.ts`
- [ ] `src/modules/location/controllers/location-promotion.controller.ts`
- [ ] `src/modules/location/controllers/location-reporting.controller.ts`
- [ ] `src/modules/location/controllers/location-sync.controller.ts`
- [ ] `src/modules/location/controllers/location.controller.ts`
- [ ] `src/modules/location/controllers/territory.controller.ts`

### Mobile Module (1 controller)
- [ ] `src/modules/mobile/controllers/mobile-api.controller.ts`

### POS Module (3 controllers)
- [ ] `src/modules/pos/controllers/offline.controller.ts`
- [ ] `src/modules/pos/controllers/pos.controller.ts`
- [ ] `src/modules/pos/controllers/transaction.controller.ts`

### Realtime Module (4 controllers)
- [ ] `src/modules/realtime/controllers/communication-integration.controller.ts`
- [ ] `src/modules/realtime/controllers/live-data.controller.ts`
- [ ] `src/modules/realtime/controllers/notification.controller.ts`
- [ ] `src/modules/realtime/controllers/realtime.controller.ts`

### Security Module (4 controllers)
- [ ] `src/modules/security/controllers/audit.controller.ts`
- [ ] `src/modules/security/controllers/compliance.controller.ts`
- [ ] `src/modules/security/controllers/security-dashboard.controller.ts`
- [ ] `src/modules/security/controllers/security.controller.ts`

### Supplier Module (4 controllers)
- [ ] `src/modules/supplier/controllers/edi-integration.controller.ts`
- [ ] `src/modules/supplier/controllers/supplier.controller.ts`
- [ ] `src/modules/supplier/controllers/purchase-order.controller.ts`
- [ ] `src/modules/supplier/controllers/procurement-analytics.controller.ts`

### Tenant Module (3 controllers)
- [ ] `src/modules/tenant/controllers/tenant.controller.ts`
- [ ] `src/modules/tenant/controllers/tenant-metrics.controller.ts`
- [ ] `src/modules/tenant/controllers/feature-flag.controller.ts`

### Warehouse Module (8 controllers)
- [ ] `src/modules/warehouse/controllers/warehouse.controller.ts`
- [ ] `src/modules/warehouse/controllers/warehouse-zone.controller.ts`
- [ ] `src/modules/warehouse/controllers/shipping-integration.controller.ts`
- [ ] `src/modules/warehouse/controllers/picking-wave.controller.ts`
- [ ] `src/modules/warehouse/controllers/pick-list.controller.ts`
- [ ] `src/modules/warehouse/controllers/lot-tracking.controller.ts`
- [ ] `src/modules/warehouse/controllers/kitting-assembly.controller.ts`
- [ ] `src/modules/warehouse/controllers/bin-location.controller.ts`

### Disaster Recovery Module (1 controller)
- [ ] `src/modules/disaster-recovery/controllers/disaster-recovery.controller.ts`

---

## Phase 2: Delete All DTOs (54 files)

### Auth Module (2 DTOs)
- [ ] `src/modules/auth/dto/auth.dto.ts`
- [ ] `src/modules/auth/dto/mfa.dto.ts`

### B2B Module (5 DTOs)
- [ ] `src/modules/b2b/dto/b2b-order.dto.ts`
- [ ] `src/modules/b2b/dto/contract.dto.ts`
- [ ] `src/modules/b2b/dto/customer-portal.dto.ts`
- [ ] `src/modules/b2b/dto/quote.dto.ts`
- [ ] `src/modules/b2b/dto/territory.dto.ts`

### Backup Module (1 DTO)
- [ ] `src/modules/backup/dto/backup.dto.ts`

### CRM Module (3 DTOs)
- [ ] `src/modules/crm/dto/b2b-customer.dto.ts`
- [ ] `src/modules/crm/dto/customer.dto.ts`
- [ ] `src/modules/crm/dto/loyalty.dto.ts`

### Employee Module (3 DTOs)
- [ ] `src/modules/employee/dto/compliance.dto.ts`
- [ ] `src/modules/employee/dto/employee.dto.ts`
- [ ] `src/modules/employee/dto/payroll.dto.ts`

### Financial Module (3 DTOs)
- [ ] `src/modules/financial/dto/chart-of-accounts.dto.ts`
- [ ] `src/modules/financial/dto/journal-entry.dto.ts`
- [ ] `src/modules/financial/dto/tax.dto.ts`

### Integration Module (5 DTOs)
- [ ] `src/modules/integration/dto/api-key.dto.ts`
- [ ] `src/modules/integration/dto/connector.dto.ts`
- [ ] `src/modules/integration/dto/integration.dto.ts`
- [ ] `src/modules/integration/dto/oauth2.dto.ts`
- [ ] `src/modules/integration/dto/webhook.dto.ts`

### Inventory Module (4 DTOs)
- [ ] `src/modules/inventory/dto/brand.dto.ts`
- [ ] `src/modules/inventory/dto/category.dto.ts`
- [ ] `src/modules/inventory/dto/inventory.dto.ts`
- [ ] `src/modules/inventory/dto/product.dto.ts`

### Location Module (6 DTOs)
- [ ] `src/modules/location/dto/franchise.dto.ts`
- [ ] `src/modules/location/dto/location-inventory-policy.dto.ts`
- [ ] `src/modules/location/dto/location-pricing.dto.ts`
- [ ] `src/modules/location/dto/location-promotion.dto.ts`
- [ ] `src/modules/location/dto/location-reporting.dto.ts`
- [ ] `src/modules/location/dto/location.dto.ts`

### POS Module (1 DTO)
- [ ] `src/modules/pos/dto/transaction.dto.ts`

### Realtime Module (2 DTOs)
- [ ] `src/modules/realtime/dto/communication-integration.dto.ts`
- [ ] `src/modules/realtime/dto/notification.dto.ts`

### Warehouse Module (4 DTOs)
- [ ] `src/modules/warehouse/dto/warehouse.dto.ts`
- [ ] `src/modules/warehouse/dto/shipping.dto.ts`
- [ ] `src/modules/warehouse/dto/picking.dto.ts`
- [ ] `src/modules/warehouse/dto/lot-tracking.dto.ts`

### Disaster Recovery Module (1 DTO)
- [ ] `src/modules/disaster-recovery/dto/disaster-recovery.dto.ts`

---

## Phase 3: Delete REST Infrastructure

### Common REST Module (entire directory)
- [ ] `src/common/rest/` (DELETE ENTIRE DIRECTORY)

### Auth Strategies (REST-specific)
- [ ] `src/modules/auth/strategies/jwt.strategy.ts`
- [ ] `src/modules/auth/strategies/local.strategy.ts`

### Auth Guards (REST-specific)
- [ ] `src/modules/auth/guards/local-auth.guard.ts`

### Integration Guards (REST-specific)
- [ ] `src/modules/integration/guards/integration-auth.guard.ts`
- [ ] `src/modules/integration/guards/rate-limit.guard.ts`

### Integration Interceptors (REST-specific)
- [ ] `src/modules/integration/interceptors/integration-logging.interceptor.ts`

### Mobile Interceptors (REST-specific)
- [ ] `src/modules/mobile/interceptors/compression.interceptor.ts`
- [ ] `src/modules/mobile/interceptors/mobile-api.interceptor.ts`

### Configuration Files
- [ ] `src/config/swagger.config.ts`

---

## Phase 4: Review Before Deleting (Shared Infrastructure)

### Auth Module - Review if used by GraphQL
- [ ] `src/modules/auth/guards/jwt-auth.guard.ts` (check if used globally)
- [ ] `src/modules/auth/guards/roles.guard.ts` (may be used by GraphQL)
- [ ] `src/modules/auth/guards/permissions.guard.ts` (may be used by GraphQL)
- [ ] `src/modules/auth/decorators/auth.decorators.ts`
- [ ] `src/modules/auth/decorators/current-user.decorator.ts`
- [ ] `src/modules/auth/decorators/permission.decorator.ts`
- [ ] `src/modules/auth/decorators/permissions.decorator.ts`
- [ ] `src/modules/auth/decorators/require-permission.decorator.ts`
- [ ] `src/modules/auth/decorators/user.decorator.ts`

### Security Module - Review if used by GraphQL
- [ ] `src/modules/security/guards/security.guard.ts`
- [ ] `src/modules/security/guards/threat-detection.guard.ts`
- [ ] `src/modules/security/interceptors/audit.interceptor.ts`
- [ ] `src/modules/security/interceptors/security.interceptor.ts`

### Tenant Module - Review if used by GraphQL
- [ ] `src/modules/tenant/guards/tenant.guard.ts`
- [ ] `src/modules/tenant/decorators/tenant.decorators.ts`
- [ ] `src/modules/tenant/interceptors/*`

### Common - Review if used by GraphQL
- [ ] `src/common/decorators/public.decorator.ts`
- [ ] `src/common/filters/all-exceptions.filter.ts`
- [ ] `src/common/interceptors/cache.interceptor.ts`
- [ ] `src/common/interceptors/logging.interceptor.ts`

---

## Phase 5: Update Module Files (18 files)

Remove controller imports and registrations from:

- [ ] `src/modules/analytics/analytics.module.ts`
- [ ] `src/modules/auth/auth.module.ts`
- [ ] `src/modules/b2b/b2b.module.ts`
- [ ] `src/modules/backup/backup.module.ts`
- [ ] `src/modules/crm/crm.module.ts`
- [ ] `src/modules/employee/employee.module.ts`
- [ ] `src/modules/financial/financial.module.ts`
- [ ] `src/modules/integration/integration.module.ts`
- [ ] `src/modules/inventory/inventory.module.ts`
- [ ] `src/modules/location/location.module.ts`
- [ ] `src/modules/mobile/mobile.module.ts`
- [ ] `src/modules/pos/pos.module.ts`
- [ ] `src/modules/realtime/realtime.module.ts`
- [ ] `src/modules/security/security.module.ts`
- [ ] `src/modules/supplier/supplier.module.ts`
- [ ] `src/modules/tenant/tenant.module.ts`
- [ ] `src/modules/warehouse/warehouse.module.ts`
- [ ] `src/modules/disaster-recovery/disaster-recovery.module.ts`

---

## Phase 6: Update Core Files

### src/app.module.ts
- [ ] Remove `import { ApiController } from './common/rest/controllers/api.controller';`
- [ ] Remove `import { RestCommonModule } from './common/rest/rest-common.module';`
- [ ] Remove `ApiController` from controllers array
- [ ] Remove `RestCommonModule` from imports array

### src/main.ts
- [ ] Remove `import { setupSwagger } from './config/swagger.config';`
- [ ] Remove `app.setGlobalPrefix(apiPrefix);` (if not needed)
- [ ] Remove `setupSwagger(app);`
- [ ] Remove Swagger log messages

### src/app.controller.ts
- [ ] Review if REST-specific
- [ ] Delete if not needed

### package.json
- [ ] Remove `@nestjs/swagger` from dependencies
- [ ] Run `npm install` to clean up

---

## Testing After Each Phase

- [ ] Application starts without errors
- [ ] GraphQL Playground accessible at `/graphql`
- [ ] Sample GraphQL query works
- [ ] Sample GraphQL mutation works
- [ ] Authentication via GraphQL works
- [ ] No import errors in console
- [ ] Run test suite: `npm test`

---

## Final Verification

- [ ] All REST controllers deleted
- [ ] All DTOs deleted
- [ ] REST common module deleted
- [ ] Swagger config deleted
- [ ] Module files updated
- [ ] Core files updated
- [ ] No broken imports
- [ ] All tests pass
- [ ] GraphQL endpoints work
- [ ] Documentation updated

---

## Rollback Plan

If issues occur:
1. Revert to backup branch
2. Identify specific issue
3. Fix and retry phase
4. Continue from last successful phase

---

## Summary

**Total Files to Delete:** ~180+
**Total Module Files to Update:** 18
**Total Core Files to Update:** 3
**Estimated Time:** 6-9 days
**Risk Level:** LOW to MEDIUM

