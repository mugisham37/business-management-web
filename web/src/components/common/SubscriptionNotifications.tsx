'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/lib/subscriptions';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

interface SubscriptionNotificationsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxNotifications?: number;
  defaultDuration?: number;
  className?: string;
}

export function SubscriptionNotifications({
  position = 'top-right',
  maxNotifications = 5,
  defaultDuration = 5000,
  className = ''
}: SubscriptionNotificationsProps) {
  const { status, stats } = useSubscriptionStatus();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [previousStatus, setPreviousStatus] = useState(status);

  // Monitor status changes and create notifications
  useEffect(() => {
    if (status !== previousStatus) {
      let notification: Omit<Notification, 'id' | 'timestamp'> | null = null;

      switch (status) {
        case 'connected':
          if (previousStatus === 'reconnecting' || previousStatus === 'connecting') {
            notification = {
              type: 'success',
              title: 'Connected',
              message: 'Real-time connection established',
              autoHide: true,
              duration: 3000
            };
          }
          break;

        case 'connecting':
          notification = {
            type: 'info',
            title: 'Connecting',
            message: 'Establishing real-time connection...',
            autoHide: true,
            duration: 10000
          };
          break;

        case 'reconnecting':
          notification = {
            type: 'warning',
            title: 'Reconnecting',
            message: 'Attempting to restore real-time connection',
            autoHide: true,
            duration: 10000
          };
          break;

        case 'disconnected':
          if (previousStatus === 'connected') {
            notification = {
              type: 'warning',
              title: 'Disconnected',
              message: 'Real-time connection lost. Some features may be limited.',
              autoHide: false
            };
          }
          break;

        case 'error':
          notification = {
            type: 'error',
            title: 'Connection Error',
            message: 'Failed to establish real-time connection. Please check your internet connection.',
            autoHide: false
          };
          break;
      }

      if (notification) {
        addNotification(notification);
      }

      setPreviousStatus(status);
    }
  }, [status, previousStatus]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Auto-hide if specified
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || defaultDuration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <div className="space-y-2 w-80">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-lg shadow-lg p-4 ${getNotificationStyles(notification.type)} animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs opacity-75">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionNotifications;