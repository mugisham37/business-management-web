/**
 * Lazy Module Component
 * Provides lazy loading and code splitting for modules with error boundaries
 */

import React, { Suspense, ReactNode, ComponentType } from 'react';
import { moduleLoader, LoadedModule } from '@/components/module-loader';

export interface LazyModuleProps {
  moduleName: string;
  fallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
  onLoad?: (module: LoadedModule) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to use lazy module loading
 */
export function useLazyModule(moduleName: string) {
  const [module, setModule] = React.useState<LoadedModule | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    moduleLoader
      .loadModule(moduleName)
      .then((loadedModule) => {
        setModule(loadedModule);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
  }, [moduleName]);

  return { module, error, isLoading };
}

/**
 * LazyModule Component
 * Lazy loads a module with suspense and error handling
 */
export const LazyModule: React.FC<LazyModuleProps> = ({
  moduleName,
  fallback = <div>Loading...</div>,
  errorFallback,
  onLoad,
  onError,
}) => {
  const { module, error, isLoading } = useLazyModule(moduleName);

  React.useEffect(() => {
    if (module && onLoad) {
      onLoad(module);
    }
  }, [module, onLoad]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (error) {
    return (
      <>
        {errorFallback ? (
          errorFallback(error)
        ) : (
          <div className="lazy-module-error">
            <p>Failed to load {moduleName}: {error.message}</p>
          </div>
        )}
      </>
    );
  }

  if (isLoading || !module?.component) {
    return <>{fallback}</>;
  }

  const ModuleComponent = module.component as ComponentType<unknown>;

  return (
    <Suspense fallback={fallback}>
      <ModuleComponent />
    </Suspense>
  );
};

LazyModule.displayName = 'LazyModule';
