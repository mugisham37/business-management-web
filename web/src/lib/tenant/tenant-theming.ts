/**
 * Tenant Theming Service
 * Handles tenant-specific theming and branding
 * Requirements: 4.1, 4.3
 */

import { Tenant, TenantSettings, BrandingConfig } from '@/types/core';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl?: string;
  favicon?: string;
  customCss?: string;
}

export interface ThemeVariables {
  '--primary-color': string;
  '--secondary-color': string;
  '--accent-color': string;
  '--background-color': string;
  '--text-color': string;
  '--border-color': string;
  '--shadow-color': string;
}

/**
 * Tenant Theming Service
 * Manages tenant-specific themes and branding
 */
export class TenantThemingService {
  private currentTheme: ThemeConfig | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private themeListeners: Set<(theme: ThemeConfig | null) => void> = new Set();

  /**
   * Apply theme for a tenant
   */
  applyTenantTheme(tenant: Tenant | null): void {
    if (!tenant || !tenant.settings) {
      this.clearTheme();
      return;
    }

    const theme = this.createThemeFromTenant(tenant);
    this.applyTheme(theme);
  }

  /**
   * Apply a custom theme configuration
   */
  applyTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
    this.updateCSSVariables(theme);
    this.updateFavicon(theme.favicon);
    this.applyCustomCSS(theme.customCss);
    this.notifyThemeListeners();
  }

  /**
   * Clear current theme and reset to defaults
   */
  clearTheme(): void {
    this.currentTheme = null;
    this.removeCSSVariables();
    this.removeCustomCSS();
    this.resetFavicon();
    this.notifyThemeListeners();
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Subscribe to theme changes
   */
  onThemeChange(listener: (theme: ThemeConfig | null) => void): () => void {
    this.themeListeners.add(listener);
    return () => this.themeListeners.delete(listener);
  }

  /**
   * Create theme configuration from tenant settings
   */
  private createThemeFromTenant(tenant: Tenant): ThemeConfig {
    const settings = tenant.settings || {};
    const primaryColor = settings.primaryColor || '#3b82f6'; // Default blue

    return {
      primaryColor,
      secondaryColor: this.adjustColorBrightness(primaryColor, -20),
      accentColor: this.adjustColorBrightness(primaryColor, 20),
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      logoUrl: settings.logoUrl,
      favicon: this.generateFaviconFromColor(primaryColor),
      customCss: this.generateCustomCSS(tenant),
    };
  }

  /**
   * Update CSS custom properties
   */
  private updateCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;
    const variables: ThemeVariables = {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--accent-color': theme.accentColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--border-color': this.adjustColorOpacity(theme.textColor, 0.2),
      '--shadow-color': this.adjustColorOpacity(theme.textColor, 0.1),
    };

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Remove CSS custom properties
   */
  private removeCSSVariables(): void {
    const root = document.documentElement;
    const properties = [
      '--primary-color',
      '--secondary-color',
      '--accent-color',
      '--background-color',
      '--text-color',
      '--border-color',
      '--shadow-color',
    ];

    properties.forEach(property => {
      root.style.removeProperty(property);
    });
  }

  /**
   * Apply custom CSS styles
   */
  private applyCustomCSS(customCss?: string): void {
    this.removeCustomCSS();

    if (!customCss) return;

    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-tenant-theme', 'true');
    this.styleElement.textContent = customCss;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Remove custom CSS styles
   */
  private removeCustomCSS(): void {
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Update favicon
   */
  private updateFavicon(faviconUrl?: string): void {
    if (!faviconUrl) return;

    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) {
      link.href = faviconUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    }
  }

  /**
   * Reset favicon to default
   */
  private resetFavicon(): void {
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.ico'; // Default favicon
    }
  }

  /**
   * Generate custom CSS for tenant
   */
  private generateCustomCSS(tenant: Tenant): string {
    const settings = tenant.settings || {};
    const primaryColor = settings.primaryColor || '#3b82f6';

    return `
      /* Tenant-specific styles for ${tenant.name} */
      .tenant-branded {
        --tenant-primary: ${primaryColor};
        --tenant-primary-hover: ${this.adjustColorBrightness(primaryColor, -10)};
        --tenant-primary-light: ${this.adjustColorOpacity(primaryColor, 0.1)};
      }

      .tenant-branded .btn-primary {
        background-color: var(--tenant-primary);
        border-color: var(--tenant-primary);
      }

      .tenant-branded .btn-primary:hover {
        background-color: var(--tenant-primary-hover);
        border-color: var(--tenant-primary-hover);
      }

      .tenant-branded .nav-link.active {
        color: var(--tenant-primary);
        border-bottom-color: var(--tenant-primary);
      }

      .tenant-branded .form-control:focus {
        border-color: var(--tenant-primary);
        box-shadow: 0 0 0 0.2rem var(--tenant-primary-light);
      }
    `;
  }

  /**
   * Generate favicon from color
   */
  private generateFaviconFromColor(color: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 32, 32);
      
      // Add a simple icon (circle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, 2 * Math.PI);
      ctx.fill();
    }

    return canvas.toDataURL();
  }

  /**
   * Adjust color brightness
   */
  private adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Adjust color opacity
   */
  private adjustColorOpacity(color: string, opacity: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Notify theme change listeners
   */
  private notifyThemeListeners(): void {
    this.themeListeners.forEach(listener => listener(this.currentTheme));
  }
}

/**
 * Default tenant theming service instance
 */
export const tenantThemingService = new TenantThemingService();

/**
 * Hook for tenant theming
 */
export function useTenantTheming() {
  return tenantThemingService;
}