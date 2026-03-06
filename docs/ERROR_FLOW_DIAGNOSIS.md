# Error Flow Diagnosis & Fix

## Problem Identified ✅

The server logs show clear error messages, but the web client doesn't receive them properly.

### Root Cause

**The `GraphQLExceptionFilter` is defined but NOT REGISTERED in the application.**

Current state:
- ✅ `GraphQLExceptionFilter` exists in `server/src/api/graphql/filters/graphql-exception.filter.ts`
- ✅ Filter has logic to transform Prisma errors to user-friendly messages
- ❌ Filter is NOT registered in `app.module.ts`
- ❌ Only `HttpExceptionFilter` is registered (doesn't handle GraphQL)
- ⚠️ GraphQL module uses `formatError` which is less powerful

### Current Flow (BROKEN)

```
Prisma Error
    ↓
Auth Service (logs error)
    ↓
Auth Resolver (logs error, re-throws)
    ↓
❌ GraphQLExceptionFilter (NOT CALLED - not registered!)
    ↓
formatError in GraphQL module (basic formatting only)
    ↓
Client receives: Generic error message
```

### Expected Flow (FIXED)

```
Prisma Error
    ↓
Auth Service (logs error)
    ↓
Auth Resolver (logs error, re-throws)
    ↓
✅ GraphQLExceptionFilter (CALLED - properly registered!)
    ↓
Transforms: "Unique constraint failed" → "Organization name already exists"
    ↓
Adds extensions: { code: "CONFLICT", technicalMessage: "..." }
    ↓
Client receives: User-friendly message + technical details
    ↓
Enhanced Toast shows: Clear message with expandable details
```

## The Fix

### Step 1: Register GraphQLExceptionFilter

Add to `server/src/app.module.ts`:

```typescript
import { GraphQLExceptionFilter } from './api/graphql/filters/graphql-exception.filter';

providers: [
  // ... existing providers
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
  {
    provide: APP_FILTER,  // ADD THIS
    useClass: GraphQLExceptionFilter,  // ADD THIS
  },
]
```

### Step 2: Ensure Prisma Errors are Properly Caught

The `GraphQLExceptionFilter` needs to handle `PrismaClientKnownRequestError`.

Current code already handles this in `enhanceUserFriendlyMessage()` method.

### Step 3: Test the Flow

1. Try registering with duplicate organization name
2. Server should log: "Unique constraint failed"
3. Filter should transform to: "A record with this name already exists"
4. Client should receive GraphQL error with:
   - message: "A record with this name already exists."
   - extensions.code: "CONFLICT"
   - extensions.technicalMessage: "Unique constraint failed..."

## Verification Steps

### 1. Check Server Logs

After fix, you should see:
```
[GraphQLExceptionFilter] Client Error in registerOwner: A record with this name already exists.
```

### 2. Check Network Tab (Browser DevTools)

GraphQL Response should contain:
```json
{
  "errors": [{
    "message": "A record with this name already exists.",
    "extensions": {
      "code": "CONFLICT",
      "technicalMessage": "Unique constraint failed on the fields: (`name`)",
      "timestamp": "2026-03-06T14:09:27.033Z"
    }
  }]
}
```

### 3. Check Web Console

Should see:
```
❌ GraphQL MUTATION: RegisterOwner - Failed (2843ms)
{
  errorCategory: 'BUSINESS_LOGIC',
  errorCode: 'CONFLICT',
  errorMessage: 'A record with this name already exists.'
}
```

### 4. Check Toast Notification

User should see:
```
🔴 Duplicate Entry
An organization with this name already exists.

Suggestions:
• Try using a different name
• Check if the organization already exists

▼ Technical Details
```

## Why This Happens

### NestJS Exception Filter Order

1. **HTTP Filters** (`HttpExceptionFilter`) - Handle REST API errors
2. **GraphQL Filters** (`GraphQLExceptionFilter`) - Handle GraphQL errors
3. Both need to be registered separately

### GraphQL vs HTTP

- HTTP errors: Caught by `HttpExceptionFilter`
- GraphQL errors: Need `GqlExceptionFilter` interface
- Our `GraphQLExceptionFilter` implements `GqlExceptionFilter`
- But it's not registered, so it never runs!

## Additional Improvements

### 1. Remove Redundant formatError

Once `GraphQLExceptionFilter` is registered, the `formatError` in `graphql.module.ts` becomes redundant. The filter handles everything better.

### 2. Add Prisma Error Detection

Enhance the filter to specifically detect Prisma errors:

```typescript
private isPrismaError(exception: any): boolean {
  return exception?.constructor?.name === 'PrismaClientKnownRequestError';
}
```

### 3. Extract Prisma Error Details

```typescript
private getPrismaErrorDetails(exception: any): {
  code: string;
  meta?: any;
} {
  return {
    code: exception.code, // P2002 for unique constraint
    meta: exception.meta, // { target: ['name'] }
  };
}
```

## Testing Checklist

After implementing the fix:

- [ ] Register with duplicate organization name
- [ ] See user-friendly message in toast
- [ ] Expand technical details
- [ ] Copy error details
- [ ] Verify correlation ID is present
- [ ] Check server logs show proper filtering
- [ ] Test other error types (validation, auth, network)
- [ ] Verify colors are correct (red for errors)
- [ ] Test on mobile device
- [ ] Test with screen reader

## Expected Results

### Before Fix
```
User sees: Generic error or nothing
Developer sees: Logs in terminal only
Support: Can't help without server access
```

### After Fix
```
User sees: "An organization with this name already exists"
           + Suggestions: "Try using a different name"
Developer sees: Full error details in expandable section
Support: User can copy full error JSON with correlation ID
```

## Summary

The issue is simple: **The GraphQL exception filter exists but isn't registered.**

Once registered, the entire error handling system will work as designed:
1. ✅ Server transforms technical errors to user-friendly messages
2. ✅ Client receives structured error with details
3. ✅ Enhanced toast displays clear message
4. ✅ Technical details available on expand
5. ✅ Copy functionality works
6. ✅ Correlation IDs for tracing

**Next Step:** Register the `GraphQLExceptionFilter` in `app.module.ts` and restart the server.
