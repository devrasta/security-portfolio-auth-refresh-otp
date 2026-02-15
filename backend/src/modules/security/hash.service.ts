import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'node:crypto';

@Injectable()
export class HashService {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verifyPassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }

  // ════════════════════════════════════════════════════════
  // TOKEN HASHING (SHA-256 - pour tokens/sessions)
  // ════════════════════════════════════════════════════════

  /**
   * Hash un token avec SHA-256
   * Utilisé pour refresh tokens, session tokens, etc.
   * Plus rapide qu'Argon2 car pas besoin de résistance au brute-force
   * @param token - Le token à hasher
   * @returns Hash SHA-256 hexadécimal (64 caractères)
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Compare deux tokens de manière sécurisée (timing-safe)
   * Évite les attaques par timing attack
   * @param token1 - Premier token
   * @param token2 - Deuxième token
   * @returns true si identiques
   */
  compareTokens(token1: string, token2: string): boolean {
    const hash1 = this.hashToken(token1);
    const hash2 = this.hashToken(token2);

    return crypto.timingSafeEqual(Buffer.from(hash1), Buffer.from(hash2));
  }

  // ════════════════════════════════════════════════════════
  // ID & TOKEN GENERATION
  // ════════════════════════════════════════════════════════

  /**
   * Génère un identifiant unique aléatoire (jti)
   * @param bytes - Nombre de bytes (default: 16 = 32 caractères hex)
   * @returns String hexadécimal unique
   */
  generateId(bytes: number = 16): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Génère un UUID v4 pour tokenFamily
   * @returns UUID v4 (ex: "550e8400-e29b-41d4-a716-446655440000")
   */
  generateTokenFamily(): string {
    return crypto.randomUUID();
  }

  /**
   * Génère un token aléatoire sécurisé
   * Utile pour reset password, email verification, API keys, etc.
   * @param bytes - Nombre de bytes (default: 32)
   * @returns String hexadécimal
   */
  generateSecureToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Génère un code de vérification à 6 chiffres
   * Utile pour 2FA, email verification, etc.
   * @returns Code à 6 chiffres (ex: "123456")
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ════════════════════════════════════════════════════════
  // PASSWORD RESET TOKEN
  // ════════════════════════════════════════════════════════

  /**
   * Génère un token pour reset password
   * @returns Token sécurisé + hash pour DB + expiration
   */
  generatePasswordResetToken(): {
    token: string;
    hashedToken: string;
    expiresAt: Date;
  } {
    const token = this.generateSecureToken(32);
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    return { token, hashedToken, expiresAt };
  }
}
