# Module-by-Module Breakdown

Quick reference showing what to delete and keep in each module.

---

## Legend
- 🗑️ DELETE - Remove this file/directory
- ✅ KEEP - Keep this file/directory
- ⚠️ REVIEW - Review before deleting (may be shared)

---

## 1. ANALYTICS Module

```
src/modules/analytics/
├── 🗑️ controllers/                    (8 files - DELETE ALL)
│   ├── analytics.controller.ts
│   ├── comparative-analysis.controller.ts
│   ├── custom-reporting.controller.ts
│   ├── dashboard.controller.ts
│   ├── data-warehouse.controller.ts
│   ├── mobile-analytics.controller.ts
│   ├── predictive-analytics.controller.ts
│   └── reporting.controller.ts
├── ✅ resolvers/                       (8 files - KEEP ALL)
├── ✅ inputs/                          (1 file - KEEP)
├── ✅ types/                           (1 file - KEEP)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
└── ⚠️ analytics.module.ts             (UPDATE - remove controller imports)
```

**Summary:** Delete 8 controllers, keep 8 resolvers

---

## 2. AUTH Module

```
src/modules/auth/
├── 🗑️ controllers/                    (3 files - DELETE ALL)
│   ├── auth.controller.ts
│   ├── mfa.controller.ts
│   └── permissions.controller.ts
├── 🗑️ dto/                            (2 files - DELETE ALL)
│   ├── auth.dto.ts
│   └── mfa.dto.ts
├── 🗑️ strategies/                     (2 files - DELETE ALL - REST specific)
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── ⚠️ guards/                         (REVIEW EACH)
│   ├── 🗑️ local-auth.guard.ts        (DELETE - REST only)
│   ├── ⚠️ jwt-auth.guard.ts          (REVIEW - may be used globally)
│   ├── ✅ graphql-jwt-auth.guard.ts  (KEEP - GraphQL specific)
│   ├── ⚠️ roles.guard.ts             (REVIEW - may be used by GraphQL)
│   └── ⚠️ permissions.guard.ts       (REVIEW - may be used by GraphQL)
├── ⚠️ decorators/                     (REVIEW ALL - may be shared)
│   ├── auth.decorators.ts
│   ├── current-user.decorator.ts
│   ├── permission.decorator.ts
│   ├── permissions.decorator.ts
│   ├── require-permission.decorator.ts
│   └── user.decorator.ts
├── ✅ resolvers/                       (3 files - KEEP ALL)
├── ✅ inputs/                          (3 files - KEEP ALL)
├── ✅ types/                           (3 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ interfaces/                      (KEEP ALL)
└── ⚠️ auth.module.ts                  (UPDATE - remove controller imports)
```

**Summary:** Delete 3 controllers, 2 DTOs, 2 strategies. Review 6 decorators and 3 guards.

---

## 3. B2B Module

```
src/modules/b2b/
├── 🗑️ controllers/                    (5 files - DELETE ALL)
├── 🗑️ dto/                            (5 files - DELETE ALL)
├── ✅ resolvers/                       (5 files - KEEP ALL)
├── ✅ types/                           (4 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
└── ⚠️ b2b.module.ts                   (UPDATE)
```

**Summary:** Delete 5 controllers, 5 DTOs, keep 5 resolvers

---

## 4. BACKUP Module

```
src/modules/backup/
├── 🗑️ controllers/                    (1 file - DELETE)
├── 🗑️ dto/                            (1 file - DELETE)
├── ✅ resolvers/                       (1 file - KEEP)
├── ✅ inputs/                          (1 file - KEEP)
├── ✅ entities/                        (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ processors/                      (KEEP ALL)
└── ⚠️ backup.module.ts                (UPDATE)
```

**Summary:** Delete 1 controller, 1 DTO, keep 1 resolver

---

## 5. CRM Module

```
src/modules/crm/
├── 🗑️ controllers/                    (6 files - DELETE ALL)
├── 🗑️ dto/                            (3 files - DELETE ALL)
├── ✅ resolvers/                       (6 files - KEEP ALL)
├── ✅ types/                           (4 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
├── ✅ handlers/                        (KEEP ALL)
└── ⚠️ crm.module.ts                   (UPDATE)
```

