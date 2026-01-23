/**
 * Theme Provider Component
 * React provider for tenant theming system
 * Requirements: 4.1, 4.3
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  TenantThemingService, 
  tenantThemingService, 
  ThemeConfig 
} from './tenant-theming';
import { useTenantProvider } from './tenant-provider';

interface ThemeContextValue {
  theme: ThemeConfig | null;
  applyTheme: (theme: ThemeConfig) => void;
  clearTheme: () => void;
  themingService: TenantThemingService;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  themingService?: TenantThemingService;
  autoApplyTenantTheme?: boolean;
}

/**
 * Theme Provider Component
 * Provides theming context and automatically applies tenant themes
 */
export function ThemeProvider({ 
  children, 
  themingService: customThemingService,
  autoApplyTenantTheme = true 
}: ThemeProviderProps) {
  const themingService = customThemingService || tenantThemingService;
  const [theme, setTheme] = useState<ThemeConfig | null>(themingService.getCurrentTheme());
  const { currentTenant } = useTenantProvider();

  // Subscribe to theme changes
  useEffect(() => {
    const unsubscribe = themingService.onThemeChange(setTheme);
    return unsubscribe;
  }, [themingService]);

  // Auto-apply tenant theme when tenant changes
  useEffect(() => {
    if (autoApplyTenantTheme) {
      themingService.applyTenantTheme(currentTenant);
    }
  }, [currentTenant, themingService, autoApplyTenantTheme]);

  const contextValue: ThemeContextValue = {
    theme,
    applyTheme: (theme: ThemeConfig) => themingService.applyTheme(theme),
    clearTheme: () => themingService.clearTheme(),
    themingService,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={theme ? 'tenant-branded' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Higher-Order Component for theme context
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
) {
  return function ThemeWrapper(props: P) {
    const theme = useTheme();
    
    return <Component {...props} theme={theme} />;
  };
}

/**
 * Component for conditional rendering based on theme
 */
interface ThemeFeatureProps {
  feature: keyof ThemeConfig;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ThemeFeature({ feature, children, fallback = null }: ThemeFeatureProps) {
  const { theme } = useTheme();
  
  const hasFeature = theme && theme[feature];
  
  return hasFeature ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component for displaying tenant logo
 */
interface TenantLogoProps {
  className?: string;
  alt?: string;
  fallback?: ReactNode;
}

export function TenantLogo({ className = '', alt = 'Tenant Logo', fallback }: TenantLogoProps) {
  const { theme } = useTheme();
  const { currentTenant } = useTenantProvider();
  
  const logoUrl = theme?.logoUrl;
  const tenantName = currentTenant?.name || 'Tenant';
  
  if (!logoUrl) {
    return fallback ? <>{fallback}</> : (
      <div className={`tenant-logo-fallback ${className}`}>
        {tenantName.charAt(0).toUpperCase()}
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={alt} 
      className={`tenant-logo ${className}`}
      onError={(e) => {
        // Hide image on error and show fallback
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

/**
 * Component for tenant-branded buttons
 */
interface TenantButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function TenantButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: TenantButtonProps) {
  const baseClasses = 'btn tenant-btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    outline: 'btn-outline-primary',
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

/**
 * Component for tenant-branded cards
 */
interface TenantCardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function TenantCard({ children, className = '', header, footer }: TenantCardProps) {
  return (
    <div className={`card tenant-card ${className}`}>
      {header && (
        <div className="card-header tenant-card-header">
          {header}
        </div>
      )}
      <div className="card-body tenant-card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer tenant-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}