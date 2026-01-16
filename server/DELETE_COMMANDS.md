# Automated Deletion Commands

## WARNING: Review and backup before running these commands!

These commands will permanently delete files. Make sure you have:
1. ✅ Created a backup branch
2. ✅ Reviewed the analysis document
3. ✅ Committed all current work

---

## Phase 1: Delete All Controller Directories

```powershell
# Delete all controller directories from modules
Remove-Item -Recurse -Force src/modules/analytics/controllers
Remove-Item -Recurse -Force src/modules/auth/controllers
Remove-Item -Recurse -Force src/modules/b2b/controllers
Remove-Item -Recurse -Force src/modules/backup/controllers
Remove-Item -Recurse -Force src/modules/crm/controllers
Remove-Item -Recurse -Force src/modules/employee/controllers
Remove-Item -Recurse -Force src/modules/financial/controllers
Remove-Item -Recurse -Force src/modules/integration/controllers
Remove-Item -Recurse -Force src/modules/inventory/controllers
Remove-Item -Recurse -Force src/modules/location/controllers
Remove-Item -Recurse -Force src/modules/mobile/controllers
Remove-Item -Recurse -Force src/modules/pos/controllers
Remove-Item -Recurse -Force src/modules/realtime/controllers
Remove-Item -Recurse -Force src/modules/security/controllers
Remove-Item -Recurse -Force src/modules/supplier/controllers
Remove-Item -Recurse -Force src/modules/tenant/controllers
Remove-Item -Recurse -Force src/modules/warehouse/controllers
Remove-Item -Recurse -Force src/modules/disaster-recovery/controllers
```

---

## Phase 2: Delete All DTO Directories

```powershell
# Delete all DTO directories from modules
Remove-Item -Recurse -Force src/modules/auth/dto
Remove-Item -Recurse -Force src/modules/b2b/dto
Remove-Item -Recurse -Force src/modules/backup/dto
Remove-Item -Recurse -Force src/modules/crm/dto
Remove-Item -Recurse -Force src/modules/employee/dto
Remove-Item -Recurse -Force src/modules/financial/dto
Remove-Item -Recurse -Force src/modules/integration/dto
Remove-Item -Recurse -Force src/modules/inventory/dto
Remove-Item -Recurse -Force src/modules/location/dto
Remove-Item -Recurse -Force src/modules/pos/dto
Remove-Item -Recurse -Force src/modules/realtime/dto
Remove-Item -Recurse -Force src/modules/warehouse/dto
Remove-Item -Recurse -Force src/modules/disaster-recovery/dto
```

---

## Phase 3: Delete REST-Specific Infrastructure

```powershell
# Delete entire REST common module
Remove-Item -Recurse -Force src/common/rest

# Delete auth strategies (REST-specific)
Remove-Item -Recurse -Force src/modules/auth/strategies

# Delete REST-specific guards
Remove-Item -Force src/modules/auth/guards/local-auth.guard.ts
Remove-Item -Recurse -Force src/modules/integration/guards

# Delete REST-specific interceptors
Remove-Item -Recurse -Force src/modules/integration/interceptors
Remove-Item -Recurse -Force src/modules/mobile/interceptors

# Delete Swagger configuration
Remove-Item -Force src/config/swagger.config.ts
```

---

## Phase 4: Delete Files Requiring Review (Run after manual review)

```powershell
# Auth decorators (only if confirmed not used by GraphQL)
# Remove-Item -Recurse -Force src/modules/auth/decorators

# Auth guards (only if confirmed not used by GraphQL)
# Remove-Item -Force src/modules/auth/guards/jwt-auth.guard.ts
# Remove-Item -Force src/modules/auth/guards/roles.guard.ts
# Remove-Item -Force src/modules/auth/guards/permissions.guard.ts

# Security guards/interceptors (only if confirmed not used by GraphQL)
# Remove-Item -Recurse -Force src/modules/security/guards
# Remove-Item -Recurse -Force src/modules/security/interceptors

# Tenant infrastructure (only if confirmed not used by GraphQL)
# Remove-Item -Recurse -Force src/modules/tenant/guards
# Remove-Item -Recurse -Force src/modules/tenant/decorators
# Remove-Item -Recurse -Force src/modules/tenant/interceptors

# Common decorators/filters/interceptors (only if confirmed not used by GraphQL)
# Remove-Item -Recurse -Force src/common/decorators
# Remove-Item -Recurse -Force src/common/filters
# Remove-Item -Recurse -Force src/common/interceptors
```

---

## Alternative: Delete Individual Controller Files

