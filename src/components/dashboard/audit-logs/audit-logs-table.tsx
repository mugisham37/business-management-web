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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  result: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const actionBadgeVariant = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'primary-light';
    case 'update':
      return 'accent-light';
    case 'delete':
      return 'destructive-light';
    default:
      return 'muted';
  }
};

const resultBadgeVariant = (result: string) => {
  switch (result.toLowerCase()) {
    case 'success':
      return 'primary-light';
    case 'failure':
    case 'error':
      return 'destructive-light';
    default:
      return 'muted';
  }
};

export default function AuditLogsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');

  // Placeholder — data will be fetched via GraphQL hooks (GET_ORGANIZATION_AUDIT_LOGS)
  const logs: AuditLogEntry[] = [];
  const isLoading = false;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resourceId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResourceType =
      resourceTypeFilter === 'all' || log.resourceType === resourceTypeFilter;

    return matchesSearch && matchesAction && matchesResourceType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          View and filter audit trail of all system actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={resourceTypeFilter}
              onValueChange={setResourceTypeFilter}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
                <SelectItem value="PERMISSION">Permission</SelectItem>
                <SelectItem value="SESSION">Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Resource ID</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={actionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.resourceType}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-37.5">
                      {log.resourceId ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resultBadgeVariant(log.result)}>
                        {log.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.ipAddress ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
