import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prismaService.refreshToken.create({ data });
  }

  findActiveByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prismaService.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