If you prefer to delete files individually instead of entire directories:

```powershell
# Analytics controllers
Remove-Item -Force src/modules/analytics/controllers/analytics.controller.ts
Remove-Item -Force src/modules/analytics/controllers/comparative-analysis.controller.ts
Remove-Item -Force src/modules/analytics/controllers/custom-reporting.controller.ts
Remove-Item -Force src/modules/analytics/controllers/dashboard.controller.ts
Remove-Item -Force src/modules/analytics/controllers/data-warehouse.controller.ts
Remove-Item -Force src/modules/analytics/controllers/mobile-analytics.controller.ts
Remove-Item -Force src/modules/analytics/controllers/predictive-analytics.controller.ts
Remove-Item -Force src/modules/analytics/controllers/reporting.controller.ts

# Auth controllers
Remove-Item -Force src/modules/auth/controllers/auth.controller.ts
Remove-Item -Force src/modules/auth/controllers/mfa.controller.ts
Remove-Item -Force src/modules/auth/controllers/permissions.controller.ts

# B2B controllers
Remove-Item -Force src/modules/b2b/controllers/b2b-order.controller.ts
Remove-Item -Force src/modules/b2b/controllers/contract.controller.ts
Remove-Item -Force src/modules/b2b/controllers/customer-portal.controller.ts
Remove-Item -Force src/modules/b2b/controllers/quote.controller.ts
Remove-Item -Force src/modules/b2b/controllers/territory.controller.ts

# Backup controllers
Remove-Item -Force src/modules/backup/controllers/backup.controller.ts

# CRM controllers
Remove-Item -Force src/modules/crm/controllers/b2b-customer.controller.ts
Remove-Item -Force src/modules/crm/controllers/communication.controller.ts
Remove-Item -Force src/modules/crm/controllers/customer-analytics.controller.ts
Remove-Item -Force src/modules/crm/controllers/customer.controller.ts
Remove-Item -Force src/modules/crm/controllers/loyalty.controller.ts
Remove-Item -Force src/modules/crm/controllers/segmentation.controller.ts

# Employee controllers
Remove-Item -Force src/modules/employee/controllers/compliance.controller.ts
Remove-Item -Force src/modules/employee/controllers/employee.controller.ts
Remove-Item -Force src/modules/employee/controllers/payroll.controller.ts
Remove-Item -Force src/modules/employee/controllers/performance.controller.ts

# Financial controllers
Remove-Item -Force src/modules/financial/controllers/accounting.controller.ts
Remove-Item -Force src/modules/financial/controllers/accounts-receivable-payable.controller.ts
Remove-Item -Force src/modules/financial/controllers/budget.controller.ts
Remove-Item -Force src/modules/financial/controllers/chart-of-accounts.controller.ts
Remove-Item -Force src/modules/financial/controllers/financial-reporting.controller.ts
Remove-Item -Force src/modules/financial/controllers/journal-entry.controller.ts
Remove-Item -Force src/modules/financial/controllers/multi-currency.controller.ts
Remove-Item -Force src/modules/financial/controllers/reconciliation.controller.ts
Remove-Item -Force src/modules/financial/controllers/tax.controller.ts

# Integration controllers
Remove-Item -Force src/modules/integration/controllers/connector.controller.ts
Remove-Item -Force src/modules/integration/controllers/developer-portal.controller.ts
Remove-Item -Force src/modules/integration/controllers/integration.controller.ts
Remove-Item -Force src/modules/integration/controllers/webhook.controller.ts

# Inventory controllers
Remove-Item -Force src/modules/inventory/controllers/batch-tracking.controller.ts
Remove-Item -Force src/modules/inventory/controllers/brand.controller.ts
Remove-Item -Force src/modules/inventory/controllers/category.controller.ts
Remove-Item -Force src/modules/inventory/controllers/cycle-counting.controller.ts
Remove-Item -Force src/modules/inventory/controllers/inventory-accuracy-reporting.controller.ts
Remove-Item -Force src/modules/inventory/controllers/inventory-movement-tracking.controller.ts
Remove-Item -Force src/modules/inventory/controllers/inventory-reporting.controller.ts
Remove-Item -Force src/modules/inventory/controllers/inventory.controller.ts
Remove-Item -Force src/modules/inventory/controllers/perpetual-inventory.controller.ts
Remove-Item -Force src/modules/inventory/controllers/product.controller.ts
Remove-Item -Force src/modules/inventory/controllers/reorder.controller.ts

# Location controllers
Remove-Item -Force src/modules/location/controllers/dealer-portal.controller.ts
Remove-Item -Force src/modules/location/controllers/franchise.controller.ts
Remove-Item -Force src/modules/location/controllers/location-inventory-policy.controller.ts
Remove-Item -Force src/modules/location/controllers/location-pricing.controller.ts
Remove-Item -Force src/modules/location/controllers/location-promotion.controller.ts
Remove-Item -Force src/modules/location/controllers/location-reporting.controller.ts
Remove-Item -Force src/modules/location/controllers/location-sync.controller.ts
Remove-Item -Force src/modules/location/controllers/location.controller.ts
Remove-Item -Force src/modules/location/controllers/territory.controller.ts

# Mobile controllers
Remove-Item -Force src/modules/mobile/controllers/mobile-api.controller.ts

# POS controllers
Remove-Item -Force src/modules/pos/controllers/offline.controller.ts
Remove-Item -Force src/modules/pos/controllers/pos.controller.ts
Remove-Item -Force src/modules/pos/controllers/transaction.controller.ts

# Realtime controllers
Remove-Item -Force src/modules/realtime/controllers/communication-integration.controller.ts
Remove-Item -Force src/modules/realtime/controllers/live-data.controller.ts
Remove-Item -Force src/modules/realtime/controllers/notification.controller.ts
Remove-Item -Force src/modules/realtime/controllers/realtime.controller.ts

# Security controllers
Remove-Item -Force src/modules/security/controllers/audit.controller.ts
Remove-Item -Force src/modules/security/controllers/compliance.controller.ts
Remove-Item -Force src/modules/security/controllers/security-dashboard.controller.ts
Remove-Item -Force src/modules/security/controllers/security.controller.ts

# Supplier controllers
Remove-Item -Force src/modules/supplier/controllers/edi-integration.controller.ts
Remove-Item -Force src/modules/supplier/controllers/supplier.controller.ts
Remove-Item -Force src/modules/supplier/controllers/purchase-order.controller.ts
Remove-Item -Force src/modules/supplier/controllers/procurement-analytics.controller.ts

# Tenant controllers
Remove-Item -Force src/modules/tenant/controllers/tenant.controller.ts
Remove-Item -Force src/modules/tenant/controllers/tenant-metrics.controller.ts
Remove-Item -Force src/modules/tenant/controllers/feature-flag.controller.ts

# Warehouse controllers
Remove-Item -Force src/modules/warehouse/controllers/warehouse.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/warehouse-zone.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/shipping-integration.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/picking-wave.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/pick-list.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/lot-tracking.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/kitting-assembly.controller.ts
Remove-Item -Force src/modules/warehouse/controllers/bin-location.controller.ts

# Disaster Recovery controllers
Remove-Item -Force src/modules/disaster-recovery/controllers/disaster-recovery.controller.ts
```