**Summary:** Delete 6 controllers, 3 DTOs, keep 6 resolvers

---

## 6. EMPLOYEE Module

```
src/modules/employee/
├── 🗑️ controllers/                    (4 files - DELETE ALL)
├── 🗑️ dto/                            (3 files - DELETE ALL)
├── ✅ resolvers/                       (4 files - KEEP ALL)
├── ✅ inputs/                          (4 files - KEEP ALL)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
└── ⚠️ employee.module.ts              (UPDATE)
```

**Summary:** Delete 4 controllers, 3 DTOs, keep 4 resolvers

---

## 7. FINANCIAL Module

```
src/modules/financial/
├── 🗑️ controllers/                    (9 files - DELETE ALL)
├── 🗑️ dto/                            (3 files - DELETE ALL)
├── ✅ resolvers/                       (9 files - KEEP ALL)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ handlers/                        (KEEP ALL)
├── ✅ utils/                           (KEEP ALL)
└── ⚠️ financial.module.ts             (UPDATE)
```

**Summary:** Delete 9 controllers, 3 DTOs, keep 9 resolvers

---

## 8. INTEGRATION Module

```
src/modules/integration/
├── 🗑️ controllers/                    (4 files - DELETE ALL)
├── 🗑️ dto/                            (5 files - DELETE ALL)
├── 🗑️ guards/                         (2 files - DELETE ALL - REST specific)
│   ├── integration-auth.guard.ts
│   └── rate-limit.guard.ts
├── 🗑️ interceptors/                   (1 file - DELETE - REST specific)
│   └── integration-logging.interceptor.ts
├── ✅ resolvers/                       (4 files - KEEP ALL)
├── ✅ inputs/                          (4 files - KEEP ALL)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ connectors/                      (KEEP ALL - external integrations)
├── ✅ entities/                        (KEEP ALL)
├── ✅ interfaces/                      (KEEP ALL)
├── ✅ processors/                      (KEEP ALL)
└── ⚠️ integration.module.ts           (UPDATE)
```

**Summary:** Delete 4 controllers, 5 DTOs, 2 guards, 1 interceptor, keep 4 resolvers

---

## 9. INVENTORY Module

```
src/modules/inventory/
├── 🗑️ controllers/                    (11 files - DELETE ALL)
├── 🗑️ dto/                            (4 files - DELETE ALL)
├── ✅ resolvers/                       (11 files - KEEP ALL)
├── ✅ inputs/                          (1 file - KEEP)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
└── ⚠️ inventory.module.ts             (UPDATE)
```

**Summary:** Delete 11 controllers, 4 DTOs, keep 11 resolvers

---

## 10. LOCATION Module

```
src/modules/location/
├── 🗑️ controllers/                    (9 files - DELETE ALL)
├── 🗑️ dto/                            (6 files - DELETE ALL)
├── ✅ resolvers/                       (9 files - KEEP ALL)
├── ✅ inputs/                          (1 file - KEEP)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
└── ⚠️ location.module.ts              (UPDATE)
```

**Summary:** Delete 9 controllers, 6 DTOs, keep 9 resolvers

---

## 11. MOBILE Module

```
src/modules/mobile/
├── 🗑️ controllers/                    (1 file - DELETE)
├── 🗑️ interceptors/                   (2 files - DELETE - REST specific)
│   ├── compression.interceptor.ts
│   └── mobile-api.interceptor.ts
├── ✅ resolvers/                       (1 file - KEEP)
├── ✅ types/                           (1 file - KEEP)
├── ✅ services/                        (KEEP ALL)
└── ⚠️ mobile.module.ts                (UPDATE)
```

**Summary:** Delete 1 controller, 2 interceptors, keep 1 resolver

---

## 12. POS Module

