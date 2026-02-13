import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { UAParser } from 'ua-parser-js';
// import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  //   async createSession(createSession: CreateSessionDto) {
  //     const parser = new UAParser(createSession.userAgent);
  //     const deviceInfo = parser.getResult();

  //     return this.prisma.refreshToken.create({
  //       data: {
  //         userId: createSession.userId,
  //         ipAddress: createSession.ipAddress,
  //         userAgent: createSession.userAgent,
  //         deviceInfo: deviceInfo,
  //       },
  //     });
  //   }
  async getActiveSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async getLocationFromIP(ipAddress: string) {
    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
        signal: AbortSignal.timeout(3000),
      });
      const data = await response.json();

      return {
        country: data.country_name,
        city: data.city,
      };
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      return { country: null, city: null };
    }
  }
}
