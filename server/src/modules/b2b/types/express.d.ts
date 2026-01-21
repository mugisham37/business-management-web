import { Express } from 'express';

/**
 * B2B Module Express Type Extensions
 * 
 * Extends Express Request and User types to include B2B-specific properties
 */

declare global {
  namespace Express {
    interface User {
      tenantId?: string;
      id?: string;
      email?: string;
      customerId?: string;
      permissions?: string[];
    }

    interface Request {
      approvalContext?: {
        permissions: string[];
        limits: {
          orderLimit: number;
          quoteLimit: number;
          contractLimit: number;
        };
        pendingCount: number;
        userId: string;
        tenantId: string;
        canApproveOrders: boolean;
        canApproveQuotes: boolean;
        canApproveContracts: boolean;
      };

      pricingContext?: {
        tier: string;
        activePricingRules: any[];
        customerId: string;
        tenantId: string;
      };

      territoryContext?: {
        userTerritories: any[];
        territoryRules: any[];
        userId: string;
        tenantId: string;
      };
    }
  }
}

export {};
