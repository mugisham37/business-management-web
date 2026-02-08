import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SecurityService {
  // Argon2id configuration parameters
  private readonly argon2Config = {
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 parallel threads
  };

  // Encryption configuration
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor() {
    // Initialize encryption key from environment or generate one
    const keyString = process.env.ENCRYPTION_KEY;
    if (keyString) {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } else {
      // Generate a key for development (should be from env in production)
      this.encryptionKey = randomBytes(32);
      console.warn('WARNING: Using generated encryption key. Set ENCRYPTION_KEY in production.');
    }
  }

  /**
   * Hash a password using Argon2id
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, this.argon2Config);
  }

  /**
   * Verify a password against a hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches hash
   */
  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password, this.argon2Config);
    } catch (error) {
      // Invalid hash format or verification error
      return false;
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Validation result with details
   */
  validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param data - Plain text data
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(data: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData - Encrypted data with IV and auth tag
   * @returns Decrypted plain text data
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate a random token
   * @param length - Token length in bytes (default: 32)
   * @returns Hex-encoded random token
   */
  generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure token using UUID v4
   * @returns UUID v4 token
   */
  generateSecureToken(): string {
    return uuidv4();
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}
