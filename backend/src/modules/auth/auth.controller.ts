import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ActivityService } from '../activity/activity.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private activityService: ActivityService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async logIn(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = {
      deviceId: crypto.randomUUID(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(
        loginDto,
        deviceInfo,
      );
      await this.activityService.logActivity({
        action: 'LOGIN_SUCCESS',
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { accessToken, user };
    } catch (error) {
      await this.activityService.logActivity({
        action: 'LOGIN_FAILURE',
        userId: null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
    await this.activityService.logActivity({
      action: 'TOKEN_REFRESH',
      userId: tokens.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      accessToken: tokens.accessToken,
      expiresIn: 900,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    await this.authService.changePassword({
      userId,
      currentPassword: changePasswordDto.currentPassword,
      newPassword: changePasswordDto.newPassword,
    });

    await this.activityService.logActivity({
      action: 'PASSWORD_CHANGE',
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    await this.activityService.logActivity({
      action: 'LOGOUT',
      userId: req.user ? req.user['userId'] : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Logged out successfully' };
  }
}
