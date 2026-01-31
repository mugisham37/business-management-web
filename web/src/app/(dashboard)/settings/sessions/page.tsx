"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  Shield, 
  X, 
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { 
  GET_ACTIVE_SESSIONS_QUERY, 
  GET_DEVICE_SESSIONS_QUERY, 
  GET_TRUSTED_DEVICES_QUERY 
} from "@/graphql/queries/auth-complete";
import { 
  TERMINATE_SESSION_MUTATION, 
  LOGOUT_ALL_SESSIONS_MUTATION,
  TRUST_DEVICE_MUTATION,
  UNTRUST_DEVICE_MUTATION
} from "@/graphql/mutations/auth-complete";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    deviceId: string;
    platform: 'web' | 'ios' | 'android';
    deviceName: string;
    browserInfo?: {
      name: string;
      version: string;
      userAgent: string;
    };
    appVersion: string;
    trusted: boolean;
    fingerprint: string;
  };
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrentSession: boolean;
}

type PlatformType = 'web' | 'ios' | 'android' | 'tablet';

interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  platform: PlatformType;
  fingerprint: string;
  trustedAt: string;
  lastUsed: string;
  isActive: boolean;
}

const platformIcons: Record<PlatformType, typeof Monitor> = {
  web: Monitor,
  ios: Smartphone,
  android: Smartphone,
  tablet: Tablet
};

const platformColors: Record<PlatformType, string> = {
  web: "bg-blue-100 text-blue-800",
  ios: "bg-gray-100 text-gray-800", 
  android: "bg-green-100 text-green-800",
  tablet: "bg-purple-100 text-purple-800"
};

