import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { TwoFactorService } from './two-factor.service';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
// import { Enable2FADto } from './dto/enable-2fa.dto';

@Controller('auth/2fa')
export class TwoFactorController {
  constructor(private twoFactorService: TwoFactorService) {}

  @Get('setup')
  @UseGuards(JwtAuthGuard)
  async setup(@CurrentUser('userId') userId: string) {
    console.log('Generating 2FA secret for user:', userId);
    const { secret, qrCode } =
      await this.twoFactorService.generateSecret(userId);
    return { secret, qrCode };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('enable')
  enable(
    @Body() enableDto: Enable2FADto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.twoFactorService.enableTwoFactor(userId, enableDto.code);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle({ default: true, loginByEmail: true })
  async status(@CurrentUser('userId') userId: string) {
    const isEnabled = await this.twoFactorService.isTwoFactorEnabled(userId);
    return { isEnabled };
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disable(
    @Body() disableDto: Disable2FADto,
    @CurrentUser('userId') userId: string,
  ) {
    await this.twoFactorService.disableTwoFactor(userId, disableDto.code);
    return { message: 'Two-factor authentication disabled' };
  }
}
