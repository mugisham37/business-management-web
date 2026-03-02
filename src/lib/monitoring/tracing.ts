/**
 * Request Tracing System
 * 
 * Provides distributed tracing capabilities for tracking requests
 * across the application. Each span represents a unit of work with
 * timing information and contextual attributes.
 * 
 * Requirements: 8.3
 */

import { v4 as uuidv4 } from 'uuid';

interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  correlationId: string;
  attributes?: Record<string, any>;
}

class RequestTracer {
  private spans: Map<string, TraceSpan> = new Map();
  private readonly maxSpans = 1000;

  /**
   * Start a new trace span
   * @param name - Name of the operation being traced
   * @param correlationId - Correlation ID for the request
   * @param parentId - Optional parent span ID for nested operations
   * @returns The span ID for use in endSpan()
   */
  startSpan(name: string, correlationId: string, parentId?: string): string {
    const spanId = uuidv4();
    const span: TraceSpan = {
      id: spanId,
      parentId,
      name,
      startTime: performance.now(),
      correlationId,
    };

    this.spans.set(spanId, span);

    // Clean up old spans if we exceed the limit
    if (this.spans.size > this.maxSpans) {
      const oldestSpanId = this.spans.keys().next().value;
      if (oldestSpanId) {
        this.spans.delete(oldestSpanId);
      }
    }

    return spanId;
  }

  /**
   * End a trace span and record its duration
   * @param spanId - The span ID returned from startSpan()
   * @param attributes - Optional attributes to attach to the span
   */
  endSpan(spanId: string, attributes?: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (!span) {
      console.warn(`[Trace] Span not found: ${spanId}`);
      return;
    }

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.attributes = attributes;

    // Log completed span in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Trace]', {
        name: span.name,
        duration: `${span.duration.toFixed(2)}ms`,
        correlationId: span.correlationId,
        attributes: span.attributes,
      });
    }

    // Send to tracing service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with tracing service (e.g., Jaeger, Zipkin, OpenTelemetry)
      // this.sendToTracingService(span);
    }
  }

  /**
   * Get a specific span by ID
   * @param spanId - The span ID
   * @returns The trace span or undefined if not found
   */
  getSpan(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId);
  }

  /**
   * Get all spans associated with a correlation ID
   * @param correlationId - The correlation ID to filter by
   * @returns Array of trace spans matching the correlation ID
   */
  getSpansByCorrelationId(correlationId: string): TraceSpan[] {
    return Array.from(this.spans.values()).filter(
      (span) => span.correlationId === correlationId
    );
  }

  /**
   * Get all recorded spans
   * @returns Array of all trace spans
   */
  getAllSpans(): TraceSpan[] {
    return Array.from(this.spans.values());
  }

  /**
   * Clear all recorded spans
   */
  clearSpans(): void {
    this.spans.clear();
  }

  /**
   * Get the total number of recorded spans
   * @returns Number of spans
   */
  getSpanCount(): number {
    return this.spans.size;
  }
}

export const requestTracer = new RequestTracer();

/**
 * Helper function for tracing async operations
 * Automatically starts a span, executes the function, and ends the span
 * with success/error information.
 * 
 * @param name - Name of the operation being traced
 * @param correlationId - Correlation ID for the request
 * @param fn - The async function to trace
 * @returns The result of the async function
 * @throws Re-throws any error from the async function after recording it
 * 
 * @example
 * const result = await traceAsync('fetchUser', correlationId, async () => {
 *   return await userService.getUser(userId);
 * });
 */
export async function traceAsync<T>(
  name: string,
  correlationId: string,
  fn: () => Promise<T>
): Promise<T> {
  const spanId = requestTracer.startSpan(name, correlationId);
  try {
    const result = await fn();
    requestTracer.endSpan(spanId, { success: true });
    return result;
  } catch (error) {
    requestTracer.endSpan(spanId, {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export type { TraceSpan };
