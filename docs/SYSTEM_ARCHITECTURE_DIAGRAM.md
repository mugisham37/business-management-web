# Error Flow Architecture: Server → Client

## Current Problem

**Server Terminal (Clear):**
```
❌ Registration failed for: mugisham505@gmail.com
Unique constraint failed on the fields: (`name`)
```

**Web Client (User sees nothing useful):**
```
Generic error or no message
```

## Root Cause Analysis

### The Error Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DATABASE (Postgres)                                          │
│    Error: Unique constraint failed on (`name`)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PRISMA CLIENT                                                │
│    Throws: PrismaClientKnownRequestError                        │
│    Message: "Unique constraint failed on the fields: (`name`)"  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. AUTH SERVICE (auth.service.ts:124)                           │
│    Catches: Prisma error                                        │
│    Logs: ❌ Registration failed                                 │
│    Throws: Error bubbles up                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AUTH RESOLVER (auth.resolver.ts:78)                          │
│    Catches: Error from service                                  │
│    Logs: Error details                                          │
│    Throws: Error bubbles up                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. GRAPHQL EXCEPTION FILTER ⚠️ CRITICAL POINT                   │
│    Catches: All GraphQL errors                                  │
│    Transforms: Technical → User-friendly                        │
│    Returns: GraphQLError with extensions                        │
│                                                                 │
│    ✅ ENHANCED (Our new code):                                  │
│       message: "A record with this name already exists."        │
│       extensions: {                                             │
│         code: "CONFLICT",                                       │
│         technicalMessage: "Unique constraint failed...",        │
│         timestamp: "2026-03-06T14:09:27.033Z"                   │
│       }                                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ (HTTP/GraphQL Response)
┌─────────────────────────────────────────────────────────────────┐
│ 6. APOLLO CLIENT (Web)                                          │
│    Receives: GraphQL response with errors array                 │
│    {                                                            │
│      errors: [{                                                 │
│        message: "A record with this name already exists.",      │
│        extensions: {                                            │
│          code: "CONFLICT",                                      │
│          technicalMessage: "Unique constraint failed..."        │
│        }                                                        │
│      }]                                                         │
│    }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. ENHANCED APOLLO LOGGING LINK ⚠️ CRITICAL POINT               │
│    Intercepts: All GraphQL operations                           │
│    Processes: Error response                                    │
│    Builds: Structured error with user-friendly message          │
│    Shows: Enhanced toast notification                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. ENHANCED TOAST (User sees)                                   │
│    🔴 Duplicate Entry                                           │
│    An organization with this name already exists.               │
│                                                                 │
│    Suggestions:                                                 │
│    • Try using a different name                                 │
│    • Check if the organization already exists                   │
└─────────────────────────────────────────────────────────────────┘
```

## The Problem: Missing Link

The issue is that the **GraphQL Exception Filter** needs to properly catch and transform the Prisma error, but it might not be catching it correctly.

Let me check the actual error handling in the resolver...
