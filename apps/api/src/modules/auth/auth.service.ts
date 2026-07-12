import { createHash, randomInt } from 'node:crypto';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { AuthResponse, AuthUser, TokenPair } from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';

const OTP_TTL_MS = 5 * 60 * 1000;

const hashCode = (code: string) =>
  createHash('sha256').update(code).digest('hex');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(phone: string): Promise<{ sent: boolean }> {
    const code = randomInt(0, 10_000).toString().padStart(4, '0');

    await this.prisma.otpCode.create({
      data: {
        phone,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    // TODO(production): send via SMS provider (e.g. Unifonic / Taqnyat).
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.debug(`OTP for ${phone}: ${code}`);
    }

    return { sent: true };
  }

  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.codeHash !== hashCode(code)) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumed: true },
    });

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    const user =
      existing ??
      (await this.prisma.user.create({
        data: { phone, wallet: { create: {} } },
      }));

    const payload = { sub: user.id, phone: user.phone };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: (this.config.get<string>('REFRESH_EXPIRES_IN') ??
          '30d') as JwtSignOptions['expiresIn'],
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      isNewUser: !existing,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        language: user.language,
      },
    };
  }

  /** Restores the session on app launch. */
  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account no longer exists');
    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
    };
  }

  /** Exchanges a valid refresh token for a fresh token pair. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; phone: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        phone: string;
      }>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('Account no longer exists');

    const fresh = { sub: user.id, phone: user.phone };
    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(fresh),
      this.jwtService.signAsync(fresh, {
        expiresIn: (this.config.get<string>('REFRESH_EXPIRES_IN') ??
          '30d') as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { accessToken, refreshToken: newRefreshToken };
  }
}
