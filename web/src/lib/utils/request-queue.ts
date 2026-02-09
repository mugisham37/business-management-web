/**
 * Request Queue Manager
 * 
 * Manages request queuing, prioritization, and concurrency control.
 * 
 * Features:
 * - Request prioritization (high, normal, low)
 * - Concurrency limiting
 * - Request cancellation
 * - Queue statistics
 * 
 * Requirements: Advanced request management
 */

export type RequestPriority = 'high' | 'normal' | 'low';

export interface QueuedRequest<T = any> {
  id: string;
  priority: RequestPriority;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  abortController?: AbortController;
}

export interface QueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

/**
 * Request Queue Manager
 * 
 * Manages a queue of requests with priority and concurrency control.
 * 
 * @example
 * ```tsx
 * const queue = new RequestQueue({ maxConcurrent: 3 });
 * 
 * // Add high priority request
 * const result = await queue.add(
 *   () => api.fetchCriticalData(),
 *   { priority: 'high' }
 * );
 * 
 * // Add normal priority request
 * const data = await queue.add(() => api.fetchData());
 * 
 * // Get queue statistics
 * const stats = queue.getStats();
 * ```
 */
export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running: Set<string> = new Set();
  private maxConcurrent: number;
  private stats: QueueStats = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };

  constructor(options: { maxConcurrent?: number } = {}) {
    this.maxConcurrent = options.maxConcurrent || 6;
  }

  /**
   * Add a request to the queue
   * 
   * @param execute - Function that executes the request
   * @param options - Request options (priority, abortable)
   * @returns Promise that resolves with the request result
   */
  add<T>(
    execute: () => Promise<T>,
    options: { priority?: RequestPriority; abortable?: boolean } = {}
  ): Promise<T> {
    const { priority = 'normal', abortable = false } = options;

    return new Promise<T>((resolve, reject) => {
      const id = this.generateId();
      const abortController = abortable ? new AbortController() : undefined;

      const request: QueuedRequest<T> = {
        id,
        priority,
        execute,
        resolve,
        reject,
        abortController,
      };

      // Add to queue based on priority
      this.enqueue(request);
      this.stats.pending++;

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Cancel a specific request
   * 
   * @param id - Request ID
   * @returns true if request was cancelled, false if not found
   */
  cancel(id: string): boolean {
    const index = this.queue.findIndex((req) => req.id === id);
    
    if (index !== -1) {
      const request = this.queue[index];
      
      // Abort if abortable
      if (request.abortController) {
        request.abortController.abort();
      }
      
      // Remove from queue
      this.queue.splice(index, 1);
      this.stats.pending--;
      
      // Reject the promise
      request.reject(new Error('Request cancelled'));
      
      return true;
    }
    
    return false;
  }

  /**
   * Cancel all pending requests
   * 
   * @returns Number of requests cancelled
   */
  cancelAll(): number {
    const count = this.queue.length;
    
    this.queue.forEach((request) => {
      if (request.abortController) {
        request.abortController.abort();
      }
      request.reject(new Error('Request cancelled'));
    });
    
    this.queue = [];
    this.stats.pending = 0;
    
    return count;
  }

  /**
   * Get queue statistics
   * 
   * @returns Current queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Clear completed/failed statistics
   */
  resetStats(): void {
    this.stats.completed = 0;
    this.stats.failed = 0;
  }

  /**
   * Enqueue request based on priority
   */
  private enqueue(request: QueuedRequest): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    
    // Find insertion point based on priority
    let insertIndex = this.queue.length;
    
    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[request.priority] < priorityOrder[this.queue[i].priority]) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, request);
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    // Check if we can process more requests
    while (this.running.size < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift();
      
      if (!request) break;
      
      this.stats.pending--;
      this.stats.running++;
      this.running.add(request.id);
      
      // Execute request
      this.executeRequest(request);
    }
  }

  /**
   * Execute a single request
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const result = await request.execute();
      request.resolve(result);
      this.stats.completed++;
    } catch (error) {
      request.reject(error);
      this.stats.failed++;
    } finally {
      this.running.delete(request.id);
      this.stats.running--;
      
      // Process next request
      this.processQueue();
    }
  }

  /**
   * Generate unique request ID
   */
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const requestQueue = new RequestQueue({ maxConcurrent: 6 });
