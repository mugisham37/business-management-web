/**
 * Tenant Integration Example
 * Demonstrates complete tenant functionality integration
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
 */

import React from 'react';
import {
  TenantProvider,
  ThemeProvider,
  FeatureGate,
  TierGate,
  TenantGate,
  useTenantProvider,
  useTheme,
} from '@/lib/tenant';
import { TenantManager } from '@/components/tenant';

/**
 * Complete Tenant Integration Example
 * Shows how to use all tenant features together
 */
export function TenantExample() {
  return (
    <TenantProvider>
      <ThemeProvider>
        <div className="tenant-example">
          <h1>Multi-Tenant Application Example</h1>
          
          {/* Tenant Management Interface */}
          <section className="tenant-management">
            <TenantManager />
          </section>

          {/* Feature-Gated Content */}
          <section className="feature-gated-content">
            <h2>Feature-Gated Content</h2>
            
            <FeatureGate feature="advanced-reporting">
              <div className="feature-content">
                <h3>Advanced Reporting</h3>
                <p>This advanced reporting dashboard is only available when the feature is enabled.</p>
                <ReportingDashboard />
              </div>
            </FeatureGate>

            <FeatureGate 
              feature="custom-integrations" 
              fallback={<UpgradePrompt feature="Custom Integrations" />}
            >
              <div className="feature-content">
                <h3>Custom Integrations</h3>
                <p>Configure custom integrations with third-party services.</p>
                <IntegrationsPanel />
              </div>
            </FeatureGate>
          </section>

          {/* Tier-Gated Content */}
          <section className="tier-gated-content">
            <h2>Tier-Gated Content</h2>
            
            <TierGate requiredTier="MEDIUM">
              <div className="tier-content">
                <h3>Medium Tier Features</h3>
                <p>These features are available for Medium tier and above.</p>
                <MediumTierFeatures />
              </div>
            </TierGate>

            <TierGate 
              requiredTier="ENTERPRISE"
              fallback={<UpgradePrompt tier="Enterprise" />}
            >
              <div className="tier-content">
                <h3>Enterprise Features</h3>
                <p>Premium enterprise features with advanced capabilities.</p>
                <EnterpriseFeatures />
              </div>
            </TierGate>
          </section>

          {/* Tenant-Specific Content */}
          <section className="tenant-specific-content">
            <h2>Tenant-Specific Content</h2>
            
            <TenantGate tenantIds={['demo-tenant', 'test-tenant']}>
              <div className="tenant-content">
                <h3>Demo/Test Tenant Content</h3>
                <p>This content is only visible for demo and test tenants.</p>
              </div>
            </TenantGate>

            <TenantGate excludeTenantIds={['restricted-tenant']}>
              <div className="tenant-content">
                <h3>General Content</h3>
                <p>This content is visible for all tenants except restricted ones.</p>
              </div>
            </TenantGate>
          </section>

          {/* Theme Demonstration */}
          <section className="theme-demonstration">
            <h2>Theme Demonstration</h2>
            <ThemeDemo />
          </section>
        </div>
      </ThemeProvider>
    </TenantProvider>
  );
}

/**
 * Theme Demo Component
 * Shows how tenant theming affects UI components
 */
function ThemeDemo() {
  const { theme, getThemeVariables } = useTheme();
  const { currentTenant } = useTenantProvider();

  return (
    <div className="theme-demo">
      <h3>Current Theme</h3>
      <div className="theme-info">
        <p><strong>Tenant:</strong> {currentTenant?.name || 'None'}</p>
        <p><strong>Primary Color:</strong> {theme.colors.primary}</p>
        <p><strong>Secondary Color:</strong> {theme.colors.secondary}</p>
      </div>
      
      <div className="theme-samples">
        <button 
          style={{ 
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: theme.borderRadius.md,
          }}
        >
          Primary Button
        </button>
        
        <button 
          style={{ 
            backgroundColor: theme.colors.secondary,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: theme.borderRadius.md,
            marginLeft: '8px',
          }}
        >
          Secondary Button
        </button>
      </div>

      <div className="theme-variables">
        <h4>CSS Variables</h4>
        <pre>{JSON.stringify(getThemeVariables(), null, 2)}</pre>
      </div>
    </div>
  );
}

/**
 * Upgrade Prompt Component
 */
interface UpgradePromptProps {
  feature?: string;
  tier?: string;
}

function UpgradePrompt({ feature, tier }: UpgradePromptProps) {
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-icon">🔒</div>
      <h3>Upgrade Required</h3>
      <p>
        {feature && `The ${feature} feature requires`}
        {tier && `Upgrade to ${tier} tier to access`}
        {!feature && !tier && 'Upgrade your plan to access'}
        this functionality.
      </p>
      <button className="upgrade-button">
        Upgrade Now
      </button>
    </div>
  );
}

/**
 * Mock Feature Components
 */
function ReportingDashboard() {
  return (
    <div className="reporting-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Revenue Analytics</h4>
          <div className="chart-placeholder">📊 Chart</div>
        </div>
        <div className="dashboard-card">
          <h4>User Engagement</h4>
          <div className="chart-placeholder">📈 Chart</div>
        </div>
        <div className="dashboard-card">
          <h4>Performance Metrics</h4>
          <div className="chart-placeholder">⚡ Metrics</div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="integrations-panel">
      <div className="integration-list">
        <div className="integration-item">
          <span className="integration-name">Slack Integration</span>
          <button className="configure-button">Configure</button>
        </div>
        <div className="integration-item">
          <span className="integration-name">Webhook Integration</span>
          <button className="configure-button">Configure</button>
        </div>
        <div className="integration-item">
          <span className="integration-name">API Integration</span>
          <button className="configure-button">Configure</button>
        </div>
      </div>
    </div>
  );
}

function MediumTierFeatures() {
  return (
    <div className="medium-tier-features">
      <ul>
        <li>Advanced User Management</li>
        <li>Custom Workflows</li>
        <li>Enhanced Security</li>
        <li>Priority Support</li>
      </ul>
    </div>
  );
}

function EnterpriseFeatures() {
  return (
    <div className="enterprise-features">
      <ul>
        <li>Single Sign-On (SSO)</li>
        <li>Advanced Compliance</li>
        <li>Custom Branding</li>
        <li>Dedicated Support</li>
        <li>Advanced Analytics</li>
        <li>API Rate Limiting</li>
      </ul>
    </div>
  );
}