import { TenantContextService } from './tenant-context.service';
import { ForbiddenException } from '@nestjs/common';

/**
 * Models that require tenant isolation (have organizationId field)
 */
const TENANT_SCOPED_MODELS = [
  'Organization',
  'User',
  'Branch',
  'Department',
  'UserPermission',
  'AuditLog',
];

/**
 * Models that don't require tenant isolation
 */
const GLOBAL_MODELS = ['Permission', 'RefreshToken'];

/**
 * Junction/assignment models that are scoped through their relations
 */
const JUNCTION_MODELS = ['UserBranchAssignment', 'UserDepartmentAssignment'];

/**
 * Creates Prisma middleware for automatic tenant isolation
 * Injects organizationId filters on all queries and mutations
 */
export function createTenantIsolationMiddleware(
  tenantContextService: TenantContextService,
) {
  return async (params: any, next: (params: any) => Promise<any>) => {
    const model = params.model;

    // Skip if no model (raw queries) or if it's a global model
    if (!model || GLOBAL_MODELS.includes(model)) {
      return next(params);
    }

    // Get tenant context - will throw if not set
    let organizationId: string;
    try {
      organizationId = tenantContextService.getOrganizationId();
    } catch (error) {
      // If tenant context is not set, reject the query
      throw new ForbiddenException(
        `Tenant context required for ${model} operations`,
      );
    }

    // Handle tenant-scoped models
    if (TENANT_SCOPED_MODELS.includes(model)) {
      switch (params.action) {
        case 'findUnique':
        case 'findUniqueOrThrow':
        case 'findFirst':
        case 'findFirstOrThrow':
          // Inject organizationId into where clause
          params.args.where = {
            ...params.args.where,
            organizationId,
          };
          break;

        case 'findMany':
        case 'count':
        case 'aggregate':
        case 'groupBy':
          // Inject organizationId into where clause
          params.args.where = {
            ...params.args.where,
            organizationId,
          };
          break;

        case 'create':
          // Inject organizationId into data
          if (model !== 'Organization') {
            params.args.data = {
              ...params.args.data,
              organizationId,
            };
          }
          break;

        case 'createMany':
          // Inject organizationId into each data item
          if (model !== 'Organization') {
            if (Array.isArray(params.args.data)) {
              params.args.data = params.args.data.map((item: any) => ({
                ...item,
                organizationId,
              }));
            } else {
              params.args.data = {
                ...params.args.data,
                organizationId,
              };
            }
          }
          break;

        case 'update':
        case 'updateMany':
          // Inject organizationId into where clause
          params.args.where = {
            ...params.args.where,
            organizationId,
          };
          break;

        case 'upsert':
          // Inject organizationId into where and create clauses
          params.args.where = {
            ...params.args.where,
            organizationId,
          };
          if (model !== 'Organization') {
            params.args.create = {
              ...params.args.create,
              organizationId,
            };
          }
          break;

        case 'delete':
        case 'deleteMany':
          // Inject organizationId into where clause
          params.args.where = {
            ...params.args.where,
            organizationId,
          };
          break;
      }
    }

    // Handle junction models - they're scoped through their relations
    // No direct organizationId injection needed as they're validated through foreign keys
    if (JUNCTION_MODELS.includes(model)) {
      // Junction models are implicitly scoped through their user/branch/department relations
      // No additional filtering needed here
    }

    return next(params);
  };
}
