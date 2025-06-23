import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtRefreshPayload } from '../../common/types/auth.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretOrKey = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(
    payload: JwtRefreshPayload,
  ): Promise<{ userId: string; tokenId: string }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: { include: { tenant: true } } },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!refreshToken.user.isActive || !refreshToken.user.tenant.isActive) {
      throw new UnauthorizedException('User or tenant is inactive');
    }

    return {
      userId: refreshToken.user.id,
      tokenId: refreshToken.id,
    };
  }
}
