/**
 * Security Management Page
 * Enterprise security dashboard and management interface
 * Requirements: 12.1, 12.2, 12.4, 12.5, 12.6
 */

import React from 'react';
import { SecurityDashboard } from '@/modules/security';

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Security Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage enterprise security, compliance, and audit logs.
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
}

export const metadata = {
  title: 'Security Management',
  description: 'Enterprise security management and monitoring dashboard',
};