/**
 * SecureStorage - Encrypted storage utility using Web Crypto API
 * 
 * Provides secure storage for sensitive data with encryption/decryption.
 * Uses AES-GCM encryption with a derived key from a password.
 * 
 * Requirements: 8.4 - Encrypt sensitive data before storing in persistent storage
 */

/**
 * SecureStorage interface for encrypted data storage
 */
export interface SecureStorage {
  /**
   * Store encrypted data
   * @param key - Storage key
   * @param value - Value to encrypt and store
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Retrieve and decrypt data
   * @param key - Storage key
   * @returns Decrypted value or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Remove data from storage
   * @param key - Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;
}

/**
 * Configuration for SecureStorage
 */
export interface SecureStorageConfig {
  /**
   * Storage backend (localStorage or sessionStorage)
   */
  storage?: Storage;

  /**
   * Encryption password/key
   * In production, this should come from a secure source
   */
  encryptionKey?: string;
}

/**
 * Encrypted data structure stored in storage
 */
interface EncryptedData {
  iv: string; // Initialization vector (base64)
  salt: string; // Salt for key derivation (base64)
  data: string; // Encrypted data (base64)
}

/**
 * SecureStorage implementation using Web Crypto API
 */
export class SecureStorageImpl implements SecureStorage {
  private storage: Storage;
  private encryptionKey: string;

  constructor(config: SecureStorageConfig = {}) {
    // Use localStorage by default (can be configured to use sessionStorage)
    this.storage = config.storage || (typeof window !== 'undefined' ? window.localStorage : ({} as Storage));
    
    // Use provided encryption key or generate a default one
    // In production, this should come from environment variables or secure key management
    this.encryptionKey = config.encryptionKey || this.getDefaultEncryptionKey();
  }

  /**
   * Get default encryption key
   * In production, this should be replaced with a secure key from environment
   */
  private getDefaultEncryptionKey(): string {
    // This is a fallback - in production, use a secure key from environment
    return process.env.NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  /**
   * Derive a cryptographic key from the encryption password
   */
  private async deriveKey(salt: BufferSource): Promise<CryptoKey> {
    // Convert password to key material
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.encryptionKey),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(plaintext: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive encryption key
    const key = await this.deriveKey(salt);
    
    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoder.encode(plaintext)
    );

    // Convert to base64 for storage
    return {
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt),
      data: this.arrayBufferToBase64(encryptedData),
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: EncryptedData): Promise<string> {
    const decoder = new TextDecoder();
    
    // Convert from base64
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const salt = this.base64ToArrayBuffer(encryptedData.salt);
    const data = this.base64ToArrayBuffer(encryptedData.data);
    
    // Derive decryption key
    const key = await this.deriveKey(new Uint8Array(salt));
    
    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv),
      },
      key,
      data
    );

    return decoder.decode(decryptedData);
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Store encrypted data
   */
  async set(key: string, value: string): Promise<void> {
    try {
      const encryptedData = await this.encrypt(value);
      this.storage.setItem(key, JSON.stringify(encryptedData));
    } catch (error) {
      console.error('SecureStorage: Failed to encrypt and store data', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async get(key: string): Promise<string | null> {
    try {
      const storedData = this.storage.getItem(key);
      
      if (!storedData) {
        return null;
      }

      const encryptedData: EncryptedData = JSON.parse(storedData);
      return await this.decrypt(encryptedData);
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve and decrypt data', error);
      return null;
    }
  }

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('SecureStorage: Failed to remove data', error);
      throw new Error('Failed to remove data');
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('SecureStorage: Failed to clear storage', error);
      throw new Error('Failed to clear storage');
    }
  }
}

/**
 * Create a SecureStorage instance
 */
export function createSecureStorage(config?: SecureStorageConfig): SecureStorage {
  return new SecureStorageImpl(config);
}

/**
 * Default SecureStorage instance using localStorage
 */
export const secureStorage = typeof window !== 'undefined' 
  ? createSecureStorage() 
  : null;
