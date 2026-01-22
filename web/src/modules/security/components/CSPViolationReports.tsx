/**
 * CSP Violation Reports Component
 * Displays Content Security Policy violation reports
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CSPViolationReports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSP Violation Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            CSP violation reports interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}