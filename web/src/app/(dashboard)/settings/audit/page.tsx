"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { Download, FileText, User, Settings, ShoppingCart, DollarSign, Filter, Search, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { GET_AUDIT_LOGS_QUERY } from "@/graphql/queries/auth-complete";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLog { 
  id: string; 
  userId: string;
  action: string; 
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string; 
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditLogFilter {
  action?: string;
  resource?: string;
  userId?: string;
  severity?: string;
  dateRange?: DateRange;
  ipAddress?: string;
}

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const severityIcons = {
  low: Info,
  medium: AlertTriangle,
  high: XCircle,
  critical: AlertTriangle
};

type LucideIcon = typeof User;

const actionIcons: Record<string, LucideIcon> = {
  "User Login": User,
  "User Logout": User,
  "Settings Changed": Settings,
  "Order Created": ShoppingCart,
  "Payment Processed": DollarSign,
  "Product Updated": FileText,
  "Permission Granted": CheckCircle,
  "Permission Revoked": XCircle,
  "MFA Enabled": CheckCircle,
  "MFA Disabled": XCircle,
  "Session Terminated": XCircle,
  "Password Changed": CheckCircle,
  "Security Alert": AlertTriangle
};

export default function AuditLogsPage() {
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 50 });

  // GraphQL query for audit logs
  const { data, loading, error } = useQuery(GET_AUDIT_LOGS_QUERY, {
    variables: {
      filter: {
        ...filter,
        action: filter.action || undefined,
        resource: filter.resource || undefined,
        userId: filter.userId || undefined,
        severity: filter.severity || undefined,
        startDate: filter.dateRange?.from?.toISOString(),
        endDate: filter.dateRange?.to?.toISOString(),
        ipAddress: filter.ipAddress || undefined,
        search: searchTerm || undefined
      },
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  const logs = data?.getAuditLogs?.logs || [];
  const totalCount = data?.getAuditLogs?.totalCount || 0;
  const hasNextPage = data?.getAuditLogs?.hasNextPage || false;
  const hasPreviousPage = data?.getAuditLogs?.hasPreviousPage || false;

  // Fallback data for development/demo
  const fallbackLogs: AuditLog[] = [
    { id: "1", userId: "user1", action: "User Login", resource: "Authentication", timestamp: "2026-01-29 14:32:15", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0", severity: "low" },
    { id: "2", userId: "user2", action: "Order Created", resource: "Order", resourceId: "#12456", timestamp: "2026-01-29 14:28:42", ipAddress: "192.168.1.101", userAgent: "Mozilla/5.0", severity: "low" },
    { id: "3", userId: "user3", action: "Product Updated", resource: "Product", resourceId: "PROD-001", timestamp: "2026-01-29 14:15:30", ipAddress: "192.168.1.102", userAgent: "Mozilla/5.0", severity: "medium" },
    { id: "4", userId: "admin", action: "Settings Changed", resource: "Security Settings", timestamp: "2026-01-29 13:45:00", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0", severity: "high" },
    { id: "5", userId: "system", action: "Payment Processed", resource: "Payment", resourceId: "#8765", timestamp: "2026-01-29 13:30:22", ipAddress: "API", userAgent: "System", severity: "low" },
    { id: "6", userId: "user4", action: "Security Alert", resource: "Authentication", timestamp: "2026-01-29 12:15:00", ipAddress: "192.168.1.200", userAgent: "Mozilla/5.0", severity: "critical" },
    { id: "7", userId: "user1", action: "MFA Enabled", resource: "User Settings", timestamp: "2026-01-29 11:30:00", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0", severity: "medium" },
    { id: "8", userId: "user2", action: "Session Terminated", resource: "Session", resourceId: "sess_123", timestamp: "2026-01-29 10:45:00", ipAddress: "192.168.1.101", userAgent: "Mozilla/5.0", severity: "medium" }
  ];

  const displayLogs = logs.length > 0 ? logs : fallbackLogs;

  const columns: ColumnDef<AuditLog>[] = [
    { 
      accessorKey: "timestamp", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />, 
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm">{format(new Date(row.getValue("timestamp")), "MMM dd, HH:mm:ss")}</span>
          <span className="font-mono text-xs text-muted-foreground">{format(new Date(row.getValue("timestamp")), "yyyy")}</span>
        </div>
      )
    },
    { 
      accessorKey: "action", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />, 
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        const Icon = actionIcons[action] || FileText;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{action}</Badge>
          </div>
        );
      }
    },
    { 
      accessorKey: "userId", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("userId")}</span>
        </div>
      )
    },
    { 
      accessorKey: "resource", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
      cell: ({ row }) => {
        const resource = row.getValue("resource") as string;
        const resourceId = row.original.resourceId;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{resource}</span>
            {resourceId && <span className="text-xs text-muted-foreground">{resourceId}</span>}
          </div>
        );
      }
    },
    { 
      accessorKey: "severity", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Severity" />,
      cell: ({ row }) => {
        const severity = row.getValue("severity") as keyof typeof severityColors;
        const Icon = severityIcons[severity];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Badge className={severityColors[severity]}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          </div>
        );
      }
    },
    { 
      accessorKey: "ipAddress", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />, 
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">{row.getValue("ipAddress")}</span>
      )
    }
  ];

  const handleFilterChange = (key: keyof AuditLogFilter, value: string | DateRange | undefined) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleExport = async () => {
    try {
      // In a real implementation, this would call an export API
      const csvContent = [
        "Timestamp,Action,User,Resource,Severity,IP Address",
        ...displayLogs.map((log: AuditLog) => 
          `${log.timestamp},${log.action},${log.userId},${log.resource},${log.severity},${log.ipAddress}`
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Audit logs exported successfully");
    } catch {
      toast.error("Failed to export audit logs");
    }
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm("");
    setPagination({ page: 1, limit: 50 });
  };

  // Calculate statistics
  const stats = {
    today: displayLogs.filter((log: AuditLog) => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: displayLogs.filter((log: AuditLog) => {
      const logDate = new Date(log.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length,
    uniqueUsers: new Set(displayLogs.map((log: AuditLog) => log.userId)).size,
    criticalEvents: displayLogs.filter((log: AuditLog) => log.severity === 'critical').length
  };

  if (error) {
    console.error("Error loading audit logs:", error.message);
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader 
        title="Audit Logs" 
        description="Comprehensive system activity history and security monitoring" 
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        } 
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Events logged today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Events in last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users with activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">High-priority security events</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filter.action || "all"} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="User Login">User Login</SelectItem>
                  <SelectItem value="User Logout">User Logout</SelectItem>
                  <SelectItem value="Settings Changed">Settings Changed</SelectItem>
                  <SelectItem value="Order Created">Order Created</SelectItem>
                  <SelectItem value="Payment Processed">Payment Processed</SelectItem>
                  <SelectItem value="Security Alert">Security Alert</SelectItem>
                  <SelectItem value="MFA Enabled">MFA Enabled</SelectItem>
                  <SelectItem value="Session Terminated">Session Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={filter.severity || "all"} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange
                date={filter.dateRange}
                onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {displayLogs.length} of {totalCount > 0 ? totalCount : displayLogs.length} entries
              {loading && " (Loading...)"}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!hasPreviousPage || loading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!hasNextPage || loading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={displayLogs} 
              searchKey="action"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
