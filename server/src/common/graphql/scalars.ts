import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/**
 * Custom DateTime scalar for GraphQL
 * Handles Date objects and ISO string serialization
 */
@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type - ISO-8601 formatted date-time string';

  parseValue(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime format');
      }
      return date;
    }
    throw new Error('DateTime scalar can only parse string or number values');
  }

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime format');
      }
      return date.toISOString();
    }
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    throw new Error('DateTime scalar can only serialize Date, string, or number values');
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime format');
      }
      return date;
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    throw new Error('DateTime scalar can only parse string or integer values');
  }
}

/**
 * Custom UUID scalar for GraphQL
 */
@Scalar('UUID', () => String)
export class UUIDScalar implements CustomScalar<string, string> {
  description = 'UUID custom scalar type';

  parseValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return value as unknown as string;
    }
    const stringValue = value as string;
    if (!this.isValidUUID(stringValue)) {
      throw new Error('Invalid UUID format');
    }
    return stringValue;
  }

  serialize(value: unknown): string {
    // Handle null, undefined, and empty string
    if (value === null || value === undefined || value === '') {
      return value as unknown as string;
    }
    const stringValue = value as string;
    // If it's not a valid UUID, just return the string as-is
    // This prevents breaking schema generation for default values
    // Runtime validation will still catch invalid UUIDs in parseValue
    if (typeof stringValue === 'string') {
      return stringValue;
    }
    throw new Error('UUID scalar can only serialize string values');
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.NULL) {
      return null as unknown as string;
    }
    if (ast.kind === Kind.STRING) {
      if (ast.value === '') {
        return '';
      }
      if (!this.isValidUUID(ast.value)) {
        throw new Error('Invalid UUID format');
      }
      return ast.value;
    }
    throw new Error('UUID scalar can only parse string values');
  }

  private isValidUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}

/**
 * Custom Decimal scalar for GraphQL (for monetary values)
 */
@Scalar('Decimal', () => Number)
export class DecimalScalar implements CustomScalar<string, number> {
  description = 'Decimal custom scalar type for monetary values';

  parseValue(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value as string);
    if (isNaN(parsed)) {
      throw new Error('Invalid decimal format');
    }
    return parsed;
  }

  serialize(value: unknown): string {
    return (value as number).toFixed(2); // Always return 2 decimal places for monetary values
  }

  parseLiteral(ast: ValueNode): number {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return parseFloat(ast.value);
    }
    if (ast.kind === Kind.STRING) {
      const parsed = parseFloat(ast.value);
      if (isNaN(parsed)) {
        throw new Error('Invalid decimal format');
      }
      return parsed;
    }
    throw new Error('Decimal scalar can only parse numeric values');
  }
}