export default function SessionManagementPage() {
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);

  // GraphQL queries
  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(GET_ACTIVE_SESSIONS_QUERY);
  const { loading: devicesLoading, refetch: refetchDevices } = useQuery(GET_DEVICE_SESSIONS_QUERY);
  const { data: trustedData, loading: trustedLoading, refetch: refetchTrusted } = useQuery(GET_TRUSTED_DEVICES_QUERY);

  // GraphQL mutations
  const [terminateSession, { loading: terminating }] = useMutation(TERMINATE_SESSION_MUTATION);
  const [logoutAllSessions, { loading: terminatingAll }] = useMutation(LOGOUT_ALL_SESSIONS_MUTATION);
  const [trustDevice] = useMutation(TRUST_DEVICE_MUTATION);
  const [untrustDevice, { loading: untrusting }] = useMutation(UNTRUST_DEVICE_MUTATION);

  const sessions: SessionInfo[] = sessionsData?.getActiveSessions || [];
  const trustedDevices: TrustedDevice[] = trustedData?.getTrustedDevices || [];

  // Fallback data for development/demo
  const fallbackSessions: SessionInfo[] = [
    {
      id: "sess_current",
      userId: "user1",
      deviceInfo: {
        deviceId: "dev_web_001",
        platform: "web",
        deviceName: "Chrome on MacBook Pro",
        browserInfo: {
          name: "Chrome",
          version: "120.0.0.0",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        },
        appVersion: "1.0.0",
        trusted: true,
        fingerprint: "fp_web_001"
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      createdAt: "2026-01-29T10:00:00Z",
      lastActivity: "2026-01-29T14:30:00Z",
      expiresAt: "2026-01-30T14:30:00Z",
      isActive: true,
      isCurrentSession: true
    },
    {
      id: "sess_mobile",
      userId: "user1",
      deviceInfo: {
        deviceId: "dev_ios_001",
        platform: "ios",
        deviceName: "iPhone 15 Pro",
        appVersion: "1.2.0",
        trusted: true,
        fingerprint: "fp_ios_001"
      },
      ipAddress: "192.168.1.101",
      userAgent: "MyApp/1.2.0 (iPhone; iOS 17.2)",
      createdAt: "2026-01-29T08:00:00Z",
      lastActivity: "2026-01-29T13:45:00Z",
      expiresAt: "2026-01-30T13:45:00Z",
      isActive: true,
      isCurrentSession: false
    },
    {
      id: "sess_old",
      userId: "user1",
      deviceInfo: {
        deviceId: "dev_web_002",
        platform: "web",
        deviceName: "Firefox on Windows",
        browserInfo: {
          name: "Firefox",
          version: "121.0",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
        },
        appVersion: "1.0.0",
        trusted: false,
        fingerprint: "fp_web_002"
      },
      ipAddress: "203.0.113.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      createdAt: "2026-01-28T15:00:00Z",
      lastActivity: "2026-01-28T18:30:00Z",
      expiresAt: "2026-01-29T18:30:00Z",
      isActive: false,
      isCurrentSession: false
    }
  ];

  const displaySessions: SessionInfo[] = sessions.length > 0 ? sessions : fallbackSessions;
  const activeSessions = displaySessions.filter((s: SessionInfo) => s.isActive);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession({
        variables: { sessionId }
      });
      
      await refetchSessions();
      setShowTerminateDialog(false);
      setSessionToTerminate(null);
      toast.success("Session terminated successfully");
    } catch (error) {
      console.error("Failed to terminate session:", error);
      toast.error("Failed to terminate session");
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await logoutAllSessions();
      
      await refetchSessions();
      setShowTerminateAllDialog(false);
      toast.success("All sessions terminated successfully");
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
      toast.error("Failed to terminate all sessions");
    }
  };

  const handleTrustDevice = async (deviceId: string, trust: boolean) => {
    try {
      if (trust) {
        await trustDevice({ variables: { deviceId } });
        toast.success("Device trusted successfully");
      } else {
        await untrustDevice({ variables: { deviceId } });
        toast.success("Device untrusted successfully");
      }
      
      await Promise.all([refetchSessions(), refetchDevices(), refetchTrusted()]);
    } catch (error) {
      console.error("Failed to update device trust:", error);
      toast.error("Failed to update device trust");
    }
  };

  const getLocationFromIP = (ip: string) => {
    // In a real implementation, this would use a geolocation service
    if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      return "Local Network";
    }
    return "Unknown Location";
  };

  // Calculate threshold time once at component mount - stored in state to avoid impure function during render
  const [suspiciousThreshold] = useState(() => Date.now() - 24 * 60 * 60 * 1000);

  const isSessionSuspicious = (session: SessionInfo) => {
    const suspiciousIPs = ["203.0.113.45", "198.51.100.1"];
    const oldSession = new Date(session.lastActivity).getTime() < suspiciousThreshold;
    return suspiciousIPs.includes(session.ipAddress) || (!session.deviceInfo.trusted && oldSession);
  };

  const loading = sessionsLoading || devicesLoading || trustedLoading;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Session Management" description="Manage active sessions and trusted devices" />
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
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
        title="Session Management" 
        description="Manage your active sessions and trusted devices" 
        actions={
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowTerminateAllDialog(true)}
            disabled={activeSessions.length <= 1}
          >
            <X className="mr-2 h-4 w-4" />
            Terminate All Sessions
          </Button>
        } 
      />

      {/* Session Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Trusted Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trustedDevices.length}</div>
            <p className="text-xs text-muted-foreground">Devices you trust</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suspicious Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {displaySessions.filter(isSessionSuspicious).length}
            </div>
            <p className="text-xs text-muted-foreground">Sessions flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">This device</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Sessions that are currently active and can access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session: SessionInfo) => {
              const PlatformIcon = platformIcons[session.deviceInfo.platform as PlatformType] || Monitor;
              const isSuspicious = isSessionSuspicious(session);
              
              return (
                <div 
                  key={session.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    session.isCurrentSession ? 'border-green-200 bg-green-50' : 
                    isSuspicious ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <PlatformIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{session.deviceInfo.deviceName}</h3>
                          {session.isCurrentSession && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                          {isSuspicious && (
                            <Badge variant="destructive" className="text-xs">Suspicious</Badge>
                          )}
                          {session.deviceInfo.trusted && (
                            <Badge variant="secondary" className="text-xs">Trusted</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ipAddress} • {getLocationFromIP(session.ipAddress)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSession(session)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTrustDevice(session.deviceInfo.deviceId, !session.deviceInfo.trusted)}
                        >
                          {session.deviceInfo.trusted ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Untrust Device
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Trust Device
                            </>
                          )}
                        </DropdownMenuItem>
                        {!session.isCurrentSession && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setSessionToTerminate(session.id);
                              setShowTerminateDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Terminate Session
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>
            Devices that you have marked as trusted for faster authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trustedDevices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trusted devices yet</p>
                <p className="text-sm">Trust devices you use regularly for faster sign-in</p>
              </div>
            ) : (
              trustedDevices.map((device: TrustedDevice) => {
                const PlatformIcon = platformIcons[device.platform] || Monitor;
                
                return (
                  <div key={device.deviceId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <PlatformIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{device.deviceName}</h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Trusted {formatDistanceToNow(new Date(device.trustedAt), { addSuffix: true })}</span>
                            <span>Last used {formatDistanceToNow(new Date(device.lastUsed), { addSuffix: true })}</span>
                            <Badge className={platformColors[device.platform]}>
                              {device.platform.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTrustDevice(device.deviceId, false)}
                      disabled={untrusting}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Remove Trust
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                Detailed information about this session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Device</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.deviceInfo.deviceName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.deviceInfo.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-muted-foreground">{getLocationFromIP(selectedSession.ipAddress)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedSession.createdAt), "PPpp")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Activity</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedSession.lastActivity), "PPpp")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedSession.expiresAt), "PPpp")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2">
                    {selectedSession.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {selectedSession.isCurrentSession && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedSession.deviceInfo.browserInfo && (
                <div>
                  <label className="text-sm font-medium">Browser Information</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.deviceInfo.browserInfo.name} {selectedSession.deviceInfo.browserInfo.version}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">User Agent</label>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {selectedSession.userAgent}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Terminate Session Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session? The user will be logged out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => sessionToTerminate && handleTerminateSession(sessionToTerminate)}
              disabled={terminating}
            >
              {terminating ? "Terminating..." : "Terminate Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate All Sessions Dialog */}
      <Dialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate All Sessions</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate all sessions except the current one? 
              This will log you out from all other devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateAllDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleTerminateAllSessions}
              disabled={terminatingAll}
            >
              {terminatingAll ? "Terminating..." : "Terminate All Sessions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}