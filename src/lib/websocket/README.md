# WebSocket Connection Manager

The WebSocket Connection Manager provides a robust, production-ready solution for managing WebSocket connections in the Next.js application.

## Features

- Automatic connection management with lifecycle control
- Token injection for authentication
- Correlation ID tracking for request tracing
- Exponential backoff reconnection (1s, 2s, 4s, ..., max 30s)
- Heartbeat mechanism (30-second intervals)
- State tracking (connecting, connected, disconnected, reconnecting)
- Event listeners for state changes
- Graceful shutdown and resource cleanup

## Quick Start

```typescript
import { wsConnectionManager } from '@/lib/websocket';

// Connect
wsConnectionManager.connect();

// Check state
if (wsConnectionManager.isConnected()) {
  console.log('Connected!');
}

// Listen to state changes
const unsubscribe = wsConnectionManager.onStateChange((state) => {
  console.log('State:', state);
});

// Disconnect
wsConnectionManager.disconnect();
```

## React Hook

```typescript
import { useWebSocketConnection } from '@/lib/websocket';

function MyComponent() {
  const { state, isConnected } = useWebSocketConnection();
  
  return <div>Status: {state}</div>;
}
```

## Documentation

See `IMPLEMENTATION_SUMMARY.md` for complete documentation, API reference, and usage examples.

