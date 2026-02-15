import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { HashService } from '@/modules/security/hash.service';
import { TokenService } from '@/modules/security/token.service';
import { ValidationService } from '@/modules/security/validation.service';
import { JwtManagerService } from '@/modules/security/jwtManager.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

interface IRefreshTokenPayload {
  userId: string;
  tokenFamily: string;
  deviceInfo?: {
    deviceId?: string;
    userAgent?: string | string[];
    ipAddress?: string;
  };
}
interface IDeviceInfo {
  deviceId: string;
  userAgent: string | string[];
  ipAddress: string;
}
@Injectable()
export class AuthService {
  constructor(
    private hashService: HashService,
    private jwtService: JwtManagerService,
    private validationService: ValidationService,
    private tokenService: TokenService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    if (!this.validationService.isValidEmail(dto.email)) {
      throw new BadRequestException('Invalid email');
    }
    if (!this.validationService.isStrongPassword(dto.password)) {
      throw new BadRequestException('Weak password');
    }

    const hashedPassword = await this.hashService.hashPassword(dto.password);

    const verificationToken = this.tokenService.generateVerificationToken();

    return this.usersService.createUser({
      ...dto,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
    });
  }

  async login(loginParams: LoginDto, deviceInfo?: IDeviceInfo) {
    const tokenFamily = crypto.randomUUID();
    const user = await this.usersService.findByEmail(loginParams.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.hashService.verifyPassword(
      user.password,
      loginParams.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
      }),
      this.generateRefreshToken({
        userId: user.id,
        tokenFamily,
        deviceInfo: deviceInfo || ({} as IDeviceInfo),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name },
    };
  }

  async generateRefreshToken({
    userId,
    tokenFamily,
    deviceInfo,
  }: IRefreshTokenPayload) {
    const jti = crypto.randomBytes(16).toString('hex');

    const refreshToken = await this.jwtService.generateRefreshToken(
      userId,
      tokenFamily,
    );

    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId,
        token: this.hashService.hashToken(refreshToken),
        tokenFamily,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
        deviceId: deviceInfo.deviceId,
        userAgent: Array.isArray(deviceInfo.userAgent)
          ? deviceInfo.userAgent.join(', ')
          : deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
      },
    });

    return refreshToken;
  }

  async verifyRefreshToken(token: string) {
    // Vérifie le JWT et le token en DB (validité, révocation)
    const { userId, tokenFamily, jti } =
      await this.jwtService.verifyRefreshToken(token);

    // Récupère l'utilisateur associé
    const user = await this.usersService.findById(userId);

    return { user, tokenFamily, jti };
  }

  async refresh(refreshToken: string) {
    // Vérifie et récupère les infos du token
    const { user, tokenFamily, jti } =
      await this.verifyRefreshToken(refreshToken);

    // Révoque l'ancien token
    await this.prisma.refreshToken.update({
      where: { jti },
      data: { isRevoked: true },
    });

    // Génère les nouveaux tokens (même famille pour la rotation)
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
      }),
      this.jwtService.generateRefreshToken(user.id, tokenFamily),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, name: user.name },
    };
  }

  async logout(refreshToken: string) {
    const { jti } = await this.verifyRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: { jti },
      data: { isRevoked: true },
    });
  }

  async changePassword(changePasswordParams: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const { userId, currentPassword, newPassword } = changePasswordParams;
    const user = await this.usersService.findById(userId);
    const isValid = await this.hashService.verifyPassword(
      user.password,
      currentPassword,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await this.hashService.hashPassword(newPassword);

    await this.usersService.updatePassword(userId, hashedNewPassword);
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