```
src/modules/pos/
├── 🗑️ controllers/                    (3 files - DELETE ALL)
├── 🗑️ dto/                            (1 file - DELETE)
├── ✅ resolvers/                       (3 files - KEEP ALL)
├── ✅ inputs/                          (3 files - KEEP ALL)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
├── ✅ handlers/                        (KEEP ALL)
├── ✅ providers/                       (KEEP ALL)
└── ⚠️ pos.module.ts                   (UPDATE)
```

**Summary:** Delete 3 controllers, 1 DTO, keep 3 resolvers

---

## 13. REALTIME Module

```
src/modules/realtime/
├── 🗑️ controllers/                    (4 files - DELETE ALL)
├── 🗑️ dto/                            (2 files - DELETE ALL)
├── ✅ resolvers/                       (4 files - KEEP ALL)
├── ✅ types/                           (2 files - KEEP ALL)
├── ✅ gateways/                        (KEEP - WebSocket gateway)
│   └── realtime.gateway.ts
├── ✅ services/                        (KEEP ALL)
└── ⚠️ realtime.module.ts              (UPDATE)
```

**Summary:** Delete 4 controllers, 2 DTOs, keep 4 resolvers + WebSocket gateway

---

## 14. SECURITY Module

```
src/modules/security/
├── 🗑️ controllers/                    (4 files - DELETE ALL)
├── ⚠️ guards/                         (REVIEW - may need GraphQL equivalents)
│   ├── security.guard.ts
│   └── threat-detection.guard.ts
├── ⚠️ interceptors/                   (REVIEW - may need GraphQL equivalents)
│   ├── audit.interceptor.ts
│   └── security.interceptor.ts
├── ✅ resolvers/                       (4 files - KEEP ALL)
├── ✅ inputs/                          (1 file - KEEP)
├── ✅ types/                           (KEEP ALL)
├── ✅ services/                        (KEEP ALL)
└── ⚠️ security.module.ts              (UPDATE)
```

**Summary:** Delete 4 controllers, review 2 guards and 2 interceptors, keep 4 resolvers

---

## 15. SUPPLIER Module

```
src/modules/supplier/
├── 🗑️ controllers/                    (4 files - DELETE ALL)
├── ✅ resolvers/                       (4 files - KEEP ALL)
├── ✅ types/                           (4 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
└── ⚠️ supplier.module.ts              (UPDATE)
```

**Summary:** Delete 4 controllers, keep 4 resolvers (no DTOs found)

---

## 16. TENANT Module

```
src/modules/tenant/
├── 🗑️ controllers/                    (3 files - DELETE ALL)
├── ⚠️ decorators/                     (REVIEW - may be used by GraphQL)
│   └── tenant.decorators.ts
├── ⚠️ guards/                         (REVIEW - may be used by GraphQL)
│   └── tenant.guard.ts
├── ⚠️ interceptors/                   (REVIEW - may be used by GraphQL)
├── ✅ resolvers/                       (3 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
└── ⚠️ tenant.module.ts                (UPDATE)
```

**Summary:** Delete 3 controllers, review decorators/guards/interceptors, keep 3 resolvers

---

## 17. WAREHOUSE Module

```
src/modules/warehouse/
├── 🗑️ controllers/                    (8 files - DELETE ALL)
├── 🗑️ dto/                            (4 files - DELETE ALL)
├── ✅ resolvers/                       (8 files - KEEP ALL)
├── ✅ types/                           (8 files - KEEP ALL)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
└── ⚠️ warehouse.module.ts             (UPDATE)
```

**Summary:** Delete 8 controllers, 4 DTOs, keep 8 resolvers

---

## 18. DISASTER-RECOVERY Module

```
src/modules/disaster-recovery/
├── 🗑️ controllers/                    (1 file - DELETE)
├── 🗑️ dto/                            (1 file - DELETE)
├── ✅ resolvers/                       (1 file - KEEP)
├── ✅ services/                        (KEEP ALL)
├── ✅ repositories/                    (KEEP ALL)
├── ✅ entities/                        (KEEP ALL)
├── ✅ processors/                      (KEEP ALL)
└── ⚠️ disaster-recovery.module.ts     (UPDATE)
```

