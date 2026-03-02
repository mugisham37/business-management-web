# Apollo Client Configuration

This directory contains the complete Apollo Client setup for the foundation layer.

## Files

### `apollo-links.ts`
Implements the Apollo Client link chain with the following components:

1. **HttpLink** - GraphQL HTTP requests to backend (port 3001)
2. **WebSocket Link** - Real-time subscriptions via WSS
3. **Split Link** - Routes operations to appropriate transport
4. **Auth Link** - Injects Bearer token and correlation ID
5. **Error Link** - Handles errors and authentication failures
6. **Retry Link** - Exponential backoff retry logic

**Link Chain Order:**
```
RetryLink → ErrorLink → AuthLink → SplitLink → [HttpLink | WsLink]
```

### `apollo-client.ts`
Main Apollo Client instance configured with:
- Complete link chain
- Normalized InMemoryCache
- Default fetch policies
- Request deduplication

## Usage

```typescript
import { apolloClient } from '@/lib/api/apollo-client';

// Direct query
const result = await apolloClient.query({
  query: GET_USERS,
  variables: { organizationId: '123' },
});

// Direct mutation
const result = await apolloClient.mutate({
  mutation: CREATE_USER,
  variables: { input: { ... } },
});

// Cache operations
apolloClient.cache.readQuery({ query: GET_USERS });
apolloClient.refetchQueries({ include: ['GetUsers'] });
```

## Features

- ✅ Automatic token injection in all requests
- ✅ Correlation ID tracking for distributed tracing
- ✅ Token refresh on authentication errors
- ✅ Exponential backoff retry (300ms → 600ms → 1200ms)
- ✅ WebSocket subscriptions with auto-reconnect
- ✅ Normalized caching with type policies
- ✅ Request deduplication
- ✅ Error logging with context

## Configuration

Environment variables (see `.env.local`):
- `NEXT_PUBLIC_GRAPHQL_URL` - GraphQL HTTP endpoint
- `NEXT_PUBLIC_GRAPHQL_WS_URL` - GraphQL WebSocket endpoint
- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD` - Token refresh timing
- `NEXT_PUBLIC_MAX_RETRY_ATTEMPTS` - Max retry attempts

## Requirements Satisfied

- ✅ 2.1 - Apollo Client Configuration
- ✅ 6.1 - Centralized Error Handling
- ✅ 6.3 - Retry Logic & Circuit Breaker
- ✅ 8.3 - Request Tracing
