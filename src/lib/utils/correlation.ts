import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

class CorrelationIdManager {
  private currentId: string | null = null;

  generate(): string {
    this.currentId = uuidv4();
    return this.currentId;
  }

  getCurrent(): string | null {
    return this.currentId;
  }

  clear(): void {
    this.currentId = null;
  }
}

export const correlationIdManager = new CorrelationIdManager();

export function generateCorrelationId(): string {
  return correlationIdManager.generate();
}

export function getCurrentCorrelationId(): string | null {
  return correlationIdManager.getCurrent();
}

// React hook for correlation ID
export function useCorrelationId(): string {
  const [correlationId] = useState(() => generateCorrelationId());
  return correlationId;
}
