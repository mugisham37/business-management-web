/**
 * Mock Prisma Types
 * This file provides type definitions for Prisma when the actual generated client is not available
 */

export namespace Prisma {
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
  export type JsonObject = { [Key in string]?: JsonValue };
  export type JsonArray = JsonValue[];
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | null;
  export type InputJsonObject = { [Key in string]?: InputJsonValue };
  export type InputJsonArray = InputJsonValue[];

  // Common Prisma types
  export type NullableJsonNullValueInput = 'JsonNull' | 'DbNull';
  export type JsonNullValueFilter = 'JsonNull' | 'DbNull' | 'AnyNull';

  // Utility types
  export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
        [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
      };

  type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

  type KeysOfUnion<T> = T extends T ? keyof T : never;

  // Base model types (extend as needed)
  export interface User {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Role {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Webhook {
    id: string;
    url: string;
    events: JsonValue;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}

// Export the main Prisma namespace as default
export default Prisma;
