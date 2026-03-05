'use client';

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PermissionSnapshot {
  id: string;
  userId: string;
  reason: string;
  snapshotData: Record<string, unknown>;
  fingerprintHash: string;
  createdAt: string;
}

const reasonBadgeVariant = (reason: string) => {
  switch (reason) {
    case 'PERMISSION_GRANT':
      return 'primary-light';
    case 'PERMISSION_REVOKE':
      return 'destructive-light';
    case 'ROLE_CHANGE':
      return 'accent-light';
    default:
      return 'muted';
  }
};

const formatReason = (reason: string) => {
  return reason
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function PermissionHistoryViewer() {
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  // Placeholder — data will be fetched via GraphQL hooks (GET_PERMISSION_HISTORY)
  const snapshots: PermissionSnapshot[] = [];
  const isLoading = false;

  const filteredSnapshots =
    reasonFilter === 'all'
      ? snapshots
      : snapshots.filter((s) => s.reason === reasonFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Permission History</CardTitle>
            <CardDescription>
              Timeline of permission changes and role assignments
            </CardDescription>
          </div>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Filter by reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="PERMISSION_GRANT">Grants</SelectItem>
              <SelectItem value="PERMISSION_REVOKE">Revocations</SelectItem>
              <SelectItem value="ROLE_CHANGE">Role Changes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading permission history...
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No permission changes recorded yet
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {filteredSnapshots.map((snapshot) => (
                <div key={snapshot.id} className="relative flex gap-4 pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.75 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={reasonBadgeVariant(snapshot.reason)}>
                        {formatReason(snapshot.reason)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(snapshot.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      User: {snapshot.userId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredSnapshots.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
