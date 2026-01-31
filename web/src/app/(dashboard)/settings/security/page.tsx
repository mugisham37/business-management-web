"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";
import { Shield, Key, AlertTriangle, Save, Clock, Globe, Plus, X, CheckCircle } from "lucide-react";
import { 
  GET_SECURITY_SETTINGS_QUERY, 
  GET_IP_RESTRICTIONS_QUERY, 
  GET_TIME_BASED_ACCESS_QUERY 
} from "@/graphql/queries/auth-complete";
import { UPDATE_SECURITY_SETTINGS_MUTATION } from "@/graphql/mutations/auth-complete";
import { toast } from "sonner";

interface SecuritySettings {
  mfaEnabled: boolean;
  sessionTimeout: number;
  maxSessions: number;
  passwordExpiryDays: number;
  requirePasswordChange: boolean;
  allowedIpAddresses: string[];
  blockedIpAddresses: string[];
  timeBasedAccess: {
    allowedHours: string;
    timezone: string;
  };
}

interface IpRestrictions {
  allowedIps: string[];
  blockedIps: string[];
  isEnabled: boolean;
  lastUpdated: string;
}

interface TimeBasedAccess {
  isEnabled: boolean;
  allowedHours: string;
  timezone: string;
  exceptions: Array<{
    date: string;
    allowedHours: string;
    reason: string;
  }>;
}

