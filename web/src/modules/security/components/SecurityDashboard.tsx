/**
 * Security Dashboard Component
 * Main security management interface
 * Requirements: 12.1, 12.2, 12.4, 12.5, 12.6
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  FileText,
  Settings,
  Eye
} from 'lucide-react';
import { ComplianceMonitor } from './ComplianceMonitor';
import { AuditLogViewer } from './AuditLogViewer';
import { SecurityHeaders } from './SecurityHeaders';
import { CSPViolationReports } from './CSPViolationReports';
import { useSecurity } from '../hooks/useSecurity';
import { useCompliance } from '../hooks/useCompliance';

export interface SecurityDashboardProps {
  className?: string;
}

export function SecurityDashboard({ className }: SecurityDashboardProps) {
  const { 
    securityStatus, 
    recentIncidents, 
    securityMetrics,
    refreshSecurityStatus 
  } = useSecurity();
  
  const { 
    complianceStatus, 
    recentViolations,
    refreshComplianceStatus 
  } = useCompliance();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    refreshSecurityStatus();
    refreshComplianceStatus();
  }, [refreshSecurityStatus, refreshComplianceStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'needs-review':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'non-compliant':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'needs-review':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'non-compliant':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(securityStatus?.overall || 'unknown')}
              <Badge className={getStatusColor(securityStatus?.overall || 'unknown')}>
                {securityStatus?.overall || 'Unknown'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {securityStatus?.lastUpdated?.toLocaleString() || 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentIncidents?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStatus?.averageScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentViolations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      {recentIncidents && recentIncidents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {recentIncidents.length} security incident(s) detected in the last 24 hours. 
            Review the audit logs for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Security Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="headers">Security Headers</TabsTrigger>
          <TabsTrigger value="csp">CSP Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityMetrics ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed Login Attempts</span>
                      <Badge variant="outline">{securityMetrics.failedLogins}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Blocked Requests</span>
                      <Badge variant="outline">{securityMetrics.blockedRequests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">XSS Attempts</span>
                      <Badge variant="outline">{securityMetrics.xssAttempts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CSRF Violations</span>
                      <Badge variant="outline">{securityMetrics.csrfViolations}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading metrics...</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('audit-logs')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Audit Logs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('compliance')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Compliance Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('headers')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Security Headers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={refreshSecurityStatus}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceMonitor />
        </TabsContent>

        <TabsContent value="audit-logs">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="headers">
          <SecurityHeaders />
        </TabsContent>

        <TabsContent value="csp">
          <CSPViolationReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}