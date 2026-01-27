"use client";

import React, { createContext, useContext } from "react";
import { Toaster, toast, type ExternalToast } from "sonner";

interface NotificationContextValue {
    success: (message: string, options?: ExternalToast) => void;
    error: (message: string, options?: ExternalToast) => void;
    info: (message: string, options?: ExternalToast) => void;
    warning: (message: string, options?: ExternalToast) => void;
    promise: <T, >(
        promise: Promise<T>,
        options: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const value: NotificationContextValue = {
        success: (message, options) => toast.success(message, options),
        error: (message, options) => toast.error(message, options),
        info: (message, options) => toast.info(message, options),
        warning: (message, options) => toast.warning(message, options),
        promise: (promise, options) => toast.promise(promise, options),
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <Toaster
                position="top-right"
                expand={false}
                richColors
                closeButton
                duration={4000}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within NotificationProvider");
    }
    return context;
}

// Re-export toast for direct use
export { toast };
