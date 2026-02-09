'use client';

import React from 'react';
import { useSessions, useRevokeSession } from '@/hooks/api/useSessions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  RiComputerLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiCheckLine,
  RiAlertLine,
} from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? You will be logged out from that device.')) {
      return;
    }

    try {
      setError('');
      await revokeSession.mutateAsync(sessionId);
      setSuccess('Session revoked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <RiSmartphoneLine className="h-5 w-5" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <RiTabletLine className="h-5 w-5" />;
    }
    return <RiComputerLine className="h-5 w-5" />;
  };

  const getDeviceInfo = (userAgent: string) => {
    // Simple parsing - in production, use a library like ua-parser-js
    const ua = userAgent;
    
    // Extract browser
    let browser = 'Unknown Browser';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    // Extract OS
    let os = 'Unknown OS';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    return `${browser} on ${os}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Active Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your active sessions across all devices
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <RiAlertLine className="h-4 w-4" />
          <div>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <RiCheckLine className="h-4 w-4" />
          <div>
            <p className="text-sm">{success}</p>
          </div>
        </Alert>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions && sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <RiComputerLine className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No active sessions
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You don&apos;t have any active sessions at the moment
            </p>
          </Card>
        ) : (
          sessions?.map((session: any) => {
            const isExpired = new Date(session.expiresAt) < new Date();
            const isCurrent = session.id === sessions[0]?.id; // Simplified - should check against current session

            return (
              <Card key={session.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {getDeviceInfo(session.userAgent)}
                        </h3>
                        {isCurrent && (
                          <Badge variant="success" size="sm">
                            Current session
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="error" size="sm">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">IP Address:</span> {session.ipAddress}
                        </p>
                        {session.deviceFingerprint && (
                          <p>
                            <span className="font-medium">Device ID:</span>{' '}
                            {session.deviceFingerprint.substring(0, 16)}...
                          </p>
                        )}
                        {session.location && (
                          <p>
                            <span className="font-medium">Location:</span> {session.location}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Last active:</span>{' '}
                          {formatDistanceToNow(new Date(session.lastActivity), {
                            addSuffix: true,
                          })}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDistanceToNow(new Date(session.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {formatDistanceToNow(new Date(session.expiresAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(session.id)}
                      isLoading={revokeSession.isPending}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex gap-3">
          <RiAlertLine className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Security tip</p>
            <p className="mt-1 text-muted-foreground">
              If you see a session you don&apos;t recognize, revoke it immediately and change your
              password. Sessions automatically expire after 7 days of inactivity.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
