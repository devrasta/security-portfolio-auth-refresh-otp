// src/modules/activity/activity.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '@/modules/security/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/security/decorators/current-user.decorator';
import { User, ActivityAction } from '@/modules/prisma/generated/client';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getActivityLogs(
    @CurrentUser() user: User,
    @Query('action') action?: ActivityAction,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.activityService.getActivityLogs({
      userId: user.id,
      action,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('recent')
  async getRecentActivity(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getRecentActivity(
      user.id,
      limit ? parseInt(limit) : 10,
    );
  }
}
