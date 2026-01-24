/**
 * Module Loader - Dynamic module loading and code splitting
 * Provides runtime module loading capabilities for lazy-loaded modules
 * Aligns with backend module system
 */

/**
 * Module configuration interface
 * Matches backend module definitions
 */
export interface ModuleConfig {
  name: string;
  displayName: string;
  description: string;
  version: string;
  path: string;
  lazy: boolean;
  permissions?: string[];
  businessTier?: string;
  category?: string;
  dependencies?: string[];
  features?: string[];
  routes?: string[];
  preload?: boolean;
}

/**
 * Loaded module instance
 */
export interface LoadedModule {
  name: string;
  component?: React.ComponentType<unknown>;
  config: ModuleConfig;
  loadTime: number;
  error?: Error;
}

/**
 * Module Loader Class
 * Handles dynamic module loading, caching, and state management
 */
class ModuleLoader {
  private loadedModules = new Map<string, LoadedModule>();
  private loadingPromises = new Map<string, Promise<LoadedModule>>();
  private cache = new Map<string, LoadedModule>();

  /**
   * Load a module dynamically
   */
  async loadModule(moduleName: string, config?: ModuleConfig): Promise<LoadedModule> {
    // Check if already loading
    const loadingPromise = this.loadingPromises.get(moduleName);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Check if already loaded
    const cachedModule = this.cache.get(moduleName);
    if (cachedModule) {
      return cachedModule;
    }

    // Create loading promise
    const loadPromise = this._loadModuleInternal(moduleName, config);
    this.loadingPromises.set(moduleName, loadPromise);

    try {
      const loadedModule = await loadPromise;
      this.loadedModules.set(moduleName, loadedModule);
      this.cache.set(moduleName, loadedModule);
      return loadedModule;
    } finally {
      this.loadingPromises.delete(moduleName);
    }
  }

  /**
   * Internal module loading logic
   */
  private async _loadModuleInternal(
    moduleName: string,
    config?: ModuleConfig
  ): Promise<LoadedModule> {
    const startTime = performance.now();

    try {
      // Dynamic import based on module name
      const modulePath = `@/modules/${moduleName}`;
      const loadedModule = await import(modulePath).catch(() => {
        // Fallback for modules that don't have default export
        return import(modulePath).then((mod) => mod.default || mod);
      });

      const loadTime = performance.now() - startTime;

      return {
        name: moduleName,
        component: loadedModule.default || loadedModule,
        config: config || {
          name: moduleName,
          displayName: moduleName,
          description: `${moduleName} module`,
          version: '1.0.0',
          path: modulePath,
          lazy: true,
        },
        loadTime,
      };
    } catch (error) {
      const loadTime = performance.now() - startTime;

      return {
        name: moduleName,
        config: config || {
          name: moduleName,
          displayName: moduleName,
          description: `${moduleName} module`,
          version: '1.0.0',
          path: `@/modules/${moduleName}`,
          lazy: true,
        },
        loadTime,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Preload a module without rendering
   */
  async preloadModule(moduleName: string, config?: ModuleConfig): Promise<void> {
    await this.loadModule(moduleName, config);
  }

  /**
   * Unload a module
   */
  unloadModule(moduleName: string): void {
    this.loadedModules.delete(moduleName);
    this.cache.delete(moduleName);
  }

  /**
   * Get loaded module
   */
  getModule(moduleName: string): LoadedModule | undefined {
    return this.cache.get(moduleName);
  }

  /**
   * Get all loaded modules
   */
  getAllModules(): LoadedModule[] {
    return Array.from(this.cache.values());
  }

  /**
   * Check if module is loaded
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.cache.has(moduleName);
  }

  /**
   * Clear all loaded modules
   */
  clear(): void {
    this.loadedModules.clear();
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Module Registry
 * Contains all available module definitions
 */
export interface ModuleRegistry {
  [key: string]: ModuleConfig;
}

/**
 * Global module registry
 * This should be populated from the enhanced module registry in module-registry.ts
 */
export const MODULE_REGISTRY: ModuleRegistry = {};

/**
 * Global module loader instance
 */
export const moduleLoader = new ModuleLoader();

/**
 * Register a module in the global registry
 */
export function registerModule(config: ModuleConfig): void {
  MODULE_REGISTRY[config.name] = config;
}

/**
 * Register multiple modules
 */
export function registerModules(configs: ModuleConfig[]): void {
  configs.forEach((config) => {
    registerModule(config);
  });
}

/**
 * Get module config from registry
 */
export function getModuleConfig(moduleName: string): ModuleConfig | undefined {
  return MODULE_REGISTRY[moduleName];
}
