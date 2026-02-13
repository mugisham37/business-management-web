import { PermissionDefinition } from './permission-registry';

/**
 * Sample module permission definitions
 * This demonstrates how modules can define their permissions
 * In a real application, each module would register its own permissions
 */

export const INVENTORY_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'inventory.products.create',
    module: 'inventory',
    resource: 'products',
    action: 'create',
    description: 'Create new products in inventory',
  },
  {
    key: 'inventory.products.read',
    module: 'inventory',
    resource: 'products',
    action: 'read',
    description: 'View products in inventory',
  },
  {
    key: 'inventory.products.update',
    module: 'inventory',
    resource: 'products',
    action: 'update',
    description: 'Update existing products',
  },
  {
    key: 'inventory.products.delete',
    module: 'inventory',
    resource: 'products',
    action: 'delete',
    description: 'Delete products from inventory',
  },
  {
    key: 'inventory.stock.view',
    module: 'inventory',
    resource: 'stock',
    action: 'view',
    description: 'View stock levels',
  },
  {
    key: 'inventory.stock.adjust',
    module: 'inventory',
    resource: 'stock',
    action: 'adjust',
    description: 'Adjust stock levels',
  },
];

export const SALES_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'sales.orders.create',
    module: 'sales',
    resource: 'orders',
    action: 'create',
    description: 'Create new sales orders',
  },
  {
    key: 'sales.orders.read',
    module: 'sales',
    resource: 'orders',
    action: 'read',
    description: 'View sales orders',
  },
  {
    key: 'sales.orders.update',
    module: 'sales',
    resource: 'orders',
    action: 'update',
    description: 'Update sales orders',
  },
  {
    key: 'sales.orders.delete',
    module: 'sales',
    resource: 'orders',
    action: 'delete',
    description: 'Delete sales orders',
    deprecated: true,
    deprecationMessage: 'Use sales.orders.cancel instead',
  },
  {
    key: 'sales.orders.cancel',
    module: 'sales',
    resource: 'orders',
    action: 'cancel',
    description: 'Cancel sales orders',
  },
  {
    key: 'sales.invoices.create',
    module: 'sales',
    resource: 'invoices',
    action: 'create',
    description: 'Create invoices',
  },
  {
    key: 'sales.invoices.read',
    module: 'sales',
    resource: 'invoices',
    action: 'read',
    description: 'View invoices',
  },
];

export const CRM_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'crm.customers.create',
    module: 'crm',
    resource: 'customers',
    action: 'create',
    description: 'Create new customers',
  },
  {
    key: 'crm.customers.read',
    module: 'crm',
    resource: 'customers',
    action: 'read',
    description: 'View customer information',
  },
  {
    key: 'crm.customers.update',
    module: 'crm',
    resource: 'customers',
    action: 'update',
    description: 'Update customer information',
  },
  {
    key: 'crm.customers.delete',
    module: 'crm',
    resource: 'customers',
    action: 'delete',
    description: 'Delete customers',
  },
];

export const PURCHASES_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'purchases.orders.create',
    module: 'purchases',
    resource: 'orders',
    action: 'create',
    description: 'Create purchase orders',
  },
  {
    key: 'purchases.orders.read',
    module: 'purchases',
    resource: 'orders',
    action: 'read',
    description: 'View purchase orders',
  },
  {
    key: 'purchases.orders.update',
    module: 'purchases',
    resource: 'orders',
    action: 'update',
    description: 'Update purchase orders',
  },
  {
    key: 'purchases.orders.approve',
    module: 'purchases',
    resource: 'orders',
    action: 'approve',
    description: 'Approve purchase orders',
  },
];

export const SUPPLIERS_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'suppliers.vendors.create',
    module: 'suppliers',
    resource: 'vendors',
    action: 'create',
    description: 'Create new suppliers',
  },
  {
    key: 'suppliers.vendors.read',
    module: 'suppliers',
    resource: 'vendors',
    action: 'read',
    description: 'View supplier information',
  },
  {
    key: 'suppliers.vendors.update',
    module: 'suppliers',
    resource: 'vendors',
    action: 'update',
    description: 'Update supplier information',
  },
];

/**
 * Map of module names to their permission definitions
 */
export const MODULE_PERMISSIONS_MAP = {
  inventory: INVENTORY_PERMISSIONS,
  sales: SALES_PERMISSIONS,
  crm: CRM_PERMISSIONS,
  purchases: PURCHASES_PERMISSIONS,
  suppliers: SUPPLIERS_PERMISSIONS,
};