---

## Verification Commands

After deletions, verify no broken imports:

```powershell
# Search for controller imports in module files
Select-String -Path "src/modules/*/*.module.ts" -Pattern "controllers/" -CaseSensitive

# Search for DTO imports
Select-String -Path "src/modules/**/*.ts" -Pattern "\.dto'" -CaseSensitive

# Search for REST common module imports
Select-String -Path "src/**/*.ts" -Pattern "common/rest" -CaseSensitive

# Search for Swagger imports
Select-String -Path "src/**/*.ts" -Pattern "swagger" -CaseSensitive
```

---

## Git Commands

```powershell
# Create backup branch before starting
git checkout -b backup-before-graphql-migration
git push origin backup-before-graphql-migration

# Create working branch
git checkout -b feature/graphql-only-migration

# After each phase, commit
git add .
git commit -m "Phase X: Delete [description]"

# If you need to rollback
git checkout backup-before-graphql-migration
```

---

## Testing Commands

```powershell
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start the application
npm run start:dev

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Notes

1. **Always backup first!** Create a git branch before running any delete commands
2. **Test after each phase** - Don't delete everything at once
3. **Review the output** of verification commands before proceeding
4. **Keep the health module** - It's infrastructure-critical
5. **Review shared infrastructure** before deleting (guards, decorators, interceptors)

---

## Recommended Execution Order

1. Create backup branch
2. Run Phase 1 (delete controllers)
3. Update module files to remove controller imports
4. Test application
5. Run Phase 2 (delete DTOs)
6. Test application
7. Run Phase 3 (delete REST infrastructure)
8. Update app.module.ts and main.ts
9. Test application
10. Review and run Phase 4 if applicable
11. Run verification commands
12. Final testing
13. Commit changes

