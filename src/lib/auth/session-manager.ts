import { v4 as uuidv4 } from 'uuid';
import { tokenManager } from './token-manager';
import { permissionChecker } from './permission-checker';
import { config } from '@/lib/config/environment';

/**
 * Session Event Types
 * Events that can be broadcast across browser tabs
 */
export type SessionEventType = 
  | 'login' 
  | 'logout' 
  | 'token_refresh' 
  | 'permission_change';

/**
 * Session Event Structure
 * Broadcast to all tabs via Broadcast Channel API
 */
export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  timestamp: number;
  data?: any;
}

/**
 * Session Manager
 * 
 * Manages user sessions with multi-tab synchronization:
 * - Unique session ID per tab
 * - Broadcast Channel for cross-tab communication
 * - Session timeout with activity tracking
 * - Automatic logout on inactivity
 * - Event broadcasting (login, logout, token refresh, permission changes)
 * 
 * Requirements: 4.4
 */
class SessionManager {
  private sessionId: string;
  private broadcastChannel: BroadcastChannel | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

  constructor() {
    this.sessionId = uuidv4();
    this.initializeBroadcastChannel();
    this.startSessionTimeout();
  }

  /**
   * Initialize Broadcast Channel for multi-tab communication
   * Only available in browser environment
   * 
   * @private
   */
  private initializeBroadcastChannel(): void {
    // Check if running in browser and BroadcastChannel is supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('auth_channel');
      
      // Listen for events from other tabs
      this.broadcastChannel.onmessage = (event: MessageEvent<SessionEvent>) => {
        this.handleSessionEvent(event.data);
      };
    }
  }

  /**
   * Handle session events from other tabs
   * 
   * @param event - Session event received from another tab
   * @private
   */
  private handleSessionEvent(event: SessionEvent): void {
    // Ignore events from this tab
    if (event.sessionId === this.sessionId) return;

    switch (event.type) {
      case 'login':
        // Sync login state across tabs - reload to get fresh state
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        break;
      
      case 'logout':
        // Force logout in all tabs
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      
      case 'token_refresh':
        // Sync new tokens across tabs
        if (event.data?.accessToken) {
          tokenManager.setTokens(event.data.accessToken, event.data.refreshToken);
        }
        break;
      
      case 'permission_change':
        // Clear permission cache when permissions change
        permissionChecker.clearCache();
        break;
    }
  }

  /**
   * Broadcast an event to all other tabs
   * 
   * @param type - Type of session event
   * @param data - Optional data to include with the event
   */
  broadcastEvent(type: SessionEventType, data?: any): void {
    if (!this.broadcastChannel) return;

    const event: SessionEvent = {
      type,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data,
    };

    this.broadcastChannel.postMessage(event);
  }

  /**
   * Start session timeout tracking
   * Automatically logs out user after configured inactivity period
   * 
   * @private
   */
  private startSessionTimeout(): void {
    // Set initial timeout
    this.resetSessionTimeout();

    // Reset timeout on user activity
    if (typeof window !== 'undefined') {
      this.activityEvents.forEach(eventType => {
        window.addEventListener(eventType, () => this.resetSessionTimeout(), { passive: true });
      });
    }
  }

  /**
   * Reset session timeout
   * Called on user activity to prevent automatic logout
   */
  resetSessionTimeout(): void {
    // Clear existing timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Set new timeout
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, config.auth.sessionTimeout);
  }

  /**
   * Handle session timeout
   * Broadcasts logout event and redirects to login
   * 
   * @private
   */
  private handleSessionTimeout(): void {
    this.broadcastEvent('logout');
    tokenManager.clearTokens();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login?reason=timeout';
    }
  }

  /**
   * Get current session ID
   * 
   * @returns Unique session ID for this tab
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Destroy session manager
   * Cleans up broadcast channel and timers
   * Should be called when session manager is no longer needed
   */
  destroy(): void {
    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    // Clear session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    // Remove activity event listeners
    if (typeof window !== 'undefined') {
      this.activityEvents.forEach(eventType => {
        window.removeEventListener(eventType, () => this.resetSessionTimeout());
      });
    }
  }
}

/**
 * Singleton instance of SessionManager
 * Use this instance throughout the application
 */
export const sessionManager = new SessionManager();
