/**
 * Module Router
 * Handles dynamic module routing and loading
 */

export interface RouteConfig {
  path: string;
  name: string;
  component?: React.ComponentType<unknown>;
  enabled: boolean;
}

export interface ModuleRouteConfig extends RouteConfig {
  moduleName?: string;
}

export interface ModuleRouteContext {
  getRoute(moduleName: string): ModuleRouteConfig | undefined;
  getRoutes(): ModuleRouteConfig[];
  registerRoute(config: ModuleRouteConfig): void;
  unregisterRoute(moduleName: string): void;
}

/**
 * Module Router Implementation
 */
export class ModuleRouter implements ModuleRouteContext {
  private routes: Map<string, ModuleRouteConfig> = new Map();

  /**
   * Get a specific route
   */
  getRoute(moduleName: string): ModuleRouteConfig | undefined {
    return this.routes.get(moduleName);
  }

  /**
   * Get all routes
   */
  getRoutes(): ModuleRouteConfig[] {
    return Array.from(this.routes.values()).filter(route => route.enabled);
  }

  /**
   * Register a route
   */
  registerRoute(config: ModuleRouteConfig): void {
    this.routes.set(config.name, config);
  }

  /**
   * Unregister a route
   */
  unregisterRoute(moduleName: string): void {
    this.routes.delete(moduleName);
  }

  /**
   * Get route by path
   */
  getRouteByPath(path: string): ModuleRouteConfig | undefined {
    return Array.from(this.routes.values()).find(route => route.path === path && route.enabled);
  }

  /**
   * Check if route exists and is enabled
   */
  isRouteAvailable(moduleName: string): boolean {
    const route = this.routes.get(moduleName);
    return route ? route.enabled : false;
  }
}

// Export singleton instance
export const moduleRouter = new ModuleRouter();

/**
 * Module routes constant
 */
export const MODULE_ROUTES = moduleRouter;

/**
 * Hook to use module router
 */
export function useModuleRouter(): ModuleRouteContext {
  return moduleRouter;
}

/**
 * Hook for module navigation
 */
export function useModuleNavigation() {
  return {
    getRoute: (moduleName: string) => moduleRouter.getRoute(moduleName),
    getRoutes: () => moduleRouter.getRoutes(),
    navigate: (moduleName: string) => {
      const route = moduleRouter.getRoute(moduleName);
      if (route && route.enabled) {
        // Navigate using browser history or router
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', route.path);
        }
      }
    },
  };
}

/**
 * Hook for module breadcrumbs
 */
export function useModuleBreadcrumbs() {
  return {
    getBreadcrumbs: () => {
      // Get breadcrumbs from current path
      if (typeof window === 'undefined') return [];
      
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      
      return segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        return {
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
          path,
          enabled: true,
        };
      });
    },
  };
}

/**
 * Get available routes for navigation
 */
export function getAvailableRoutes(): ModuleRouteConfig[] {
  return moduleRouter.getRoutes();
}
