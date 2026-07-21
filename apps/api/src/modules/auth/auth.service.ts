import { createHash, randomInt } from 'node:crypto';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { AuthResponse, TokenPair } from '@cleansource/contracts';

import type { JwtPayload } from '../../common/current-user.decorator';
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

    const tokens = await this.issueTokens(user.id, user.phone);

    return {
      ...tokens,
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

  /**
   * Exchanges a valid refresh token for a fresh access/refresh pair.
   * Refresh tokens carry `typ: 'refresh'` so they can never be used as
   * access tokens (the auth guard rejects them).
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Not a refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('Unknown user');

    return this.issueTokens(user.id, user.phone);
  }

  private async issueTokens(userId: string, phone: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, phone }),
      this.jwtService.signAsync(
        { sub: userId, phone, typ: 'refresh' },
        {
          expiresIn: (this.config.get<string>('REFRESH_EXPIRES_IN') ??
            '30d') as JwtSignOptions['expiresIn'],
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
