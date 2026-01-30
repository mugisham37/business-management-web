"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BusinessTier } from "./useTierAccess";
import { useAuth } from "@/hooks/authentication/useAuth";

interface TierChangeEvent {
  type: "TIER_CHANGED" | "TRIAL_STARTED" | "TRIAL_EXPIRED" | "SUBSCRIPTION_UPDATED";
  userId: string;
  tenantId: string;
  previousTier?: BusinessTier;
  newTier: BusinessTier;
  effectiveDate: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface FeatureAccessEvent {
  type: "FEATURE_ACCESS_UPDATED";
  userId: string;
  tenantId: string;
  features: string[];
  tier: BusinessTier;
  timestamp: string;
}

interface SubscriptionEvent {
  type: "SUBSCRIPTION_CREATED" | "SUBSCRIPTION_CANCELLED" | "PAYMENT_FAILED" | "PAYMENT_SUCCESS";
  userId: string;
  tenantId: string;
  subscriptionId: string;
  tier: BusinessTier;
  status: string;
  timestamp: string;
}

type RealtimeEvent = TierChangeEvent | FeatureAccessEvent | SubscriptionEvent;

interface RealtimeTierUpdatesOptions {
  onTierChange?: (event: TierChangeEvent) => void;
  onFeatureAccessUpdate?: (event: FeatureAccessEvent) => void;
  onSubscriptionUpdate?: (event: SubscriptionEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useRealtimeTierUpdates(options: RealtimeTierUpdatesOptions = {}) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<RealtimeEvent[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectRef = useRef<(() => void) | null>(null);
  const maxReconnectAttempts = 5;

  const {
    onTierChange,
    onFeatureAccessUpdate,
    onSubscriptionUpdate,
    onConnectionChange,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  // Get WebSocket URL (in a real implementation, this would come from config)
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const token = localStorage.getItem("access_token");
    
    return `${protocol}//${host}/ws/tier-updates?token=${token}`;
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: RealtimeEvent = JSON.parse(event.data);
      
      // Verify the event is for the current user
      if (data.userId !== user?.id) {
        return;
      }

      setLastEvent(data);
      setEventHistory(prev => [...prev.slice(-49), data]); // Keep last 50 events

      // Route to appropriate handler
      switch (data.type) {
        case "TIER_CHANGED":
        case "TRIAL_STARTED":
        case "TRIAL_EXPIRED":
          onTierChange?.(data as TierChangeEvent);
          break;
        
        case "FEATURE_ACCESS_UPDATED":
          onFeatureAccessUpdate?.(data as FeatureAccessEvent);
          break;
        
        case "SUBSCRIPTION_CREATED":
        case "SUBSCRIPTION_CANCELLED":
        case "SUBSCRIPTION_UPDATED":
        case "PAYMENT_FAILED":
        case "PAYMENT_SUCCESS":
          onSubscriptionUpdate?.(data as SubscriptionEvent);
          break;
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }, [user, onTierChange, onFeatureAccessUpdate, onSubscriptionUpdate]);

  // Handle WebSocket connection open
  const handleOpen = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
    reconnectAttemptsRef.current = 0;
    onConnectionChange?.(true);
    
    console.log("WebSocket connected for tier updates");
  }, [onConnectionChange]);

  // Handle WebSocket connection close
  const handleClose = useCallback((event: CloseEvent) => {
    setIsConnected(false);
    onConnectionChange?.(false);
    
    console.log("WebSocket disconnected:", event.code, event.reason);

    // Attempt to reconnect if enabled and not a normal closure
    if (autoReconnect && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current += 1;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        connectRef.current?.();
      }, reconnectInterval * reconnectAttemptsRef.current);
    }
  }, [autoReconnect, reconnectInterval, onConnectionChange]);

  // Handle WebSocket errors
  const handleError = useCallback((event: Event) => {
    const errorMessage = "WebSocket connection error";
    setConnectionError(errorMessage);
    console.error("WebSocket error:", event);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id) {
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());
      
      ws.onopen = handleOpen;
      ws.onmessage = handleMessage;
      ws.onclose = handleClose;
      ws.onerror = handleError;
      
      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionError("Failed to establish connection");
    }
  }, [user?.id, getWebSocketUrl, handleOpen, handleMessage, handleClose, handleError]);

  // Keep connectRef in sync with connect function for use in handleClose
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Send a message (for testing or specific commands)
  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Subscribe to specific event types
  const subscribeToEvents = useCallback((eventTypes: string[]) => {
    sendMessage({
      type: "SUBSCRIBE",
      eventTypes,
      userId: user?.id,
    });
  }, [sendMessage, user?.id]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- connect establishes WebSocket connection
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Effect to subscribe to events when connected
  useEffect(() => {
    if (isConnected) {
      subscribeToEvents([
        "TIER_CHANGED",
        "TRIAL_STARTED", 
        "TRIAL_EXPIRED",
        "FEATURE_ACCESS_UPDATED",
        "SUBSCRIPTION_UPDATED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
      ]);
    }
  }, [isConnected, subscribeToEvents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Event data
    lastEvent,
    eventHistory,
    
    // Connection controls
    connect,
    disconnect,
    reconnect,
    sendMessage,
    subscribeToEvents,
    
    // Utilities
    getConnectionStatus: () => ({
      connected: isConnected,
      error: connectionError,
      reconnectAttempts: reconnectAttemptsRef.current,
      maxReconnectAttempts,
    }),
  };
}

// Hook for handling tier change animations and UI updates
export function useTierChangeAnimations() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<"upgrade" | "downgrade" | null>(null);
  const [previousTier, setPreviousTier] = useState<BusinessTier | null>(null);

  const animateTierChange = useCallback((
    fromTier: BusinessTier,
    toTier: BusinessTier,
    duration: number = 2000
  ) => {
    const tierLevels = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 1,
      [BusinessTier.MEDIUM]: 2,
      [BusinessTier.ENTERPRISE]: 3,
    };

    const isUpgrade = tierLevels[toTier] > tierLevels[fromTier];
    
    setIsAnimating(true);
    setAnimationType(isUpgrade ? "upgrade" : "downgrade");
    setPreviousTier(fromTier);

    // Reset animation state after duration
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationType(null);
      setPreviousTier(null);
    }, duration);
  }, []);

  return {
    isAnimating,
    animationType,
    previousTier,
    animateTierChange,
  };
}