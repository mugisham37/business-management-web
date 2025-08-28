/**
 * Mock argon2 implementation
 * This provides type-safe mocks for argon2 when the actual package is not available
 */

export enum argon2d {
  argon2d = 0,
}

export enum argon2i {
  argon2i = 1,
}

export enum argon2id {
  argon2id = 2,
}

export interface Options {
  type?: argon2d | argon2i | argon2id;
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
  hashLength?: number;
  saltLength?: number;
  salt?: Buffer;
  secret?: Buffer;
  ad?: Buffer;
  raw?: boolean;
}

// Mock implementations
export async function hash(plain: string | Buffer, options?: Options): Promise<string> {
  // This is a mock implementation - in real usage, install argon2
  // For development/testing purposes only

  // Use the provided options to create a more realistic mock
  const type = options?.type ?? argon2id.argon2id;
  const memoryCost = options?.memoryCost ?? 65536;
  const timeCost = options?.timeCost ?? 3;
  const parallelism = options?.parallelism ?? 1;

  // Create a deterministic hash based on input for testing consistency
  const plainStr = typeof plain === 'string' ? plain : plain.toString();
  const mockSalt = Buffer.from('mocksalt123456').toString('base64url');
  const mockHash = Buffer.from(
    `${plainStr}-${type}-${memoryCost}-${timeCost}-${parallelism}`
  ).toString('base64url');

  return `$argon2id$v=19$m=${memoryCost},t=${timeCost},p=${parallelism}$${mockSalt}$${mockHash}`;
}

export async function verify(encoded: string, plain: string | Buffer): Promise<boolean> {
  // This is a mock implementation - in real usage, install argon2
  // For development/testing purposes, validate format and do basic checks
  if (!encoded || !plain) {
    return false;
  }

  // Basic format validation
  const parts = encoded.split('$');
  if (parts.length < 6) {
    return false;
  }

  // Extract parameters from the encoded hash
  const algorithm = parts[1]; // Should be 'argon2id'
  const version = parts[2]; // Should be 'v=19'
  const params = parts[3]; // Should be 'm=65536,t=3,p=1'
  const salt = parts[4]; // Salt
  const hash = parts[5]; // Hash

  if (!algorithm || !version || !params || !salt || !hash) {
    return false;
  }

  // In a real implementation, this would actually verify the hash
  // For mock purposes, we'll recreate the hash and compare
  try {
    // Parse parameters
    const paramPairs = params.split(',');
    let memoryCost = 65536;
    let timeCost = 3;
    let parallelism = 1;

    for (const pair of paramPairs) {
      const [key, value] = pair.split('=');
      if (key === 'm' && value) memoryCost = parseInt(value, 10);
      if (key === 't' && value) timeCost = parseInt(value, 10);
      if (key === 'p' && value) parallelism = parseInt(value, 10);
    }

    // Recreate the expected hash
    const plainStr = typeof plain === 'string' ? plain : plain.toString();
    const expectedHash = Buffer.from(
      `${plainStr}-${argon2id.argon2id}-${memoryCost}-${timeCost}-${parallelism}`
    ).toString('base64url');

    return hash === expectedHash;
  } catch {
    return false;
  }
}

export function needsRehash(encoded: string, options?: Options): boolean {
  // This is a mock implementation - in real usage, install argon2
  if (!encoded) {
    return true;
  }

  // Mock logic: check if the hash uses the expected parameters
  const targetMemoryCost = options?.memoryCost ?? 65536;
  const targetTimeCost = options?.timeCost ?? 3;
  const targetParallelism = options?.parallelism ?? 1;

  // Parse the encoded hash to check parameters
  const parts = encoded.split('$');
  if (parts.length < 4) {
    return true;
  }

  const params = parts[3];
  if (!params) {
    return true;
  }

  // Check if current parameters match target parameters
  const paramPairs = params.split(',');
  let currentMemoryCost = 0;
  let currentTimeCost = 0;
  let currentParallelism = 0;

  for (const pair of paramPairs) {
    const [key, value] = pair.split('=');
    if (key === 'm' && value) currentMemoryCost = parseInt(value, 10);
    if (key === 't' && value) currentTimeCost = parseInt(value, 10);
    if (key === 'p' && value) currentParallelism = parseInt(value, 10);
  }

  return (
    currentMemoryCost !== targetMemoryCost ||
    currentTimeCost !== targetTimeCost ||
    currentParallelism !== targetParallelism ||
    !encoded.includes('argon2id')
  );
}

// Default export for compatibility
export default {
  hash,
  verify,
  needsRehash,
  argon2d,
  argon2i,
  argon2id,
};
