import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
