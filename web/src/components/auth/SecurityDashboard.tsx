/**
 * Security Dashboard Component
 * Advanced security monitoring and management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Eye,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthEvents } from '@/hooks/authentication/useAuthEvents';
import { useSecuritySettings } from '@/hooks/authentication/useSecuritySettings';
import { useAuditLogs } from '@/hooks/utilities-infrastructure/useAuditLogs';
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

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');

  const { state: authEventsState, getEventsByType, getCriticalAlerts } = useAuthEvents();
  const { settings, updateSettings, isLoading: settingsLoading } = useSecuritySettings();
  const { logs, isLoading: logsLoading, refetch: refetchLogs } = useAuditLogs({
    limit: 100,
    timeRange,
  });

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedIPs: 0,
    activeSessions: 0,
    trustedDevices: 0,
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [ipRestrictions, setIpRestrictions] = useState<IPRestriction[]>([]);

  useEffect(() => {
    // Update metrics based on auth events
    const failedLogins = getEventsByType('FAILED_LOGIN_ATTEMPT').length;
    const suspiciousActivity = getEventsByType('SUSPICIOUS_ACTIVITY').length;
    const criticalAlerts = getCriticalAlerts().length;

    setMetrics(prev => ({
      ...prev,
      totalEvents: authEventsState.events.length,
      failedLogins,
      suspiciousActivity: suspiciousActivity + criticalAlerts,
    }));
  }, [authEventsState.events, getEventsByType, getCriticalAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      events: securityEvents,
      ipRestrictions,
      settings,
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
            onClick={() => refetchLogs()}
            disabled={logsLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", logsLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={exportSecurityReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

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
                {authEventsState.events.slice(0, 5).map((event, index) => (
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
                    <Badge variant="outline">
                      {event.metadata?.severity || 'info'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCriticalAlerts().slice(0, 3).map((alert, index) => (
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
                        <p className="font-medium text-red-900">{alert.title}</p>
                        <p className="text-sm text-red-700">{alert.message}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </motion.div>
                ))}
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
                <AnimatePresence>
                  {securityEvents.map((event, index) => (
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
                {ipRestrictions.map((restriction) => (
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
                ))}
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
                    value={settings?.maxFailedAttempts || 5}
                    onChange={(e) => updateSettings({
                      maxFailedAttempts: parseInt(e.target.value)
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
                    value={settings?.lockoutDuration || 15}
                    onChange={(e) => updateSettings({
                      lockoutDuration: parseInt(e.target.value)
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
                    value={settings?.sessionTimeout || 24}
                    onChange={(e) => updateSettings({
                      sessionTimeout: parseInt(e.target.value)
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