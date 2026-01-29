import { gql } from '@apollo/client';

/**
 * Tier Access GraphQL Queries
 */

// Get all modules with access status
export const GET_MY_MODULE_ACCESS = gql`
  query MyModuleAccess {
    myModuleAccess {
      moduleName
      displayName
      isAccessible
      requiredTier
      upgradePrompt
      category
      description
    }
  }
`;

// Check if tenant can access a specific module
export const CAN_ACCESS_MODULE = gql`
  query CanAccessModule($module: String!) {
    canAccessModule(module: $module)
  }
`;

// Get only accessible modules
export const GET_MY_ACCESSIBLE_MODULES = gql`
  query MyAccessibleModules {
    myAccessibleModules {
      moduleName
      displayName
      isAccessible
      requiredTier
      category
      description
    }
  }
`;

// Get locked modules requiring upgrade
export const GET_MY_LOCKED_MODULES = gql`
  query MyLockedModules {
    myLockedModules {
      moduleName
      displayName
      isAccessible
      requiredTier
      upgradePrompt
      category
      description
    }
  }
`;

// Get modules filtered by category
export const GET_MODULES_BY_CATEGORY = gql`
  query ModulesByCategory($category: String!) {
    modulesByCategory(category: $category) {
      moduleName
      displayName
      isAccessible
      requiredTier
      upgradePrompt
      category
      description
    }
  }
`;