**Summary:** Delete 1 controller, 1 DTO, keep 1 resolver

---

## 19. COMMUNICATION Module

```
src/modules/communication/
├── ✅ services/                        (KEEP ALL - service-only module)
│   ├── communication-integration.service.ts
│   ├── email-notification.service.ts
│   ├── slack-integration.service.ts
│   ├── sms-notification.service.ts
│   └── teams-integration.service.ts
└── ✅ communication.module.ts         (NO CHANGES)
```

**Summary:** No changes needed - service-only module

---

## 20. HEALTH Module

```
src/modules/health/
├── ✅ health.controller.ts             (KEEP - infrastructure critical)
├── ✅ health.module.ts                 (KEEP)
└── ✅ indicators/                      (KEEP ALL)
```

**Summary:** No changes needed - infrastructure module

---

## 21-24. Infrastructure Modules (No Changes)

```
✅ src/modules/cache/          (KEEP ALL - service-only)
✅ src/modules/database/       (KEEP ALL - service-only)
✅ src/modules/logger/         (KEEP ALL - service-only)
✅ src/modules/queue/          (KEEP ALL - service-only)
```

---

## Common/Shared Infrastructure

```
src/common/
├── 🗑️ rest/                           (DELETE ENTIRE DIRECTORY)
│   ├── base.controller.ts
│   ├── rest-common.module.ts
│   ├── controllers/
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   └── pipes/
├── ✅ graphql/                         (KEEP ENTIRE DIRECTORY)
│   ├── base.resolver.ts
│   ├── graphql-common.module.ts
│   ├── dataloader.service.ts
│   ├── pagination.args.ts
│   ├── filter.input.ts
│   ├── sort.input.ts
│   └── ... (all GraphQL infrastructure)
├── ⚠️ decorators/                     (REVIEW)
│   └── public.decorator.ts
├── ⚠️ filters/                        (REVIEW)
│   └── all-exceptions.filter.ts
├── ⚠️ interceptors/                   (REVIEW)
│   ├── cache.interceptor.ts
│   └── logging.interceptor.ts
├── ✅ services/                        (KEEP ALL)
│   └── encryption.service.ts
└── ✅ validation/                      (KEEP ALL)
```

---

## Configuration Files

```
src/config/
├── 🗑️ swagger.config.ts               (DELETE - REST specific)
├── ✅ graphql.config.ts                (KEEP)
├── ⚠️ app.config.ts                   (UPDATE - remove apiPrefix if not needed)
├── ✅ database.config.ts               (KEEP)
└── ✅ redis.config.ts                  (KEEP)
```

---

## Root Files

```
src/
├── ⚠️ main.ts                         (UPDATE - remove Swagger setup)
├── ⚠️ app.module.ts                   (UPDATE - remove REST imports)
├── ⚠️ app.controller.ts               (REVIEW - may be REST-specific)
└── ✅ app.service.ts                   (KEEP)
```

---

## Summary Statistics

### Files to Delete
- **Controllers:** 95 files
- **DTOs:** 54 files
- **REST Infrastructure:** 30+ files
- **Total:** ~180 files

### Files to Keep
- **Resolvers:** 95 files
- **Inputs/Types:** 60+ files
- **Services:** All
- **Repositories:** All
- **Entities:** All

### Files to Review
- **Guards:** 8 files
- **Decorators:** 7 files
- **Interceptors:** 6 files
- **Module Files:** 18 files
- **Config Files:** 3 files

---

## Quick Action Items

1. ✅ Delete all `controllers/` directories (18 modules)
2. ✅ Delete all `dto/` directories (13 modules)
3. ✅ Delete `src/common/rest/` directory
4. ✅ Delete `src/config/swagger.config.ts`
5. ⚠️ Review and delete REST-specific guards/interceptors
6. ⚠️ Update 18 module files (remove controller imports)
7. ⚠️ Update `src/app.module.ts` (remove REST imports)
8. ⚠️ Update `src/main.ts` (remove Swagger setup)
9. ✅ Test after each phase
10. ✅ Update documentation

