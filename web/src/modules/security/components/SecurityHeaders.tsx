/**
 * Security Headers Component
 * Displays and manages security headers configuration
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SecurityHeaders() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Security headers configuration interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}