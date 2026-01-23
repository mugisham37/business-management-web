/**
 * Communication Module - Messaging and Notifications
 * Requirements: 11.1, 11.2, 11.3
 */

import { lazy } from 'react';

export const CommunicationDashboard = lazy(() => 
  import('./components/CommunicationDashboard').then(module => ({
    default: module.CommunicationDashboard
  }))
);

export const MessagingCenter = lazy(() => 
  import('./components/MessagingCenter').then(module => ({
    default: module.MessagingCenter
  }))
);

export const NotificationSettings = lazy(() => 
  import('./components/NotificationSettings').then(module => ({
    default: module.NotificationSettings
  }))
);

// Export all communication hooks
export { useCommunication } from './hooks/useCommunication';
export { useNotifications } from './hooks/useNotifications';
export { useEmail } from './hooks/useEmail';
export { useSMS } from './hooks/useSMS';
export { useSlack } from './hooks/useSlack';
export { useTeams } from './hooks/useTeams';

// Re-export communication types for convenience
export * from '@/types/communication';

// Re-export communication utilities
export { CommunicationUtils } from '@/lib/utils/communication';

export const communicationModule = {
  name: 'Communication Center',
  version: '1.0.0',
  description: 'Internal and external communication management',
  components: { CommunicationDashboard, MessagingCenter, NotificationSettings },
  routes: ['/communication', '/communication/messages', '/communication/notifications'],
  permissions: ['communication:read', 'communication:write'],
  businessTier: 'SMALL',
  dependencies: ['tenant', 'auth'],
} as const;