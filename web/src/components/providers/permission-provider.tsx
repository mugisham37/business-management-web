"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionContextValue {
    hasPermission: (permission: string | string[]) => boolean;
    hasRole: (role: string | string[]) => boolean;
    can: (action: string, resource: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Get permissions and roles from user object
    const permissions = user?.permissions || [];
    const roles = user?.roles || [];

    const hasPermission = (permission: string | string[]): boolean => {
        if (!user) return false;

        const perms = Array.isArray(permission) ? permission : [permission];
        return perms.some((p) => permissions?.includes(p));
    };

    const hasRole = (role: string | string[]): boolean => {
        if (!user) return false;

        const rolesList = Array.isArray(role) ? role : [role];
        return rolesList.some((r) => roles?.includes(r));
    };

    const can = (action: string, resource: string): boolean => {
        return hasPermission(`${resource}:${action}`);
    };

    const value: PermissionContextValue = {
        hasPermission,
        hasRole,
        can,
    };

    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission() {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error("usePermission must be used within PermissionProvider");
    }
    return context;
}

// Component for conditional rendering based on permissions
export function Protected({
    permission,
    role,
    fallback = null,
    children,
}: {
    permission?: string | string[];
    role?: string | string[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { hasPermission, hasRole } = usePermission();

    let hasAccess = true;

    if (permission) {
        hasAccess = hasAccess && hasPermission(permission);
    }

    if (role) {
        hasAccess = hasAccess && hasRole(role);
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
