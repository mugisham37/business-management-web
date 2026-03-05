'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Session {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

const isSessionExpired = (expiresAt: string) => {
  return new Date(expiresAt) < new Date();
};

const parseUserAgent = (ua: string) => {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

export default function SessionsManager() {
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState(false);

  // Placeholder — data will be fetched via GraphQL hooks (GET_ACTIVE_SESSIONS)
  const sessions: Session[] = [];
  const isLoading = false;

  const activeSessions = sessions.filter((s) => !isSessionExpired(s.expiresAt));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your active sessions across devices
            </CardDescription>
          </div>
          <Dialog open={isRevokeAllOpen} onOpenChange={setIsRevokeAllOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={activeSessions.length === 0}
              >
                Revoke All Sessions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Revoke All Sessions</DialogTitle>
                <DialogDescription>
                  This will sign you out from all devices. You will need to sign
                  in again.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => setIsRevokeAllOpen(false)}
                >
                  Revoke All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Browser</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No active sessions found
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const expired = isSessionExpired(session.expiresAt);
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {parseUserAgent(session.userAgent)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.ipAddress}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(session.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={expired ? 'muted' : 'primary-light'}
                        >
                          {expired ? 'Expired' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={revokeTarget?.id === session.id}
                          onOpenChange={(open) =>
                            setRevokeTarget(open ? session : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={expired}
                            >
                              Revoke
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Revoke Session</DialogTitle>
                              <DialogDescription>
                                This will terminate the session from{' '}
                                {parseUserAgent(session.userAgent)} at{' '}
                                {session.ipAddress}.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => setRevokeTarget(null)}
                              >
                                Revoke
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {activeSessions.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            {activeSessions.length} active session
            {activeSessions.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
