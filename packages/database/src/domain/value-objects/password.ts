import * as crypto from 'crypto';
import { z } from 'zod';

// Password validation schema
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  );

export type Password = z.infer<typeof PasswordSchema>;

// Password strength enum
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

// Password value object class
export class PasswordVO {
  private readonly _plaintext: string;
  private _hash?: string;

  constructor(password: string) {
    const result = PasswordSchema.safeParse(password);
    if (!result.success) {
      throw new Error(`Invalid password: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    this._plaintext = result.data;
  }

  get plaintext(): string {
    return this._plaintext;
  }

  get hash(): string {
    if (!this._hash) {
      this._hash = this.hashPassword(this._plaintext);
    }
    return this._hash;
  }

  get strength(): PasswordStrength {
    return this.calculateStrength(this._plaintext);
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private calculateStrength(password: string): PasswordStrength {
    let score = 0;

    // Length bonus
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    // Additional complexity
    if (/[^A-Za-z\d@$!%*?&]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;

    if (score <= 3) return PasswordStrength.WEAK;
    if (score <= 5) return PasswordStrength.MEDIUM;
    if (score <= 7) return PasswordStrength.STRONG;
    return PasswordStrength.VERY_STRONG;
  }

  verify(hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(this._plaintext, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  }

  equals(other: PasswordVO): boolean {
    return this._plaintext === other._plaintext;
  }

  static create(password: string): PasswordVO {
    return new PasswordVO(password);
  }

  static isValid(password: string): boolean {
    return PasswordSchema.safeParse(password).success;
  }

  static verifyHash(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch {
      return false;
    }
  }
}