export default function SecuritySettingsPage() {
  // Initialize state with query data
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [ipRestrictions, setIpRestrictions] = useState<IpRestrictions | null>(null);
  const [timeBasedAccess, setTimeBasedAccess] = useState<TimeBasedAccess | null>(null);
  const [newAllowedIp, setNewAllowedIp] = useState("");
  const [newBlockedIp, setNewBlockedIp] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // GraphQL queries - use onCompleted to initialize state once
  const { loading: securityLoading, refetch: refetchSecurity } = useQuery(GET_SECURITY_SETTINGS_QUERY, {
    onCompleted: (data) => {
      if (data?.getSecuritySettings && !settings) {
        setSettings(data.getSecuritySettings);
      }
    }
  });
  const { loading: ipLoading, refetch: refetchIp } = useQuery(GET_IP_RESTRICTIONS_QUERY, {
    onCompleted: (data) => {
      if (data?.getIpRestrictions && !ipRestrictions) {
        setIpRestrictions(data.getIpRestrictions);
      }
    }
  });
  const { loading: timeLoading, refetch: refetchTime } = useQuery(GET_TIME_BASED_ACCESS_QUERY, {
    onCompleted: (data) => {
      if (data?.getTimeBasedAccess && !timeBasedAccess) {
        setTimeBasedAccess(data.getTimeBasedAccess);
      }
    }
  });

  // GraphQL mutations
  const [updateSecuritySettings, { loading: updating }] = useMutation(UPDATE_SECURITY_SETTINGS_MUTATION);

  const handleSettingChange = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleTimeBasedAccessChange = <K extends keyof TimeBasedAccess>(key: K, value: TimeBasedAccess[K]) => {
    if (!timeBasedAccess) return;
    
    setTimeBasedAccess(prev => ({
      ...prev!,
      [key]: value
    }));
    setHasChanges(true);
  };

  const addAllowedIp = () => {
    if (!newAllowedIp.trim() || !ipRestrictions) return;
    
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipPattern.test(newAllowedIp.trim())) {
      toast.error("Invalid IP address format");
      return;
    }

    setIpRestrictions(prev => ({
      ...prev!,
      allowedIps: [...prev!.allowedIps, newAllowedIp.trim()]
    }));
    setNewAllowedIp("");
    setHasChanges(true);
  };

  const removeAllowedIp = (ip: string) => {
    if (!ipRestrictions) return;
    
    setIpRestrictions(prev => ({
      ...prev!,
      allowedIps: prev!.allowedIps.filter(allowedIp => allowedIp !== ip)
    }));
    setHasChanges(true);
  };

  const addBlockedIp = () => {
    if (!newBlockedIp.trim() || !ipRestrictions) return;
    
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipPattern.test(newBlockedIp.trim())) {
      toast.error("Invalid IP address format");
      return;
    }

    setIpRestrictions(prev => ({
      ...prev!,
      blockedIps: [...prev!.blockedIps, newBlockedIp.trim()]
    }));
    setNewBlockedIp("");
    setHasChanges(true);
  };

  const removeBlockedIp = (ip: string) => {
    if (!ipRestrictions) return;
    
    setIpRestrictions(prev => ({
      ...prev!,
      blockedIps: prev!.blockedIps.filter(blockedIp => blockedIp !== ip)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !ipRestrictions || !timeBasedAccess) return;

    try {
      await updateSecuritySettings({
        variables: {
          input: {
            mfaEnabled: settings.mfaEnabled,
            sessionTimeout: settings.sessionTimeout,
            maxSessions: settings.maxSessions,
            passwordExpiryDays: settings.passwordExpiryDays,
            requirePasswordChange: settings.requirePasswordChange,
            allowedIpAddresses: ipRestrictions.allowedIps,
            blockedIpAddresses: ipRestrictions.blockedIps,
            timeBasedAccess: {
              allowedHours: timeBasedAccess.allowedHours,
              timezone: timeBasedAccess.timezone
            }
          }
        }
      });

      // Refetch data to ensure consistency
      await Promise.all([refetchSecurity(), refetchIp(), refetchTime()]);
      
      setHasChanges(false);
      toast.success("Security settings updated successfully");
    } catch (error) {
      console.error("Failed to update security settings:", error);
      toast.error("Failed to update security settings");
    }
  };

  const loading = securityLoading || ipLoading || timeLoading;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Security Settings" description="Configure security options" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader 
        title="Security Settings" 
        description="Configure comprehensive security options for your account" 
        actions={
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!hasChanges || updating}
          >
            <Save className="mr-2 h-4 w-4" />
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        } 
      />

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click &quot;Save Changes&quot; to apply your security settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <Key className="h-5 w-5 mb-2 text-primary" />
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Configure authentication and session management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Multi-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for enhanced security</p>
              </div>
              <Switch 
                checked={settings?.mfaEnabled || false}
                onCheckedChange={(checked) => handleSettingChange('mfaEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input 
                type="number" 
                value={settings?.sessionTimeout || 30}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-32" 
                min="5"
                max="1440"
              />
              <p className="text-xs text-muted-foreground">Sessions will expire after this period of inactivity</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Maximum Active Sessions</Label>
              <Input 
                type="number" 
                value={settings?.maxSessions || 5}
                onChange={(e) => handleSettingChange('maxSessions', parseInt(e.target.value))}
                className="w-32" 
                min="1"
                max="20"
              />
              <p className="text-xs text-muted-foreground">Maximum number of concurrent sessions per user</p>
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <Shield className="h-5 w-5 mb-2 text-primary" />
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>Configure password requirements and expiration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password Expiry (days)</Label>
              <Input 
                type="number" 
                value={settings?.passwordExpiryDays || 90}
                onChange={(e) => handleSettingChange('passwordExpiryDays', parseInt(e.target.value))}
                className="w-32" 
                min="0"
                max="365"
              />
              <p className="text-xs text-muted-foreground">Set to 0 to disable password expiration</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Force Password Change</Label>
                <p className="text-sm text-muted-foreground">Require users to change passwords on next login</p>
              </div>
              <Switch 
                checked={settings?.requirePasswordChange || false}
                onCheckedChange={(checked) => handleSettingChange('requirePasswordChange', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* IP Restrictions */}
        <Card>
          <CardHeader>
            <Globe className="h-5 w-5 mb-2 text-primary" />
            <CardTitle>IP Address Restrictions</CardTitle>
            <CardDescription>Control access based on IP addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable IP Restrictions</Label>
                <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
              </div>
              <Switch 
                checked={ipRestrictions?.isEnabled || false}
                onCheckedChange={(checked) => setIpRestrictions(prev => prev ? {...prev, isEnabled: checked} : null)}
              />
            </div>
            
            {ipRestrictions?.isEnabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>Allowed IP Addresses</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="192.168.1.0/24 or 192.168.1.100"
                      value={newAllowedIp}
                      onChange={(e) => setNewAllowedIp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAllowedIp()}
                    />
                    <Button size="sm" onClick={addAllowedIp}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ipRestrictions.allowedIps.map((ip) => (
                      <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                        {ip}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeAllowedIp(ip)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />
                <div className="space-y-3">
                  <Label>Blocked IP Addresses</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="192.168.1.100 or 10.0.0.0/8"
                      value={newBlockedIp}
                      onChange={(e) => setNewBlockedIp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedIp()}
                    />
                    <Button size="sm" onClick={addBlockedIp}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ipRestrictions.blockedIps.map((ip) => (
                      <Badge key={ip} variant="destructive" className="flex items-center gap-1">
                        {ip}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeBlockedIp(ip)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Time-Based Access */}
        <Card>
          <CardHeader>
            <Clock className="h-5 w-5 mb-2 text-primary" />
            <CardTitle>Time-Based Access</CardTitle>
            <CardDescription>Restrict access to specific time periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Time Restrictions</Label>
                <p className="text-sm text-muted-foreground">Limit access to specific hours</p>
              </div>
              <Switch 
                checked={timeBasedAccess?.isEnabled || false}
                onCheckedChange={(checked) => handleTimeBasedAccessChange('isEnabled', checked)}
              />
            </div>
            
            {timeBasedAccess?.isEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Allowed Hours</Label>
                  <Input 
                    placeholder="09:00-17:00"
                    value={timeBasedAccess.allowedHours}
                    onChange={(e) => handleTimeBasedAccessChange('allowedHours', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Format: HH:MM-HH:MM (24-hour format)</p>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input 
                    placeholder="America/New_York"
                    value={timeBasedAccess.timezone}
                    onChange={(e) => handleTimeBasedAccessChange('timezone', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">IANA timezone identifier</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CheckCircle className="h-5 w-5 mb-2 text-green-600" />
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Current security configuration overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Badge variant={settings?.mfaEnabled ? "default" : "secondary"}>
                {settings?.mfaEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <span className="text-sm">Multi-Factor Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ipRestrictions?.isEnabled ? "default" : "secondary"}>
                {ipRestrictions?.isEnabled ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm">IP Restrictions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={timeBasedAccess?.isEnabled ? "default" : "secondary"}>
                {timeBasedAccess?.isEnabled ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm">Time-Based Access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
