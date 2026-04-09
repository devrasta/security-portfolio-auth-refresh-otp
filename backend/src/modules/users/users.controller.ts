import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('2fa')
  @UseGuards(JwtAuthGuard)
  async toggleTwoFactor(
    @Body('enabled') enabled: boolean,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    return this.usersService.toggleTwoFactor(userId, enabled);
  }
}
