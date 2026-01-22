/**
 * Hot Reload Enhancer
 * Enhances Next.js hot reloading with better error handling and state preservation
 * Requirements: 10.1
 */

interface HotReloadConfig {
  preserveState: boolean;
  errorRecovery: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

class HotReloadEnhancer {
  private config: HotReloadConfig;
  private errorCount = 0;
  private lastError: Error | null = null;

  constructor(config: Partial<HotReloadConfig> = {}) {
    this.config = {
      preserveState: true,
      errorRecovery: true,
      logLevel: 'info',
      ...config,
    };

    if (process.env.NODE_ENV === 'development') {
      this.initialize();
    }
  }

  private initialize(): void {
    // Enhanced error boundary for hot reload errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
      
      // Listen for Next.js hot reload events
      if (module.hot) {
        module.hot.addStatusHandler(this.handleHotReloadStatus.bind(this));
      }
    }
  }

  private handleError(event: ErrorEvent): void {
    this.errorCount++;
    this.lastError = event.error;
    
    if (this.config.errorRecovery && this.errorCount < 5) {
      this.log('warn', `Hot reload error recovered (${this.errorCount}/5):`, event.error);
      
      // Attempt to recover by reloading the page
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    } else {
      this.log('error', 'Hot reload error recovery failed:', event.error);
    }
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.log('error', 'Unhandled promise rejection during hot reload:', event.reason);
  }

  private handleHotReloadStatus(status: string): void {
    switch (status) {
      case 'idle':
        this.errorCount = 0; // Reset error count on successful reload
        this.log('debug', 'Hot reload: idle');
        break;
      case 'check':
        this.log('debug', 'Hot reload: checking for updates');
        break;
      case 'prepare':
        this.log('debug', 'Hot reload: preparing update');
        break;
      case 'ready':
        this.log('info', 'Hot reload: update ready');
        break;
      case 'dispose':
        this.log('debug', 'Hot reload: disposing modules');
        break;
      case 'apply':
        this.log('info', 'Hot reload: applying update');
        break;
      case 'abort':
        this.log('warn', 'Hot reload: update aborted');
        break;
      case 'fail':
        this.log('error', 'Hot reload: update failed');
        break;
    }
  }

  private log(level: string, message: string, ...args: any[]): void {
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    if (messageLevel <= configLevel) {
      console[level as keyof Console](`[HotReload] ${message}`, ...args);
    }
  }

  public getStatus(): { errorCount: number; lastError: Error | null } {
    return {
      errorCount: this.errorCount,
      lastError: this.lastError,
    };
  }
}

// Create singleton instance
export const hotReloadEnhancer = new HotReloadEnhancer();

// Development-only hot reload status component
export function HotReloadStatus() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const status = hotReloadEnhancer.getStatus();

  if (status.errorCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded shadow-lg z-50">
      <div className="text-sm font-semibold">Hot Reload Errors: {status.errorCount}</div>
      {status.lastError && (
        <div className="text-xs mt-1 opacity-90">
          {status.lastError.message}
        </div>
      )}
    </div>
  );
}