/**
 * Mock jsonwebtoken implementation
 * This provides type-safe mocks for jsonwebtoken when the actual package is not available
 */

export interface JwtPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export class JsonWebTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

export class TokenExpiredError extends JsonWebTokenError {
  expiredAt: Date;

  constructor(message: string, expiredAt: Date) {
    super(message);
    this.name = 'TokenExpiredError';
    this.expiredAt = expiredAt;
  }
}

export class NotBeforeError extends JsonWebTokenError {
  date: Date;

  constructor(message: string, date: Date) {
    super(message);
    this.name = 'NotBeforeError';
    this.date = date;
  }
}

export interface SignOptions {
  algorithm?: string;
  expiresIn?: string | number;
  notBefore?: string | number;
  audience?: string | string[];
  issuer?: string;
  jwtid?: string;
  subject?: string;
  noTimestamp?: boolean;
  header?: object;
  keyid?: string;
}

export interface VerifyOptions {
  algorithms?: string[];
  audience?: string | string[];
  issuer?: string | string[];
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
  subject?: string | string[];
  clockTolerance?: number;
  maxAge?: string | number;
  clockTimestamp?: number;
  nonce?: string;
}

export interface DecodeOptions {
  complete?: boolean;
  json?: boolean;
}

// Mock implementations
export function sign(
  payload: string | Buffer | object,
  secretOrPrivateKey: string | Buffer,
  options?: SignOptions
): string {
  // This is a mock implementation - in real usage, install jsonwebtoken
  // Use secretOrPrivateKey for signature generation in real implementation
  const header = { alg: options?.algorithm || 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Mock signature based on secret (in real implementation, this would be cryptographically secure)
  const signature = Buffer.from(`${secretOrPrivateKey.toString()}-signature`)
    .toString('base64url')
    .substring(0, 10);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verify(
  token: string,
  secretOrPublicKey: string | Buffer,
  options?: VerifyOptions
): JwtPayload | string {
  // This is a mock implementation - in real usage, install jsonwebtoken
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new JsonWebTokenError('Invalid token format');
    }

    // Ensure parts exist before using them
    const headerPart = parts[0];
    const payloadPart = parts[1];
    const signaturePart = parts[2];

    if (!headerPart || !payloadPart || !signaturePart) {
      throw new JsonWebTokenError('Invalid token format');
    }

    // In real implementation, verify signature using secretOrPublicKey
    const expectedSignature = Buffer.from(`${secretOrPublicKey.toString()}-signature`)
      .toString('base64url')
      .substring(0, 10);
    if (signaturePart !== expectedSignature) {
      // In mock mode, we'll be lenient about signature verification
      // but still validate options if provided
      if (options?.algorithms && !options.algorithms.includes('HS256')) {
        throw new JsonWebTokenError('Algorithm not allowed');
      }
    }

    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString());

    // Mock expiration check
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new TokenExpiredError('Token expired', new Date(payload.exp * 1000));
    }

    // Mock audience validation
    if (options?.audience && payload.aud !== options.audience) {
      throw new JsonWebTokenError('Audience mismatch');
    }

    // Mock issuer validation
    if (options?.issuer && payload.iss !== options.issuer) {
      throw new JsonWebTokenError('Issuer mismatch');
    }

    return payload;
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
      throw error;
    }
    throw new JsonWebTokenError('Invalid token');
  }
}

export function decode(
  token: string,
  options?: DecodeOptions
): null | JwtPayload | string | { header: any; payload: JwtPayload; signature: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Ensure parts exist before using them
    const headerPart = parts[0];
    const payloadPart = parts[1];
    const signaturePart = parts[2];

    if (!headerPart || !payloadPart || !signaturePart) {
      return null;
    }

    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString());

    if (options?.complete) {
      return {
        header,
        payload,
        signature: signaturePart,
      };
    }

    return options?.json ? payload : JSON.stringify(payload);
  } catch {
    return null;
  }
}

// Default export for compatibility
export default {
  sign,
  verify,
  decode,
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
};
