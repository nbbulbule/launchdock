import { Injectable } from '@angular/core';

// Define the structure for encrypted data
export interface EncryptedData {
  ciphertext: string; // The encrypted data (Base64 encoded)
  iv: string;         // Initialization Vector (Base64 encoded)
  salt: string;       // Salt used for key derivation (Base64 encoded)
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();

  constructor() { }

  /**
   * Derives a cryptographic key from a password using PBKDF2.
   * @param password The user's master password.
   * @param salt A unique salt for key derivation (should be stored with encrypted data).
   * @returns A CryptoKey suitable for AES-GCM.
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = this.textEncoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false, // not extractable
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 }, // AES-256 GCM key
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using AES-GCM.
   * @param data The string data to encrypt.
   * @param password The master password.
   * @returns An EncryptedData object containing ciphertext, IV, and salt.
   */
  async encrypt(data: string, password: string): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16-byte salt
    const iv = crypto.getRandomValues(new Uint8Array(12));   // 12-byte IV for AES-GCM

    const key = await this.deriveKey(password, salt);
    const encoded = this.textEncoder.encode(data);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoded
    );

    // Convert ArrayBuffers to Base64 strings for storage
    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt))
    };
  }

  /**
   * Decrypts data using AES-GCM.
   * @param encryptedData The EncryptedData object to decrypt.
   * @param password The master password.
   * @returns The decrypted string data.
   * @throws Error if decryption fails (e.g., wrong password, corrupted data).
   */
  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      // Convert Base64 strings back to Uint8Arrays
      const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0));

      const key = await this.deriveKey(password, salt);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        ciphertext
      );

      return this.textDecoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
  }
}
