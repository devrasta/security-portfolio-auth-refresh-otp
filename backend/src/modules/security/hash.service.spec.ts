import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('$argon2id$mocked-hash'),
  verify: jest.fn().mockResolvedValue(true),
  argon2id: 2,
}));

import * as argon2 from 'argon2';

describe('HashService', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    service = module.get<HashService>(HashService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should call argon2.hash with correct options', async () => {
      await service.hashPassword('mypassword');

      expect(argon2.hash).toHaveBeenCalledWith('mypassword', {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    });

    it('should return the hashed value from argon2', async () => {
      const result = await service.hashPassword('mypassword');
      expect(result).toBe('$argon2id$mocked-hash');
    });

    it('should propagate errors from argon2.hash', async () => {
      (argon2.hash as jest.Mock).mockRejectedValueOnce(new Error('hash error'));
      await expect(service.hashPassword('mypassword')).rejects.toThrow(
        'hash error',
      );
    });
  });

  describe('verifyPassword', () => {
    it('should return true when argon2.verify returns true', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      const result = await service.verifyPassword('$hash', 'password');
      expect(result).toBe(true);
    });

    it('should return false when argon2.verify returns false', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      const result = await service.verifyPassword('$hash', 'wrong');
      expect(result).toBe(false);
    });

    it('should call argon2.verify with correct argument order', async () => {
      await service.verifyPassword('$hashed', 'plain');
      expect(argon2.verify).toHaveBeenCalledWith('$hashed', 'plain');
    });

    it('should propagate errors from argon2.verify', async () => {
      (argon2.verify as jest.Mock).mockRejectedValueOnce(
        new Error('verify error'),
      );
      await expect(service.verifyPassword('$hash', 'pass')).rejects.toThrow(
        'verify error',
      );
    });
  });

  describe('hashToken', () => {
    it('should return a 64-character hex string', () => {
      const hash = service.hashToken('test-token');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('should return deterministic output for the same input', () => {
      const hash1 = service.hashToken('same');
      const hash2 = service.hashToken('same');
      expect(hash1).toBe(hash2);
    });

    it('should return different output for different inputs', () => {
      const hash1 = service.hashToken('token-a');
      const hash2 = service.hashToken('token-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compareTokens', () => {
    it('should return true for identical tokens', () => {
      expect(service.compareTokens('same-token', 'same-token')).toBe(true);
    });

    it('should return false for different tokens', () => {
      expect(service.compareTokens('token-a', 'token-b')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should return a 32-character hex string by default', () => {
      const id = service.generateId();
      expect(id).toHaveLength(32);
      expect(id).toMatch(/^[0-9a-f]+$/);
    });

    it('should return correct length for custom byte count', () => {
      const id = service.generateId(8);
      expect(id).toHaveLength(16);
    });

    it('should return unique values on successive calls', () => {
      const id1 = service.generateId();
      const id2 = service.generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateTokenFamily', () => {
    it('should return a valid UUID v4 string', () => {
      const uuid = service.generateTokenFamily();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('should return unique values on successive calls', () => {
      const uuid1 = service.generateTokenFamily();
      const uuid2 = service.generateTokenFamily();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateSecureToken', () => {
    it('should return a 64-character hex string by default', () => {
      const token = service.generateSecureToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should return correct length for custom byte count', () => {
      const token = service.generateSecureToken(16);
      expect(token).toHaveLength(32);
    });

    it('should return unique values on successive calls', () => {
      const t1 = service.generateSecureToken();
      const t2 = service.generateSecureToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe('generateVerificationCode', () => {
    it('should return a 6-digit string', () => {
      const code = service.generateVerificationCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain numeric characters', () => {
      const code = service.generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should be between 100000 and 999999', () => {
      const code = service.generateVerificationCode();
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should return an object with token, hashedToken, and expiresAt', () => {
      const result = service.generatePasswordResetToken();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('hashedToken');
      expect(result).toHaveProperty('expiresAt');
    });

    it('should return a 64-character hex token', () => {
      const { token } = service.generatePasswordResetToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should return a hashedToken that is the SHA-256 of token', () => {
      const { token, hashedToken } = service.generatePasswordResetToken();
      expect(hashedToken).toBe(service.hashToken(token));
    });

    it('should set expiresAt to approximately 1 hour from now', () => {
      const before = Date.now();
      const { expiresAt } = service.generatePasswordResetToken();
      const after = Date.now();

      const oneHourMs = 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + oneHourMs - 100,
      );
      expect(expiresAt.getTime()).toBeLessThanOrEqual(after + oneHourMs + 100);
    });
  });
});
