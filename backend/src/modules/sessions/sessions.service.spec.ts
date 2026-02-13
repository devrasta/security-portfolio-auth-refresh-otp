import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: any;
  let originalFetch: typeof global.fetch;

  const mockPrismaService = {
    refreshToken: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    originalFetch = global.fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveSessions', () => {
    it('should query with userId and isRevoked:false', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([]);

      await service.getActiveSessions('user-1');

      expect(prisma.refreshToken.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRevoked: false },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return array of active sessions', async () => {
      const sessions = [
        { id: 's1', userId: 'user-1', isRevoked: false },
        { id: 's2', userId: 'user-1', isRevoked: false },
      ];
      prisma.refreshToken.findMany.mockResolvedValue(sessions);

      const result = await service.getActiveSessions('user-1');
      expect(result).toEqual(sessions);
    });

    it('should return empty array when no active sessions', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([]);
      const result = await service.getActiveSessions('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('getLocationFromIP (private)', () => {
    it('should fetch from ipapi.co with correct IP', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ country_name: 'France', city: 'Paris' }),
      });
      global.fetch = mockFetch;

      const result = await (service as any).getLocationFromIP('1.2.3.4');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://ipapi.co/1.2.3.4/json/',
        expect.objectContaining({ signal: expect.any(Object) }),
      );
      expect(result).toEqual({ country: 'France', city: 'Paris' });
    });

    it('should return nulls when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await (service as any).getLocationFromIP('1.2.3.4');

      expect(result).toEqual({ country: null, city: null });
    });

    it('should return nulls on timeout', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));

      const result = await (service as any).getLocationFromIP('1.2.3.4');

      expect(result).toEqual({ country: null, city: null });
    });
  });
});
