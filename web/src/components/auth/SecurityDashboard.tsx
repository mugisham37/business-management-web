/**
 * Security Dashboard Component
 * Advanced security monitoring and management interface
 * Uses foundation layer hooks: useAuth, useSecurity
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Monitor,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { useSecurity } from '@/lib/hooks/auth/useSecurity';
import { cn } from '@/lib/utils/cn';

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  blockedIPs: number;
  activeSessions: number;
  trustedDevices: number;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface IPRestriction {
  id: string;
  ipAddress: string;
  type: 'allow' | 'block';
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
}

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use foundation layer hooks
  const { user, isAuthenticated } = useAuth();
  const { riskScore, riskLevel, logSecurityEvent } = useSecurity();

  // Local state for security data - managed internally since useSecurity doesn't expose these
  const [securityEvents] = useState<SecurityEvent[]>([]);
  const [ipRestrictions] = useState<IPRestriction[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    maxFailedAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 24,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedIPs: 0,
    activeSessions: 1,
    trustedDevices: 1,
  });

  // Update metrics based on security events
  useEffect(() => {
    const failedLogins = securityEvents.filter(e => e.type.includes('FAILED_LOGIN')).length;
    const suspiciousActivity = securityEvents.filter(e => 
      e.severity === 'high' || e.severity === 'critical'
    ).length;
    const blockedIPs = ipRestrictions.filter(r => r.type === 'block' && r.isActive).length;

    setMetrics(prev => ({
      ...prev,
      totalEvents: securityEvents.length,
      failedLogins,
      suspiciousActivity,
      blockedIPs,
    }));
  }, [securityEvents, ipRestrictions]);

  // Filter security events based on search and filters
  const filteredEvents = useMemo(() => {
    return securityEvents.filter(event => {
      const matchesSearch = !searchTerm || 
        event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [securityEvents, searchTerm, severityFilter]);

  // Get critical alerts
  const criticalAlerts = useMemo(() => {
    return securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
  }, [securityEvents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh - in production this would fetch from server
      await new Promise(resolve => setTimeout(resolve, 1000));
      await logSecurityEvent('dashboard_refresh', 'Security dashboard refreshed', {
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    setSettingsLoading(true);
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      await logSecurityEvent('settings_updated', 'Security settings updated', {
        userId: user?.id,
        changes: newSettings,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      events: securityEvents,
      ipRestrictions,
      settings,
      riskScore,
      riskLevel,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-gray-500">Please sign in to view the security dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your account security</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={exportSecurityReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Risk Score Indicator */}
      {riskLevel && (
        <Card className={cn(
          "border-l-4",
          riskLevel === 'critical' && "border-l-red-500",
          riskLevel === 'high' && "border-l-orange-500",
          riskLevel === 'medium' && "border-l-yellow-500",
          riskLevel === 'low' && "border-l-green-500"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={cn(
                  "h-6 w-6",
                  riskLevel === 'critical' && "text-red-600",
                  riskLevel === 'high' && "text-orange-600",
                  riskLevel === 'medium' && "text-yellow-600",
                  riskLevel === 'low' && "text-green-600"
                )} />
                <div>
                  <p className="font-medium">Security Risk Level: {riskLevel.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Risk Score: {riskScore}/100</p>
                </div>
              </div>
              <Badge className={getSeverityColor(riskLevel)}>
                {riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failedLogins}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeSessions}</p>
              </div>
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="restrictions">IP Restrictions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No security events recorded yet.
                  </p>
                ) : (
                  securityEvents.slice(0, 5).map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-50">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{event.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-gray-600">
                            {event.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalAlerts.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-gray-500">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>No critical alerts at this time</span>
                  </div>
                ) : (
                  criticalAlerts.slice(0, 3).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-900">{alert.type}</p>
                          <p className="text-sm text-red-700">{alert.description}</p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Detailed view of all security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No events match your filters.
                  </p>
                ) : (
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                            <div>
                              <p className="font-medium">{event.type}</p>
                              <p className="text-sm text-gray-600">{event.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {event.timestamp.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{event.ipAddress}</span>
                              {event.location && <span>• {event.location}</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-6">
          {/* IP Restrictions Management */}
          <Card>
            <CardHeader>
              <CardTitle>IP Address Restrictions</CardTitle>
              <CardDescription>Manage allowed and blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ipRestrictions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No IP restrictions configured.
                  </p>
                ) : (
                  ipRestrictions.map((restriction) => (
                    <div
                      key={restriction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          restriction.type === 'allow' ? "bg-green-50" : "bg-red-50"
                        )}>
                          {restriction.type === 'allow' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Ban className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{restriction.ipAddress}</p>
                          <p className="text-sm text-gray-600">{restriction.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={restriction.isActive ? "default" : "secondary"}
                        >
                          {restriction.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Failed Login Threshold</label>
                  <Input
                    type="number"
                    value={settings.maxFailedAttempts}
                    onChange={(e) => updateSettings({
                      maxFailedAttempts: parseInt(e.target.value) || 5
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of failed attempts before account lockout
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Lockout Duration (minutes)</label>
                  <Input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => updateSettings({
                      lockoutDuration: parseInt(e.target.value) || 15
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long accounts remain locked after failed attempts
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Session Timeout (hours)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSettings({
                      sessionTimeout: parseInt(e.target.value) || 24
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Automatic session expiration time
                  </p>
                </div>

                <Button
                  onClick={() => updateSettings(settings)}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SecurityDashboard;
