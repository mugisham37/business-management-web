"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useAuth } from "@/hooks/authentication/useAuth";

interface RealtimeContextValue {
    isConnected: boolean;
    subscribe: (channel: string, callback: (data: unknown) => void) => () => void;
    unsubscribe: (channel: string) => void;
    emit: (channel: string, data: unknown) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Map<string, Set<(data: unknown) => void>>>(new Map());
    // Apollo client is available for future GraphQL subscription integration
    useApolloClient();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // WebSocket connection is handled by Apollo Client
        // This provider manages subscription state and provides convenience methods
        setIsConnected(true);

        return () => {
            setIsConnected(false);
            subscriptions.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const subscribe = (channel: string, callback: (data: unknown) => void) => {
        setSubscriptions((prev) => {
            const newSubs = new Map(prev);
            if (!newSubs.has(channel)) {
                newSubs.set(channel, new Set());
            }
            newSubs.get(channel)!.add(callback);
            return newSubs;
        });

        // Return unsubscribe function
        return () => {
            setSubscriptions((prev) => {
                const newSubs = new Map(prev);
                const channelSubs = newSubs.get(channel);
                if (channelSubs) {
                    channelSubs.delete(callback);
                    if (channelSubs.size === 0) {
                        newSubs.delete(channel);
                    }
                }
                return newSubs;
            });
        };
    };

    const unsubscribe = (channel: string) => {
        setSubscriptions((prev) => {
            const newSubs = new Map(prev);
            newSubs.delete(channel);
            return newSubs;
        });
    };

    const emit = (channel: string, data: unknown) => {
        const channelSubs = subscriptions.get(channel);
        if (channelSubs) {
            channelSubs.forEach((callback) => callback(data));
        }
    };

    const value: RealtimeContextValue = {
        isConnected,
        subscribe,
        unsubscribe,
        emit,
    };

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error("useRealtime must be used within RealtimeProvider");
    }
    return context;
}

// Convenience hook for subscribing to a channel
export function useRealtimeChannel(
    channel: string,
    callback: (data: unknown) => void,
    deps: React.DependencyList = []
) {
    const { subscribe } = useRealtime();

    useEffect(() => {
        return subscribe(channel, callback);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, ...deps]);
}
