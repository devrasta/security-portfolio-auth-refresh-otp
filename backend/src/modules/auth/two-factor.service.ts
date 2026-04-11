import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import { toDataURL } from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../security/hash.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  async generateSecret(
    userId: string,
  ): Promise<{ secret: string; qrCode: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const secret = generateSecret();
    const qrCode = await toDataURL(
      generateURI({
        issuer: 'Auth Secure System overstand',
        label: user.email,
        secret,
        strategy: 'totp',
      }),
    );
    await this.prisma.twoFactorSecret.upsert({
      where: { userId },
      update: { secret, isEnabled: false },
      create: { userId, secret, isEnabled: false, backupCodes: [] },
    });

    return { secret, qrCode };
  }

  async enableTwoFactor(
    userId: string,
    token: string,
  ): Promise<{ backupCodes: string[] }> {
    const twoFactorSecret = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactorSecret) {
      throw new BadRequestException(
        '2FA not initialized. Generate secret first.',
      );
    }

    // ✅ Vérifier le token TOTP
    const result = await verify({
      secret: twoFactorSecret.secret,
      token,
    });

    if (!result.valid) {
      throw new BadRequestException('Invalid 2FA code');
    }
    const backupCodes = this.generateBackupCodes(10);

    // Hasher avec argon2
    const hashedCodes = await Promise.all(
      backupCodes.map((code) => this.hashService.hashPassword(code)),
    );

    // Activer le 2FA
    await this.prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        isEnabled: true,
        backupCodes: hashedCodes,
      },
    });

    return { backupCodes };
  }
}
