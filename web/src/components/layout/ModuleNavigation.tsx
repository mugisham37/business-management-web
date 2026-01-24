/**
 * Module Navigation Component
 * Provides navigation UI for modules
 */

import React from 'react';
import { useModuleNavigation } from '@/lib/routing/module-router';

export interface ModuleNavigationProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

/**
 * ModuleNavigation Component
 * Displays module navigation menu
 */
export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  className,
  onNavigate,
}) => {
  const navigation = useModuleNavigation();
  const routes = navigation.getRoutes();

  const handleClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigation.navigate(path);
    }
  };

  return (
    <nav className={`module-navigation ${className || ''}`}>
      <ul className="module-navigation-list">
        {routes.map((route) => (
          <li key={route.name} className="module-navigation-item">
            <button
              className="module-navigation-link"
              onClick={() => handleClick(route.path)}
              disabled={!route.enabled}
            >
              {route.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

ModuleNavigation.displayName = 'ModuleNavigation';
